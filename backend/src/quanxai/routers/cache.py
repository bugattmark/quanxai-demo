"""Cache Metrics API endpoints."""
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select, func
from typing import Optional, List
from datetime import datetime, timedelta
from pydantic import BaseModel

from quanxai.database import get_session, CacheEntry, CacheMetrics as CacheMetricsModel, UsageLog

router = APIRouter()


class CacheConfig(BaseModel):
    """Cache configuration."""
    enabled: bool = True
    default_ttl: int = 3600
    max_cache_size: int = 1073741824  # 1GB
    eviction_policy: str = "lru"
    semantic_caching: bool = True
    similarity_threshold: float = 0.95


class CacheMetricsResponse(BaseModel):
    """Cache metrics response."""
    hit_rate: float
    total_hits: int
    total_misses: int
    total_tokens_saved: int
    total_cost_saved: float
    cache_size: int
    max_cache_size: int
    entries_count: int


class CacheHitsTrend(BaseModel):
    """Cache hits trend data point."""
    hour: str
    hits: int
    misses: int


class CacheByModel(BaseModel):
    """Cache stats by model."""
    model: str
    entries: int
    hits: int
    tokens_saved: int
    cost_saved: float


class DailyCacheSavings(BaseModel):
    """Daily cache savings."""
    date: str
    cost_saved: float
    tokens_saved: int


class TopCachedPrompt(BaseModel):
    """Top cached prompt entry."""
    id: str
    prompt_preview: str
    model: str
    hit_count: int
    tokens_saved: int
    cost_saved: float
    last_hit: Optional[datetime]


# In-memory cache config (would be stored in database in production)
_cache_config = CacheConfig()


@router.get("/config", response_model=CacheConfig)
def get_cache_config():
    """Get current cache configuration."""
    return _cache_config


@router.put("/config", response_model=CacheConfig)
def update_cache_config(config: CacheConfig):
    """Update cache configuration."""
    global _cache_config
    _cache_config = config
    return _cache_config


@router.get("/metrics", response_model=CacheMetricsResponse)
def get_cache_metrics(
    range: str = Query("last30days"),
    session: Session = Depends(get_session)
):
    """Get cache metrics for dashboard."""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=30 if range == "last30days" else 7)

    # Get aggregated metrics
    result = session.exec(
        select(
            func.sum(CacheMetricsModel.total_hits).label("total_hits"),
            func.sum(CacheMetricsModel.total_misses).label("total_misses"),
            func.sum(CacheMetricsModel.tokens_saved).label("tokens_saved"),
            func.sum(CacheMetricsModel.cost_saved_usd).label("cost_saved"),
        )
        .where(CacheMetricsModel.date >= start_date)
    ).first()

    # Calculate from cache entries if no metrics table data
    entries_count = session.exec(select(func.count(CacheEntry.id))).first() or 0

    total_hits = result.total_hits or 0
    total_misses = result.total_misses or 0

    # If no data in metrics table, calculate from cache entries
    if total_hits == 0 and total_misses == 0:
        entry_stats = session.exec(
            select(
                func.sum(CacheEntry.hit_count).label("hits"),
                func.sum(CacheEntry.miss_count).label("misses"),
                func.sum(CacheEntry.tokens_saved).label("tokens"),
                func.sum(CacheEntry.cost_saved_usd).label("cost"),
            )
        ).first()

        total_hits = entry_stats.hits or 0
        total_misses = entry_stats.misses or 0
        tokens_saved = entry_stats.tokens or 0
        cost_saved = float(entry_stats.cost or 0)
    else:
        tokens_saved = result.tokens_saved or 0
        cost_saved = float(result.cost_saved or 0)

    total_requests = total_hits + total_misses
    hit_rate = (total_hits / total_requests * 100) if total_requests > 0 else 0

    # Estimate cache size from entries
    cache_size = session.exec(
        select(func.sum(CacheEntry.tokens_cached))
    ).first() or 0
    cache_size_bytes = (cache_size or 0) * 4  # Rough estimate: 4 bytes per token

    return CacheMetricsResponse(
        hit_rate=hit_rate,
        total_hits=total_hits,
        total_misses=total_misses,
        total_tokens_saved=tokens_saved,
        total_cost_saved=cost_saved,
        cache_size=cache_size_bytes,
        max_cache_size=_cache_config.max_cache_size,
        entries_count=entries_count,
    )


@router.get("/hits-trend", response_model=List[CacheHitsTrend])
def get_cache_hits_trend(
    range: str = Query("last24hours"),
    session: Session = Depends(get_session)
):
    """Get cache hits trend over time."""
    end_date = datetime.utcnow()

    if range == "last24hours":
        start_date = end_date - timedelta(hours=24)
        interval = timedelta(hours=1)
    else:
        start_date = end_date - timedelta(days=7)
        interval = timedelta(hours=6)

    result = []
    current_time = start_date

    while current_time <= end_date:
        next_time = current_time + interval

        # Get metrics for this time period
        metrics = session.exec(
            select(CacheMetricsModel)
            .where(CacheMetricsModel.date >= current_time)
            .where(CacheMetricsModel.date < next_time)
        ).all()

        hits = sum(m.total_hits for m in metrics) if metrics else 0
        misses = sum(m.total_misses for m in metrics) if metrics else 0

        # If no metrics data, estimate from usage logs
        if hits == 0 and misses == 0:
            usage_stats = session.exec(
                select(
                    func.sum(UsageLog.cache_read_tokens).label("cache_read"),
                    func.count(UsageLog.id).label("total"),
                )
                .where(UsageLog.created_at >= current_time)
                .where(UsageLog.created_at < next_time)
            ).first()

            if usage_stats and usage_stats.total:
                # Estimate hits based on cache tokens
                cache_read = usage_stats.cache_read or 0
                total = usage_stats.total or 1
                hits = int(total * (0.3 + (cache_read / 1000000) * 0.2))  # Rough estimate
                misses = total - hits

        result.append(CacheHitsTrend(
            hour=current_time.isoformat(),
            hits=hits,
            misses=misses,
        ))

        current_time = next_time

    return result


@router.get("/by-model", response_model=List[CacheByModel])
def get_cache_by_model(session: Session = Depends(get_session)):
    """Get cache stats by model."""
    results = session.exec(
        select(
            CacheEntry.model,
            func.count(CacheEntry.id).label("entries"),
            func.sum(CacheEntry.hit_count).label("hits"),
            func.sum(CacheEntry.tokens_saved).label("tokens_saved"),
            func.sum(CacheEntry.cost_saved_usd).label("cost_saved"),
        )
        .group_by(CacheEntry.model)
        .order_by(func.sum(CacheEntry.cost_saved_usd).desc())
    ).all()

    return [
        CacheByModel(
            model=r.model,
            entries=r.entries,
            hits=r.hits or 0,
            tokens_saved=r.tokens_saved or 0,
            cost_saved=float(r.cost_saved or 0),
        )
        for r in results
    ]


@router.get("/daily-savings", response_model=List[DailyCacheSavings])
def get_daily_cache_savings(
    range: str = Query("last30days"),
    session: Session = Depends(get_session)
):
    """Get daily cache savings."""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=30 if range == "last30days" else 7)

    result = []
    current_date = start_date.date()

    while current_date <= end_date.date():
        next_date = current_date + timedelta(days=1)

        day_metrics = session.exec(
            select(CacheMetricsModel)
            .where(CacheMetricsModel.date >= datetime.combine(current_date, datetime.min.time()))
            .where(CacheMetricsModel.date < datetime.combine(next_date, datetime.min.time()))
        ).all()

        cost_saved = sum(m.cost_saved_usd for m in day_metrics) if day_metrics else 0
        tokens_saved = sum(m.tokens_saved for m in day_metrics) if day_metrics else 0

        result.append(DailyCacheSavings(
            date=current_date.isoformat(),
            cost_saved=cost_saved,
            tokens_saved=tokens_saved,
        ))

        current_date = next_date

    return result


@router.get("/top-prompts", response_model=List[TopCachedPrompt])
def get_top_cached_prompts(
    limit: int = Query(10, le=50),
    session: Session = Depends(get_session)
):
    """Get top cached prompts by hit count."""
    entries = session.exec(
        select(CacheEntry)
        .order_by(CacheEntry.hit_count.desc())
        .limit(limit)
    ).all()

    return [
        TopCachedPrompt(
            id=e.id,
            prompt_preview=f"Prompt hash: {e.prompt_hash[:8]}...",
            model=e.model,
            hit_count=e.hit_count,
            tokens_saved=e.tokens_saved,
            cost_saved=e.cost_saved_usd,
            last_hit=e.last_hit_at,
        )
        for e in entries
    ]


@router.get("/utilization")
def get_cache_utilization(session: Session = Depends(get_session)):
    """Get cache utilization stats."""
    # Calculate total cached tokens
    total_cached = session.exec(
        select(func.sum(CacheEntry.tokens_cached))
    ).first() or 0

    # Estimate size (4 bytes per token)
    used_bytes = (total_cached or 0) * 4
    max_bytes = _cache_config.max_cache_size
    available_bytes = max_bytes - used_bytes

    percent_used = (used_bytes / max_bytes * 100) if max_bytes > 0 else 0

    return {
        "used": used_bytes,
        "available": available_bytes,
        "total": max_bytes,
        "percent_used": percent_used,
    }


@router.delete("/clear")
def clear_cache(session: Session = Depends(get_session)):
    """Clear all cache entries."""
    # Delete all cache entries
    entries = session.exec(select(CacheEntry)).all()
    for entry in entries:
        session.delete(entry)
    session.commit()

    return {"message": "Cache cleared successfully", "entries_deleted": len(entries)}


@router.delete("/entry/{entry_id}")
def delete_cache_entry(entry_id: str, session: Session = Depends(get_session)):
    """Delete a specific cache entry."""
    entry = session.get(CacheEntry, entry_id)
    if not entry:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Cache entry not found")

    session.delete(entry)
    session.commit()

    return {"message": "Cache entry deleted successfully"}

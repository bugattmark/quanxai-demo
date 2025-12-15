"""Usage Analytics API endpoints."""
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select, func
from typing import Optional, List
from datetime import datetime, timedelta
from pydantic import BaseModel

from quanxai.database import get_session, UsageLog, Team, User, APIKey, Tag

router = APIRouter()


class UsageSummary(BaseModel):
    """Usage summary metrics."""
    total_spend: float
    total_requests: int
    total_input_tokens: int
    total_output_tokens: int
    total_tokens: int
    error_rate: float
    avg_latency_ms: float
    p95_latency_ms: float
    cache_hit_rate: float


class DailyUsage(BaseModel):
    """Daily usage data point."""
    date: str
    spend: float
    requests: int
    input_tokens: int
    output_tokens: int
    errors: int


class TopKey(BaseModel):
    """Top spending key."""
    key_id: str
    key_alias: str
    team_name: Optional[str]
    spend: float
    requests: int


class ModelUsage(BaseModel):
    """Model usage breakdown."""
    model: str
    provider: str
    spend: float
    requests: int
    tokens: int
    percentage: float


@router.get("/summary", response_model=UsageSummary)
def get_usage_summary(
    range: str = Query("last30days"),
    team_id: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    tag_id: Optional[str] = Query(None),
    session: Session = Depends(get_session)
):
    """Get overall usage summary."""
    end_date = datetime.utcnow()
    if range == "last7days":
        start_date = end_date - timedelta(days=7)
    elif range == "last30days":
        start_date = end_date - timedelta(days=30)
    elif range == "last90days":
        start_date = end_date - timedelta(days=90)
    else:
        start_date = end_date - timedelta(days=30)

    # Build base query
    query_filter = [UsageLog.created_at >= start_date, UsageLog.created_at <= end_date]
    if team_id:
        query_filter.append(UsageLog.team_id == team_id)
    if user_id:
        query_filter.append(UsageLog.user_id == user_id)
    if tag_id:
        query_filter.append(UsageLog.tags.contains(tag_id))

    # Main aggregates
    result = session.exec(
        select(
            func.count(UsageLog.id).label("total_requests"),
            func.sum(UsageLog.prompt_tokens).label("input_tokens"),
            func.sum(UsageLog.completion_tokens).label("output_tokens"),
            func.sum(UsageLog.total_tokens).label("total_tokens"),
            func.sum(UsageLog.total_cost_usd).label("total_spend"),
            func.avg(UsageLog.latency_ms).label("avg_latency"),
            func.sum(UsageLog.cache_read_tokens).label("cache_read"),
        )
        .where(*query_filter)
    ).first()

    # Error count
    error_count = session.exec(
        select(func.count(UsageLog.id))
        .where(*query_filter)
        .where(UsageLog.is_success == False)
    ).first() or 0

    # P95 latency
    latencies = session.exec(
        select(UsageLog.latency_ms)
        .where(*query_filter)
        .order_by(UsageLog.latency_ms)
    ).all()

    p95_latency = 0.0
    if latencies:
        p95_index = int(len(latencies) * 0.95)
        p95_latency = float(latencies[min(p95_index, len(latencies) - 1)])

    total_requests = result.total_requests or 0
    total_tokens = result.total_tokens or 0
    cache_read = result.cache_read or 0

    return UsageSummary(
        total_spend=float(result.total_spend or 0),
        total_requests=total_requests,
        total_input_tokens=result.input_tokens or 0,
        total_output_tokens=result.output_tokens or 0,
        total_tokens=total_tokens,
        error_rate=(error_count / total_requests * 100) if total_requests > 0 else 0,
        avg_latency_ms=float(result.avg_latency or 0),
        p95_latency_ms=p95_latency,
        cache_hit_rate=(cache_read / total_tokens * 100) if total_tokens > 0 else 0,
    )


@router.get("/daily", response_model=List[DailyUsage])
def get_daily_usage(
    range: str = Query("last30days"),
    team_id: Optional[str] = Query(None),
    session: Session = Depends(get_session)
):
    """Get daily usage breakdown."""
    end_date = datetime.utcnow()
    if range == "last7days":
        start_date = end_date - timedelta(days=7)
    elif range == "last30days":
        start_date = end_date - timedelta(days=30)
    else:
        start_date = end_date - timedelta(days=30)

    result = []
    current_date = start_date.date()

    while current_date <= end_date.date():
        next_date = current_date + timedelta(days=1)

        query_filter = [
            UsageLog.created_at >= datetime.combine(current_date, datetime.min.time()),
            UsageLog.created_at < datetime.combine(next_date, datetime.min.time()),
        ]
        if team_id:
            query_filter.append(UsageLog.team_id == team_id)

        day_result = session.exec(
            select(
                func.sum(UsageLog.total_cost_usd).label("spend"),
                func.count(UsageLog.id).label("requests"),
                func.sum(UsageLog.prompt_tokens).label("input_tokens"),
                func.sum(UsageLog.completion_tokens).label("output_tokens"),
            )
            .where(*query_filter)
        ).first()

        error_count = session.exec(
            select(func.count(UsageLog.id))
            .where(*query_filter)
            .where(UsageLog.is_success == False)
        ).first() or 0

        result.append(DailyUsage(
            date=current_date.isoformat(),
            spend=float(day_result.spend or 0),
            requests=day_result.requests or 0,
            input_tokens=day_result.input_tokens or 0,
            output_tokens=day_result.output_tokens or 0,
            errors=error_count,
        ))

        current_date = next_date

    return result


@router.get("/by-team")
def get_usage_by_team(
    range: str = Query("last30days"),
    session: Session = Depends(get_session)
):
    """Get usage breakdown by team."""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=30 if range == "last30days" else 7)

    results = session.exec(
        select(
            Team.id,
            Team.name,
            Team.monthly_budget_usd,
            func.count(UsageLog.id).label("requests"),
            func.sum(UsageLog.total_tokens).label("tokens"),
            func.sum(UsageLog.total_cost_usd).label("spend"),
        )
        .join(Team, UsageLog.team_id == Team.id)
        .where(UsageLog.created_at >= start_date)
        .group_by(Team.id, Team.name, Team.monthly_budget_usd)
        .order_by(func.sum(UsageLog.total_cost_usd).desc())
    ).all()

    total_spend = sum(float(r.spend or 0) for r in results) or 1

    return [
        {
            "team_id": r.id,
            "team_name": r.name,
            "budget": r.monthly_budget_usd,
            "spend": float(r.spend or 0),
            "budget_used_percent": (float(r.spend or 0) / r.monthly_budget_usd * 100) if r.monthly_budget_usd > 0 else 0,
            "requests": r.requests,
            "tokens": r.tokens or 0,
            "percentage": (float(r.spend or 0) / total_spend * 100),
        }
        for r in results
    ]


@router.get("/by-tag")
def get_usage_by_tag(
    range: str = Query("last30days"),
    session: Session = Depends(get_session)
):
    """Get usage breakdown by tag."""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=30 if range == "last30days" else 7)

    # Get all tags
    tags = session.exec(select(Tag)).all()

    result = []
    total_spend = 0.0

    for tag in tags:
        # Count logs that contain this tag
        tag_result = session.exec(
            select(
                func.count(UsageLog.id).label("requests"),
                func.sum(UsageLog.total_tokens).label("tokens"),
                func.sum(UsageLog.total_cost_usd).label("spend"),
            )
            .where(UsageLog.created_at >= start_date)
            .where(UsageLog.tags.contains(tag.id))
        ).first()

        spend = float(tag_result.spend or 0)
        total_spend += spend

        result.append({
            "tag_id": tag.id,
            "tag_name": tag.name,
            "color": tag.color,
            "requests": tag_result.requests or 0,
            "tokens": tag_result.tokens or 0,
            "spend": spend,
        })

    # Add percentages
    for item in result:
        item["percentage"] = (item["spend"] / total_spend * 100) if total_spend > 0 else 0

    return sorted(result, key=lambda x: x["spend"], reverse=True)


@router.get("/by-model", response_model=List[ModelUsage])
def get_usage_by_model(
    range: str = Query("last30days"),
    session: Session = Depends(get_session)
):
    """Get usage breakdown by model."""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=30 if range == "last30days" else 7)

    results = session.exec(
        select(
            UsageLog.model_used,
            UsageLog.provider,
            func.count(UsageLog.id).label("requests"),
            func.sum(UsageLog.total_tokens).label("tokens"),
            func.sum(UsageLog.total_cost_usd).label("spend"),
        )
        .where(UsageLog.created_at >= start_date)
        .group_by(UsageLog.model_used, UsageLog.provider)
        .order_by(func.sum(UsageLog.total_cost_usd).desc())
    ).all()

    total_spend = sum(float(r.spend or 0) for r in results) or 1

    return [
        ModelUsage(
            model=r.model_used,
            provider=r.provider,
            spend=float(r.spend or 0),
            requests=r.requests,
            tokens=r.tokens or 0,
            percentage=(float(r.spend or 0) / total_spend * 100),
        )
        for r in results
    ]


@router.get("/by-key", response_model=List[TopKey])
def get_usage_by_key(
    range: str = Query("last30days"),
    limit: int = Query(10, le=50),
    session: Session = Depends(get_session)
):
    """Get usage breakdown by API key."""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=30 if range == "last30days" else 7)

    results = session.exec(
        select(
            APIKey.id,
            APIKey.alias,
            Team.name.label("team_name"),
            func.count(UsageLog.id).label("requests"),
            func.sum(UsageLog.total_cost_usd).label("spend"),
        )
        .join(APIKey, UsageLog.api_key_id == APIKey.id)
        .outerjoin(Team, APIKey.team_id == Team.id)
        .where(UsageLog.created_at >= start_date)
        .group_by(APIKey.id, APIKey.alias, Team.name)
        .order_by(func.sum(UsageLog.total_cost_usd).desc())
        .limit(limit)
    ).all()

    return [
        TopKey(
            key_id=r.id,
            key_alias=r.alias or "Unnamed Key",
            team_name=r.team_name,
            spend=float(r.spend or 0),
            requests=r.requests,
        )
        for r in results
    ]


@router.get("/top-keys", response_model=List[TopKey])
def get_top_spending_keys(
    range: str = Query("last30days"),
    limit: int = Query(10, le=50),
    session: Session = Depends(get_session)
):
    """Get top spending API keys (alias for by-key)."""
    return get_usage_by_key(range, limit, session)


@router.get("/by-customer")
def get_usage_by_customer(
    range: str = Query("last30days"),
    session: Session = Depends(get_session)
):
    """Get usage breakdown by customer/user."""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=30 if range == "last30days" else 7)

    results = session.exec(
        select(
            User.id,
            User.name,
            User.email,
            Team.name.label("team_name"),
            func.count(UsageLog.id).label("requests"),
            func.sum(UsageLog.total_tokens).label("tokens"),
            func.sum(UsageLog.total_cost_usd).label("spend"),
        )
        .join(User, UsageLog.user_id == User.id)
        .outerjoin(Team, User.team_id == Team.id)
        .where(UsageLog.created_at >= start_date)
        .group_by(User.id, User.name, User.email, Team.name)
        .order_by(func.sum(UsageLog.total_cost_usd).desc())
    ).all()

    total_spend = sum(float(r.spend or 0) for r in results) or 1

    return [
        {
            "user_id": r.id,
            "user_name": r.name,
            "email": r.email,
            "team_name": r.team_name,
            "requests": r.requests,
            "tokens": r.tokens or 0,
            "spend": float(r.spend or 0),
            "percentage": (float(r.spend or 0) / total_spend * 100),
        }
        for r in results
    ]


@router.get("/tokens-over-time")
def get_tokens_over_time(
    range: str = Query("last30days"),
    session: Session = Depends(get_session)
):
    """Get token usage over time (input vs output)."""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=30 if range == "last30days" else 7)

    result = []
    current_date = start_date.date()

    while current_date <= end_date.date():
        next_date = current_date + timedelta(days=1)

        day_result = session.exec(
            select(
                func.sum(UsageLog.prompt_tokens).label("input_tokens"),
                func.sum(UsageLog.completion_tokens).label("output_tokens"),
            )
            .where(UsageLog.created_at >= datetime.combine(current_date, datetime.min.time()))
            .where(UsageLog.created_at < datetime.combine(next_date, datetime.min.time()))
        ).first()

        result.append({
            "date": current_date.isoformat(),
            "input_tokens": day_result.input_tokens or 0,
            "output_tokens": day_result.output_tokens or 0,
        })

        current_date = next_date

    return result

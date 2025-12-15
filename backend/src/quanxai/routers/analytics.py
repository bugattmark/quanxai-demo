"""Analytics endpoints for dashboard."""
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select, func
from typing import Optional, List
from datetime import datetime, timedelta
from pydantic import BaseModel

from quanxai.database import get_session, UsageLog, Organization, Team, User

router = APIRouter()


class KPIMetrics(BaseModel):
    """KPI metrics response."""
    total_spend: float
    total_requests: int
    tokens_processed: int
    avg_cost_per_request: float
    success_rate: float
    avg_latency_ms: float


class SpendTrendPoint(BaseModel):
    """Single point in spend trend."""
    date: str
    spend: float
    requests: int


class ModelCost(BaseModel):
    """Cost breakdown by model."""
    name: str
    value: float
    percentage: float
    requests: int


class OrganizationAnalytics(BaseModel):
    """Complete organization analytics response."""
    kpis: KPIMetrics
    spend_trend: List[SpendTrendPoint]
    cost_by_model: List[ModelCost]


class TeamAnalytics(BaseModel):
    """Team analytics response."""
    team_id: str
    team_name: str
    kpis: KPIMetrics
    budget: float
    budget_used_percentage: float
    active_members: int
    token_efficiency: float
    daily_spend: List[SpendTrendPoint]
    cache_metrics: List[dict]


class ModelAnalytics(BaseModel):
    """Model analytics response."""
    model_id: str
    model_name: str
    provider: str
    kpis: KPIMetrics
    cache_hit_rate: float
    success_vs_failed: List[dict]
    requests_per_day: List[SpendTrendPoint]


class UserAnalytics(BaseModel):
    """User analytics response."""
    user_id: str
    user_name: str
    email: str
    role: str
    team_name: str
    kpis: KPIMetrics
    cache_hit_rate: float
    activity_timeline: List[dict]


def get_date_range(range_str: str) -> tuple[datetime, datetime]:
    """Parse date range string to start/end dates."""
    end_date = datetime.utcnow()
    if range_str == "last7days":
        start_date = end_date - timedelta(days=7)
    elif range_str == "last30days":
        start_date = end_date - timedelta(days=30)
    elif range_str == "last90days":
        start_date = end_date - timedelta(days=90)
    else:
        start_date = end_date - timedelta(days=30)  # Default
    return start_date, end_date


@router.get("/organization", response_model=OrganizationAnalytics)
def get_organization_analytics(
    range: str = Query("last30days"),
    session: Session = Depends(get_session)
):
    """Get organization-level analytics for dashboard."""
    start_date, end_date = get_date_range(range)

    # Get KPIs
    result = session.exec(
        select(
            func.count(UsageLog.id).label("total_requests"),
            func.sum(UsageLog.total_tokens).label("total_tokens"),
            func.sum(UsageLog.total_cost_usd).label("total_cost"),
            func.avg(UsageLog.latency_ms).label("avg_latency"),
        )
        .where(UsageLog.created_at >= start_date)
        .where(UsageLog.created_at <= end_date)
    ).first()

    success_count = session.exec(
        select(func.count(UsageLog.id))
        .where(UsageLog.created_at >= start_date)
        .where(UsageLog.created_at <= end_date)
        .where(UsageLog.is_success == True)
    ).first() or 0

    total_requests = result.total_requests or 0
    total_cost = float(result.total_cost or 0)
    total_tokens = result.total_tokens or 0
    avg_latency = float(result.avg_latency or 0)

    kpis = KPIMetrics(
        total_spend=total_cost,
        total_requests=total_requests,
        tokens_processed=total_tokens,
        avg_cost_per_request=total_cost / total_requests if total_requests > 0 else 0,
        success_rate=(success_count / total_requests * 100) if total_requests > 0 else 100,
        avg_latency_ms=avg_latency,
    )

    # Get spend trend by day
    spend_trend = []
    current_date = start_date
    while current_date <= end_date:
        next_date = current_date + timedelta(days=1)
        day_result = session.exec(
            select(
                func.sum(UsageLog.total_cost_usd).label("spend"),
                func.count(UsageLog.id).label("requests"),
            )
            .where(UsageLog.created_at >= current_date)
            .where(UsageLog.created_at < next_date)
        ).first()

        spend_trend.append(SpendTrendPoint(
            date=current_date.strftime("%Y-%m-%d"),
            spend=float(day_result.spend or 0),
            requests=day_result.requests or 0,
        ))
        current_date = next_date

    # Get cost by model
    model_results = session.exec(
        select(
            UsageLog.model_used,
            func.sum(UsageLog.total_cost_usd).label("cost"),
            func.count(UsageLog.id).label("requests"),
        )
        .where(UsageLog.created_at >= start_date)
        .where(UsageLog.created_at <= end_date)
        .group_by(UsageLog.model_used)
        .order_by(func.sum(UsageLog.total_cost_usd).desc())
    ).all()

    cost_by_model = []
    for r in model_results:
        cost_by_model.append(ModelCost(
            name=r.model_used,
            value=float(r.cost or 0),
            percentage=(float(r.cost or 0) / total_cost * 100) if total_cost > 0 else 0,
            requests=r.requests or 0,
        ))

    return OrganizationAnalytics(
        kpis=kpis,
        spend_trend=spend_trend,
        cost_by_model=cost_by_model,
    )


@router.get("/teams/{team_id}", response_model=TeamAnalytics)
def get_team_analytics(
    team_id: str,
    range: str = Query("last7days"),
    session: Session = Depends(get_session)
):
    """Get team-level analytics."""
    start_date, end_date = get_date_range(range)

    team = session.get(Team, team_id)
    if not team:
        team_name = "Unknown Team"
        budget = 5000.0
    else:
        team_name = team.name
        budget = team.monthly_budget_usd

    # Get KPIs for team
    result = session.exec(
        select(
            func.count(UsageLog.id).label("total_requests"),
            func.sum(UsageLog.total_tokens).label("total_tokens"),
            func.sum(UsageLog.total_cost_usd).label("total_cost"),
            func.avg(UsageLog.latency_ms).label("avg_latency"),
            func.sum(UsageLog.cache_read_tokens).label("cache_read"),
            func.sum(UsageLog.cache_creation_tokens).label("cache_creation"),
        )
        .where(UsageLog.team_id == team_id)
        .where(UsageLog.created_at >= start_date)
        .where(UsageLog.created_at <= end_date)
    ).first()

    success_count = session.exec(
        select(func.count(UsageLog.id))
        .where(UsageLog.team_id == team_id)
        .where(UsageLog.created_at >= start_date)
        .where(UsageLog.created_at <= end_date)
        .where(UsageLog.is_success == True)
    ).first() or 0

    active_members = session.exec(
        select(func.count(func.distinct(UsageLog.user_id)))
        .where(UsageLog.team_id == team_id)
        .where(UsageLog.created_at >= start_date)
        .where(UsageLog.created_at <= end_date)
    ).first() or 0

    total_requests = result.total_requests or 0
    total_cost = float(result.total_cost or 0)
    total_tokens = result.total_tokens or 0
    avg_latency = float(result.avg_latency or 0)
    cache_read = result.cache_read or 0
    cache_creation = result.cache_creation or 0

    kpis = KPIMetrics(
        total_spend=total_cost,
        total_requests=total_requests,
        tokens_processed=total_tokens,
        avg_cost_per_request=total_cost / total_requests if total_requests > 0 else 0,
        success_rate=(success_count / total_requests * 100) if total_requests > 0 else 100,
        avg_latency_ms=avg_latency,
    )

    # Daily spend
    daily_spend = []
    current_date = start_date
    while current_date <= end_date:
        next_date = current_date + timedelta(days=1)
        day_result = session.exec(
            select(
                func.sum(UsageLog.total_cost_usd).label("spend"),
                func.count(UsageLog.id).label("requests"),
            )
            .where(UsageLog.team_id == team_id)
            .where(UsageLog.created_at >= current_date)
            .where(UsageLog.created_at < next_date)
        ).first()

        daily_spend.append(SpendTrendPoint(
            date=current_date.strftime("%Y-%m-%d"),
            spend=float(day_result.spend or 0),
            requests=day_result.requests or 0,
        ))
        current_date = next_date

    # Cache metrics over time
    cache_metrics = []
    current_date = start_date
    while current_date <= end_date:
        next_date = current_date + timedelta(days=1)
        cache_result = session.exec(
            select(
                func.sum(UsageLog.cache_read_tokens).label("cache_read"),
                func.sum(UsageLog.cache_creation_tokens).label("cache_creation"),
            )
            .where(UsageLog.team_id == team_id)
            .where(UsageLog.created_at >= current_date)
            .where(UsageLog.created_at < next_date)
        ).first()

        cache_metrics.append({
            "date": current_date.strftime("%Y-%m-%d"),
            "cache_read": cache_result.cache_read or 0,
            "cache_creation": cache_result.cache_creation or 0,
        })
        current_date = next_date

    token_efficiency = total_tokens / total_cost if total_cost > 0 else 0

    return TeamAnalytics(
        team_id=team_id,
        team_name=team_name,
        kpis=kpis,
        budget=budget,
        budget_used_percentage=(total_cost / budget * 100) if budget > 0 else 0,
        active_members=active_members,
        token_efficiency=token_efficiency,
        daily_spend=daily_spend,
        cache_metrics=cache_metrics,
    )


@router.get("/models/{model_id}")
def get_model_analytics(
    model_id: str,
    range: str = Query("last30days"),
    session: Session = Depends(get_session)
):
    """Get model-level analytics."""
    start_date, end_date = get_date_range(range)

    # Get KPIs for model
    result = session.exec(
        select(
            func.count(UsageLog.id).label("total_requests"),
            func.sum(UsageLog.total_tokens).label("total_tokens"),
            func.sum(UsageLog.total_cost_usd).label("total_cost"),
            func.avg(UsageLog.latency_ms).label("avg_latency"),
            func.sum(UsageLog.cache_read_tokens).label("cache_read"),
        )
        .where(UsageLog.model_used == model_id)
        .where(UsageLog.created_at >= start_date)
        .where(UsageLog.created_at <= end_date)
    ).first()

    success_count = session.exec(
        select(func.count(UsageLog.id))
        .where(UsageLog.model_used == model_id)
        .where(UsageLog.created_at >= start_date)
        .where(UsageLog.created_at <= end_date)
        .where(UsageLog.is_success == True)
    ).first() or 0

    failed_count = session.exec(
        select(func.count(UsageLog.id))
        .where(UsageLog.model_used == model_id)
        .where(UsageLog.created_at >= start_date)
        .where(UsageLog.created_at <= end_date)
        .where(UsageLog.is_success == False)
    ).first() or 0

    total_requests = result.total_requests or 0
    total_cost = float(result.total_cost or 0)
    total_tokens = result.total_tokens or 0
    avg_latency = float(result.avg_latency or 0)
    cache_read = result.cache_read or 0

    # Get provider
    provider_result = session.exec(
        select(UsageLog.provider)
        .where(UsageLog.model_used == model_id)
        .limit(1)
    ).first()

    # Success vs failed over time
    success_vs_failed = []
    current_date = start_date
    while current_date <= end_date:
        next_date = current_date + timedelta(days=1)
        success = session.exec(
            select(func.count(UsageLog.id))
            .where(UsageLog.model_used == model_id)
            .where(UsageLog.created_at >= current_date)
            .where(UsageLog.created_at < next_date)
            .where(UsageLog.is_success == True)
        ).first() or 0

        failed = session.exec(
            select(func.count(UsageLog.id))
            .where(UsageLog.model_used == model_id)
            .where(UsageLog.created_at >= current_date)
            .where(UsageLog.created_at < next_date)
            .where(UsageLog.is_success == False)
        ).first() or 0

        success_vs_failed.append({
            "date": current_date.strftime("%Y-%m-%d"),
            "success": success,
            "failed": failed,
        })
        current_date = next_date

    # Requests per day
    requests_per_day = []
    current_date = start_date
    while current_date <= end_date:
        next_date = current_date + timedelta(days=1)
        day_result = session.exec(
            select(
                func.sum(UsageLog.total_cost_usd).label("spend"),
                func.count(UsageLog.id).label("requests"),
            )
            .where(UsageLog.model_used == model_id)
            .where(UsageLog.created_at >= current_date)
            .where(UsageLog.created_at < next_date)
        ).first()

        requests_per_day.append({
            "date": current_date.strftime("%Y-%m-%d"),
            "spend": float(day_result.spend or 0),
            "requests": day_result.requests or 0,
        })
        current_date = next_date

    cache_hit_rate = (cache_read / total_tokens * 100) if total_tokens > 0 else 0

    return {
        "model_id": model_id,
        "model_name": model_id,
        "provider": provider_result or "unknown",
        "kpis": {
            "total_spend": total_cost,
            "total_requests": total_requests,
            "tokens_processed": total_tokens,
            "avg_cost_per_request": total_cost / total_requests if total_requests > 0 else 0,
            "success_rate": (success_count / total_requests * 100) if total_requests > 0 else 100,
            "avg_latency_ms": avg_latency,
        },
        "cache_hit_rate": cache_hit_rate,
        "success_vs_failed": success_vs_failed,
        "requests_per_day": requests_per_day,
    }


@router.get("/users/{user_id}")
def get_user_analytics(
    user_id: str,
    range: str = Query("last30days"),
    session: Session = Depends(get_session)
):
    """Get user-level analytics."""
    start_date, end_date = get_date_range(range)

    user = session.get(User, user_id)
    if user:
        user_name = user.name
        email = user.email
        role = user.role or "Developer"
        team = session.get(Team, user.team_id)
        team_name = team.name if team else "Unknown"
    else:
        user_name = "Unknown User"
        email = "unknown@example.com"
        role = "Developer"
        team_name = "Unknown"

    # Get KPIs for user
    result = session.exec(
        select(
            func.count(UsageLog.id).label("total_requests"),
            func.sum(UsageLog.total_tokens).label("total_tokens"),
            func.sum(UsageLog.total_cost_usd).label("total_cost"),
            func.avg(UsageLog.latency_ms).label("avg_latency"),
            func.sum(UsageLog.cache_read_tokens).label("cache_read"),
        )
        .where(UsageLog.user_id == user_id)
        .where(UsageLog.created_at >= start_date)
        .where(UsageLog.created_at <= end_date)
    ).first()

    success_count = session.exec(
        select(func.count(UsageLog.id))
        .where(UsageLog.user_id == user_id)
        .where(UsageLog.created_at >= start_date)
        .where(UsageLog.created_at <= end_date)
        .where(UsageLog.is_success == True)
    ).first() or 0

    total_requests = result.total_requests or 0
    total_cost = float(result.total_cost or 0)
    total_tokens = result.total_tokens or 0
    avg_latency = float(result.avg_latency or 0)
    cache_read = result.cache_read or 0

    cache_hit_rate = (cache_read / total_tokens * 100) if total_tokens > 0 else 0

    # Activity by week
    activity_timeline = []
    current_date = start_date
    while current_date <= end_date:
        week_end = current_date + timedelta(days=7)
        week_result = session.exec(
            select(func.count(UsageLog.id))
            .where(UsageLog.user_id == user_id)
            .where(UsageLog.created_at >= current_date)
            .where(UsageLog.created_at < week_end)
        ).first() or 0

        activity_timeline.append({
            "week_start": current_date.strftime("%Y-%m-%d"),
            "requests": week_result,
        })
        current_date = week_end

    return {
        "user_id": user_id,
        "user_name": user_name,
        "email": email,
        "role": role,
        "team_name": team_name,
        "kpis": {
            "total_spend": total_cost,
            "total_requests": total_requests,
            "tokens_processed": total_tokens,
            "avg_cost_per_request": total_cost / total_requests if total_requests > 0 else 0,
            "success_rate": (success_count / total_requests * 100) if total_requests > 0 else 100,
            "avg_latency_ms": avg_latency,
        },
        "cache_hit_rate": cache_hit_rate,
        "activity_timeline": activity_timeline,
    }


@router.get("/models")
def list_models_analytics(
    range: str = Query("last30days"),
    session: Session = Depends(get_session)
):
    """List all models with their analytics."""
    start_date, end_date = get_date_range(range)

    model_results = session.exec(
        select(
            UsageLog.model_used,
            UsageLog.provider,
            func.sum(UsageLog.total_cost_usd).label("cost"),
            func.count(UsageLog.id).label("requests"),
            func.avg(UsageLog.latency_ms).label("avg_latency"),
        )
        .where(UsageLog.created_at >= start_date)
        .where(UsageLog.created_at <= end_date)
        .group_by(UsageLog.model_used, UsageLog.provider)
        .order_by(func.sum(UsageLog.total_cost_usd).desc())
    ).all()

    total_cost = sum(float(r.cost or 0) for r in model_results)

    models = []
    for r in model_results:
        models.append({
            "id": r.model_used,
            "name": r.model_used,
            "provider": r.provider,
            "total_spend": float(r.cost or 0),
            "percentage": (float(r.cost or 0) / total_cost * 100) if total_cost > 0 else 0,
            "requests": r.requests or 0,
            "avg_latency_ms": float(r.avg_latency or 0),
        })

    return models

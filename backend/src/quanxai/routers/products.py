"""AWS Products API endpoints (Bedrock & SageMaker)."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, func
from typing import Optional, List
from datetime import datetime, timedelta
from pydantic import BaseModel

from quanxai.database import get_session, AWSProduct, AWSUsageLog, UsageLog

router = APIRouter()


class BedrockModel(BaseModel):
    """Response model for a Bedrock model."""
    id: str
    model_id: str
    display_name: str
    provider: str
    region: str
    regions_available: List[str]
    pricing_tier: str
    input_cost_per_1k: float
    output_cost_per_1k: float
    max_tokens: int
    supports_streaming: bool
    supports_vision: bool
    supports_function_calling: bool
    is_active: bool
    total_requests: int
    total_tokens: int
    total_cost: float
    avg_latency_ms: float


class SageMakerEndpoint(BaseModel):
    """Response model for a SageMaker endpoint."""
    id: str
    model_id: str
    display_name: str
    endpoint_name: str
    instance_type: str
    instance_count: int
    region: str
    status: str
    requests_per_hour: int
    cost_per_hour: float
    is_active: bool


class ProductMetrics(BaseModel):
    """Product metrics response."""
    total_bedrock_spend: float
    total_sagemaker_spend: float
    total_bedrock_requests: int
    total_sagemaker_requests: int
    bedrock_models_count: int
    sagemaker_endpoints_count: int
    avg_bedrock_latency: float
    cross_region_calls: int


class RegionalUsage(BaseModel):
    """Regional usage breakdown."""
    region: str
    requests: int
    tokens: int
    cost: float
    avg_latency: float


class CostAllocationEntry(BaseModel):
    """Cost allocation entry."""
    tag: str
    requests: int
    tokens: int
    cost: float
    percentage: float


@router.get("/metrics", response_model=ProductMetrics)
def get_product_metrics(
    range: str = Query("last30days"),
    session: Session = Depends(get_session)
):
    """Get AWS product metrics for dashboard."""
    # Calculate date range
    end_date = datetime.utcnow()
    if range == "last7days":
        start_date = end_date - timedelta(days=7)
    elif range == "last30days":
        start_date = end_date - timedelta(days=30)
    else:
        start_date = end_date - timedelta(days=30)

    # Count products
    bedrock_count = session.exec(
        select(func.count(AWSProduct.id)).where(AWSProduct.service == "bedrock")
    ).first() or 0

    sagemaker_count = session.exec(
        select(func.count(AWSProduct.id)).where(AWSProduct.service == "sagemaker")
    ).first() or 0

    # Get Bedrock metrics from usage logs (provider contains 'bedrock')
    bedrock_result = session.exec(
        select(
            func.count(UsageLog.id).label("requests"),
            func.sum(UsageLog.total_cost_usd).label("cost"),
            func.avg(UsageLog.latency_ms).label("avg_latency"),
        )
        .where(UsageLog.provider.contains("bedrock"))
        .where(UsageLog.created_at >= start_date)
    ).first()

    # Get SageMaker metrics
    sagemaker_result = session.exec(
        select(
            func.count(UsageLog.id).label("requests"),
            func.sum(UsageLog.total_cost_usd).label("cost"),
        )
        .where(UsageLog.provider.contains("sagemaker"))
        .where(UsageLog.created_at >= start_date)
    ).first()

    # Cross-region calls
    cross_region_calls = session.exec(
        select(func.count(AWSUsageLog.id))
        .where(AWSUsageLog.cross_region == True)
        .where(AWSUsageLog.created_at >= start_date)
    ).first() or 0

    return ProductMetrics(
        total_bedrock_spend=float(bedrock_result.cost or 0),
        total_sagemaker_spend=float(sagemaker_result.cost or 0) if sagemaker_result else 0,
        total_bedrock_requests=bedrock_result.requests or 0,
        total_sagemaker_requests=sagemaker_result.requests if sagemaker_result else 0,
        bedrock_models_count=bedrock_count,
        sagemaker_endpoints_count=sagemaker_count,
        avg_bedrock_latency=float(bedrock_result.avg_latency or 0),
        cross_region_calls=cross_region_calls,
    )


@router.get("/bedrock/models", response_model=List[BedrockModel])
def list_bedrock_models(
    region: Optional[str] = Query(None),
    provider: Optional[str] = Query(None),
    session: Session = Depends(get_session)
):
    """List all Bedrock models."""
    query = select(AWSProduct).where(AWSProduct.service == "bedrock")

    if region:
        query = query.where(AWSProduct.region == region)
    if provider:
        query = query.where(AWSProduct.provider == provider)

    query = query.order_by(AWSProduct.display_name)
    products = session.exec(query).all()

    result = []
    for product in products:
        import json
        regions = json.loads(product.regions_available) if product.regions_available else [product.region]

        # Get usage stats for this model
        usage_stats = session.exec(
            select(
                func.count(UsageLog.id).label("requests"),
                func.sum(UsageLog.total_tokens).label("tokens"),
                func.sum(UsageLog.total_cost_usd).label("cost"),
                func.avg(UsageLog.latency_ms).label("avg_latency"),
            )
            .where(UsageLog.model_used == product.model_id)
            .where(UsageLog.created_at >= datetime.utcnow() - timedelta(days=30))
        ).first()

        result.append(BedrockModel(
            id=product.id,
            model_id=product.model_id,
            display_name=product.display_name,
            provider=product.provider,
            region=product.region,
            regions_available=regions,
            pricing_tier=product.pricing_tier,
            input_cost_per_1k=product.input_cost_per_1k,
            output_cost_per_1k=product.output_cost_per_1k,
            max_tokens=product.max_tokens,
            supports_streaming=product.supports_streaming,
            supports_vision=product.supports_vision,
            supports_function_calling=product.supports_function_calling,
            is_active=product.is_active,
            total_requests=usage_stats.requests or 0,
            total_tokens=usage_stats.tokens or 0,
            total_cost=float(usage_stats.cost or 0),
            avg_latency_ms=float(usage_stats.avg_latency or 0),
        ))

    return result


@router.get("/bedrock/usage")
def get_bedrock_usage(
    range: str = Query("last30days"),
    session: Session = Depends(get_session)
):
    """Get Bedrock usage analytics."""
    end_date = datetime.utcnow()
    if range == "last7days":
        start_date = end_date - timedelta(days=7)
    elif range == "last30days":
        start_date = end_date - timedelta(days=30)
    else:
        start_date = end_date - timedelta(days=30)

    # Usage by model
    by_model = session.exec(
        select(
            UsageLog.model_used,
            func.count(UsageLog.id).label("requests"),
            func.sum(UsageLog.total_tokens).label("tokens"),
            func.sum(UsageLog.total_cost_usd).label("cost"),
        )
        .where(UsageLog.provider.contains("bedrock"))
        .where(UsageLog.created_at >= start_date)
        .group_by(UsageLog.model_used)
        .order_by(func.sum(UsageLog.total_cost_usd).desc())
    ).all()

    # Daily trend
    daily_trend = []
    current_date = start_date.date()
    while current_date <= end_date.date():
        next_date = current_date + timedelta(days=1)
        day_result = session.exec(
            select(
                func.count(UsageLog.id).label("requests"),
                func.sum(UsageLog.total_cost_usd).label("cost"),
            )
            .where(UsageLog.provider.contains("bedrock"))
            .where(UsageLog.created_at >= datetime.combine(current_date, datetime.min.time()))
            .where(UsageLog.created_at < datetime.combine(next_date, datetime.min.time()))
        ).first()

        daily_trend.append({
            "date": current_date.isoformat(),
            "requests": day_result.requests or 0,
            "cost": float(day_result.cost or 0),
        })
        current_date = next_date

    return {
        "by_model": [
            {
                "model": r.model_used,
                "requests": r.requests,
                "tokens": r.tokens or 0,
                "cost": float(r.cost or 0),
            }
            for r in by_model
        ],
        "daily_trend": daily_trend,
    }


@router.get("/bedrock/regions", response_model=List[RegionalUsage])
def get_bedrock_regional_usage(
    range: str = Query("last30days"),
    session: Session = Depends(get_session)
):
    """Get Bedrock usage by region."""
    end_date = datetime.utcnow()
    if range == "last7days":
        start_date = end_date - timedelta(days=7)
    else:
        start_date = end_date - timedelta(days=30)

    # Get regional usage from AWS usage logs
    regional = session.exec(
        select(
            AWSUsageLog.region,
            func.count(AWSUsageLog.id).label("requests"),
            func.sum(UsageLog.total_tokens).label("tokens"),
            func.sum(UsageLog.total_cost_usd).label("cost"),
            func.avg(UsageLog.latency_ms).label("avg_latency"),
        )
        .join(UsageLog, AWSUsageLog.usage_log_id == UsageLog.id)
        .where(AWSUsageLog.created_at >= start_date)
        .group_by(AWSUsageLog.region)
        .order_by(func.sum(UsageLog.total_cost_usd).desc())
    ).all()

    return [
        RegionalUsage(
            region=r.region,
            requests=r.requests,
            tokens=r.tokens or 0,
            cost=float(r.cost or 0),
            avg_latency=float(r.avg_latency or 0),
        )
        for r in regional
    ]


@router.get("/sagemaker/endpoints", response_model=List[SageMakerEndpoint])
def list_sagemaker_endpoints(
    region: Optional[str] = Query(None),
    session: Session = Depends(get_session)
):
    """List all SageMaker endpoints."""
    query = select(AWSProduct).where(AWSProduct.service == "sagemaker")

    if region:
        query = query.where(AWSProduct.region == region)

    query = query.order_by(AWSProduct.display_name)
    products = session.exec(query).all()

    result = []
    for product in products:
        # Calculate hourly stats
        hourly_requests = session.exec(
            select(func.count(UsageLog.id))
            .where(UsageLog.model_used == product.model_id)
            .where(UsageLog.created_at >= datetime.utcnow() - timedelta(hours=1))
        ).first() or 0

        result.append(SageMakerEndpoint(
            id=product.id,
            model_id=product.model_id,
            display_name=product.display_name,
            endpoint_name=product.endpoint_name or "",
            instance_type=product.instance_type or "ml.g5.xlarge",
            instance_count=product.instance_count,
            region=product.region,
            status="InService" if product.is_active else "OutOfService",
            requests_per_hour=hourly_requests,
            cost_per_hour=(product.input_cost_per_1k + product.output_cost_per_1k) * 10,  # Estimate
            is_active=product.is_active,
        ))

    return result


@router.get("/cost-allocation", response_model=List[CostAllocationEntry])
def get_cost_allocation(
    range: str = Query("last30days"),
    group_by: str = Query("tag", description="tag, team, or environment"),
    session: Session = Depends(get_session)
):
    """Get cost allocation breakdown."""
    end_date = datetime.utcnow()
    if range == "last7days":
        start_date = end_date - timedelta(days=7)
    else:
        start_date = end_date - timedelta(days=30)

    # Get total cost
    total_cost = session.exec(
        select(func.sum(UsageLog.total_cost_usd))
        .where(UsageLog.created_at >= start_date)
    ).first() or 1.0

    if group_by == "team":
        # Group by team
        from quanxai.database import Team
        results = session.exec(
            select(
                Team.name,
                func.count(UsageLog.id).label("requests"),
                func.sum(UsageLog.total_tokens).label("tokens"),
                func.sum(UsageLog.total_cost_usd).label("cost"),
            )
            .join(Team, UsageLog.team_id == Team.id)
            .where(UsageLog.created_at >= start_date)
            .group_by(Team.name)
            .order_by(func.sum(UsageLog.total_cost_usd).desc())
        ).all()

        return [
            CostAllocationEntry(
                tag=r.name,
                requests=r.requests,
                tokens=r.tokens or 0,
                cost=float(r.cost or 0),
                percentage=(float(r.cost or 0) / float(total_cost) * 100) if total_cost else 0,
            )
            for r in results
        ]

    elif group_by == "environment":
        # Group by cost allocation tag (environment)
        results = session.exec(
            select(
                AWSUsageLog.cost_allocation_tag,
                func.count(AWSUsageLog.id).label("requests"),
                func.sum(UsageLog.total_tokens).label("tokens"),
                func.sum(UsageLog.total_cost_usd).label("cost"),
            )
            .join(UsageLog, AWSUsageLog.usage_log_id == UsageLog.id)
            .where(AWSUsageLog.cost_allocation_tag != None)
            .where(AWSUsageLog.created_at >= start_date)
            .group_by(AWSUsageLog.cost_allocation_tag)
            .order_by(func.sum(UsageLog.total_cost_usd).desc())
        ).all()

        return [
            CostAllocationEntry(
                tag=r.cost_allocation_tag or "untagged",
                requests=r.requests,
                tokens=r.tokens or 0,
                cost=float(r.cost or 0),
                percentage=(float(r.cost or 0) / float(total_cost) * 100) if total_cost else 0,
            )
            for r in results
        ]

    else:
        # Default: Group by business unit
        results = session.exec(
            select(
                AWSUsageLog.business_unit,
                func.count(AWSUsageLog.id).label("requests"),
                func.sum(UsageLog.total_tokens).label("tokens"),
                func.sum(UsageLog.total_cost_usd).label("cost"),
            )
            .join(UsageLog, AWSUsageLog.usage_log_id == UsageLog.id)
            .where(AWSUsageLog.business_unit != None)
            .where(AWSUsageLog.created_at >= start_date)
            .group_by(AWSUsageLog.business_unit)
            .order_by(func.sum(UsageLog.total_cost_usd).desc())
        ).all()

        return [
            CostAllocationEntry(
                tag=r.business_unit or "untagged",
                requests=r.requests,
                tokens=r.tokens or 0,
                cost=float(r.cost or 0),
                percentage=(float(r.cost or 0) / float(total_cost) * 100) if total_cost else 0,
            )
            for r in results
        ]


@router.get("/cost-allocation/by-project")
def get_cost_by_project(
    range: str = Query("last30days"),
    session: Session = Depends(get_session)
):
    """Get cost breakdown by project."""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=30 if range == "last30days" else 7)

    results = session.exec(
        select(
            AWSUsageLog.project_id,
            func.count(AWSUsageLog.id).label("requests"),
            func.sum(UsageLog.total_cost_usd).label("cost"),
        )
        .join(UsageLog, AWSUsageLog.usage_log_id == UsageLog.id)
        .where(AWSUsageLog.project_id != None)
        .where(AWSUsageLog.created_at >= start_date)
        .group_by(AWSUsageLog.project_id)
        .order_by(func.sum(UsageLog.total_cost_usd).desc())
    ).all()

    return [
        {
            "project_id": r.project_id,
            "requests": r.requests,
            "cost": float(r.cost or 0),
        }
        for r in results
    ]

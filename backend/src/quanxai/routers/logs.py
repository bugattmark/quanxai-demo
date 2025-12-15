"""Request Logs API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, func
from typing import Optional, List
from datetime import datetime, timedelta
from pydantic import BaseModel

from quanxai.database import get_session, UsageLog, APIKey, Team, User

router = APIRouter()


class LogResponse(BaseModel):
    """Response model for a log entry."""
    id: str
    request_id: str
    api_key_id: str
    key_alias: Optional[str]
    team_id: Optional[str]
    team_name: Optional[str]
    user_id: Optional[str]
    user_name: Optional[str]
    model_requested: str
    model_used: str
    provider: str
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    total_cost_usd: float
    latency_ms: int
    is_streaming: bool
    is_success: bool
    status_code: Optional[int]
    error_type: Optional[str]
    error_message: Optional[str]
    created_at: datetime
    tags: List[str]


class LogDetailResponse(LogResponse):
    """Detailed log response with request/response payloads."""
    request_payload: Optional[dict]
    response_payload: Optional[dict]
    cache_read_tokens: int
    cache_creation_tokens: int
    prompt_cost_usd: float
    completion_cost_usd: float


class LogMetrics(BaseModel):
    """Log metrics response."""
    total_requests: int
    successful_requests: int
    failed_requests: int
    success_rate: float
    total_tokens: int
    total_cost: float
    avg_latency_ms: float
    p95_latency_ms: float


@router.get("/", response_model=List[LogResponse])
def list_logs(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    model: Optional[str] = Query(None),
    status: Optional[str] = Query(None, description="success or failed"),
    team_id: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    key_id: Optional[str] = Query(None),
    limit: int = Query(50, le=500),
    offset: int = Query(0),
    session: Session = Depends(get_session)
):
    """List request logs with filters."""
    query = select(UsageLog)

    # Apply date filters
    if start_date:
        query = query.where(UsageLog.created_at >= start_date)
    if end_date:
        query = query.where(UsageLog.created_at <= end_date)
    else:
        # Default to last 24 hours if no date specified
        if not start_date:
            query = query.where(UsageLog.created_at >= datetime.utcnow() - timedelta(hours=24))

    # Apply other filters
    if model:
        query = query.where(UsageLog.model_used == model)
    if status == "success":
        query = query.where(UsageLog.is_success == True)
    elif status == "failed":
        query = query.where(UsageLog.is_success == False)
    if team_id:
        query = query.where(UsageLog.team_id == team_id)
    if user_id:
        query = query.where(UsageLog.user_id == user_id)
    if key_id:
        query = query.where(UsageLog.api_key_id == key_id)

    query = query.order_by(UsageLog.created_at.desc()).offset(offset).limit(limit)
    logs = session.exec(query).all()

    result = []
    for log in logs:
        # Get related info
        key_alias = None
        if log.api_key_id:
            key = session.get(APIKey, log.api_key_id)
            key_alias = key.alias if key else None

        team_name = None
        if log.team_id:
            team = session.get(Team, log.team_id)
            team_name = team.name if team else None

        user_name = None
        if log.user_id:
            user = session.get(User, log.user_id)
            user_name = user.name if user else None

        # Parse tags
        import json
        tags = json.loads(log.tags) if log.tags else []

        result.append(LogResponse(
            id=log.id,
            request_id=log.request_id,
            api_key_id=log.api_key_id,
            key_alias=key_alias,
            team_id=log.team_id,
            team_name=team_name,
            user_id=log.user_id,
            user_name=user_name,
            model_requested=log.model_requested,
            model_used=log.model_used,
            provider=log.provider,
            prompt_tokens=log.prompt_tokens,
            completion_tokens=log.completion_tokens,
            total_tokens=log.total_tokens,
            total_cost_usd=log.total_cost_usd,
            latency_ms=log.latency_ms,
            is_streaming=log.is_streaming,
            is_success=log.is_success,
            status_code=log.status_code,
            error_type=log.error_type,
            error_message=log.error_message,
            created_at=log.created_at,
            tags=tags,
        ))

    return result


@router.get("/metrics", response_model=LogMetrics)
def get_log_metrics(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    session: Session = Depends(get_session)
):
    """Get log metrics for dashboard."""
    query = select(UsageLog)

    if start_date:
        query = query.where(UsageLog.created_at >= start_date)
    else:
        query = query.where(UsageLog.created_at >= datetime.utcnow() - timedelta(days=30))
    if end_date:
        query = query.where(UsageLog.created_at <= end_date)

    # Total requests
    total_requests = session.exec(
        select(func.count(UsageLog.id))
        .where(UsageLog.created_at >= (start_date or datetime.utcnow() - timedelta(days=30)))
    ).first() or 0

    # Successful requests
    successful_requests = session.exec(
        select(func.count(UsageLog.id))
        .where(UsageLog.created_at >= (start_date or datetime.utcnow() - timedelta(days=30)))
        .where(UsageLog.is_success == True)
    ).first() or 0

    # Failed requests
    failed_requests = total_requests - successful_requests

    # Aggregates
    result = session.exec(
        select(
            func.sum(UsageLog.total_tokens).label("total_tokens"),
            func.sum(UsageLog.total_cost_usd).label("total_cost"),
            func.avg(UsageLog.latency_ms).label("avg_latency"),
        )
        .where(UsageLog.created_at >= (start_date or datetime.utcnow() - timedelta(days=30)))
    ).first()

    # Get P95 latency (approximate using ordered query)
    latency_logs = session.exec(
        select(UsageLog.latency_ms)
        .where(UsageLog.created_at >= (start_date or datetime.utcnow() - timedelta(days=30)))
        .order_by(UsageLog.latency_ms)
    ).all()

    p95_latency = 0.0
    if latency_logs:
        p95_index = int(len(latency_logs) * 0.95)
        p95_latency = float(latency_logs[min(p95_index, len(latency_logs) - 1)])

    success_rate = (successful_requests / total_requests * 100) if total_requests > 0 else 100

    return LogMetrics(
        total_requests=total_requests,
        successful_requests=successful_requests,
        failed_requests=failed_requests,
        success_rate=success_rate,
        total_tokens=result.total_tokens or 0,
        total_cost=float(result.total_cost or 0),
        avg_latency_ms=float(result.avg_latency or 0),
        p95_latency_ms=p95_latency,
    )


@router.get("/errors")
def list_error_logs(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    error_type: Optional[str] = Query(None),
    limit: int = Query(50, le=500),
    offset: int = Query(0),
    session: Session = Depends(get_session)
):
    """List only error logs."""
    query = select(UsageLog).where(UsageLog.is_success == False)

    if start_date:
        query = query.where(UsageLog.created_at >= start_date)
    else:
        query = query.where(UsageLog.created_at >= datetime.utcnow() - timedelta(days=7))
    if end_date:
        query = query.where(UsageLog.created_at <= end_date)
    if error_type:
        query = query.where(UsageLog.error_type == error_type)

    query = query.order_by(UsageLog.created_at.desc()).offset(offset).limit(limit)
    logs = session.exec(query).all()

    result = []
    for log in logs:
        result.append({
            "id": log.id,
            "request_id": log.request_id,
            "model": log.model_used,
            "error_type": log.error_type,
            "error_message": log.error_message,
            "status_code": log.status_code,
            "created_at": log.created_at,
        })

    return result


@router.get("/{log_id}", response_model=LogDetailResponse)
def get_log_detail(log_id: str, session: Session = Depends(get_session)):
    """Get detailed log entry including request/response payloads."""
    log = session.get(UsageLog, log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")

    import json

    # Get related info
    key_alias = None
    if log.api_key_id:
        key = session.get(APIKey, log.api_key_id)
        key_alias = key.alias if key else None

    team_name = None
    if log.team_id:
        team = session.get(Team, log.team_id)
        team_name = team.name if team else None

    user_name = None
    if log.user_id:
        user = session.get(User, log.user_id)
        user_name = user.name if user else None

    tags = json.loads(log.tags) if log.tags else []
    request_payload = json.loads(log.request_payload) if log.request_payload else None
    response_payload = json.loads(log.response_payload) if log.response_payload else None

    return LogDetailResponse(
        id=log.id,
        request_id=log.request_id,
        api_key_id=log.api_key_id,
        key_alias=key_alias,
        team_id=log.team_id,
        team_name=team_name,
        user_id=log.user_id,
        user_name=user_name,
        model_requested=log.model_requested,
        model_used=log.model_used,
        provider=log.provider,
        prompt_tokens=log.prompt_tokens,
        completion_tokens=log.completion_tokens,
        total_tokens=log.total_tokens,
        total_cost_usd=log.total_cost_usd,
        latency_ms=log.latency_ms,
        is_streaming=log.is_streaming,
        is_success=log.is_success,
        status_code=log.status_code,
        error_type=log.error_type,
        error_message=log.error_message,
        created_at=log.created_at,
        tags=tags,
        request_payload=request_payload,
        response_payload=response_payload,
        cache_read_tokens=log.cache_read_tokens,
        cache_creation_tokens=log.cache_creation_tokens,
        prompt_cost_usd=log.prompt_cost_usd,
        completion_cost_usd=log.completion_cost_usd,
    )


@router.get("/by-model/{model_name}")
def get_logs_by_model(
    model_name: str,
    limit: int = Query(50, le=500),
    session: Session = Depends(get_session)
):
    """Get logs for a specific model."""
    logs = session.exec(
        select(UsageLog)
        .where(UsageLog.model_used == model_name)
        .order_by(UsageLog.created_at.desc())
        .limit(limit)
    ).all()

    return [
        {
            "id": log.id,
            "request_id": log.request_id,
            "total_tokens": log.total_tokens,
            "total_cost_usd": log.total_cost_usd,
            "latency_ms": log.latency_ms,
            "is_success": log.is_success,
            "created_at": log.created_at,
        }
        for log in logs
    ]

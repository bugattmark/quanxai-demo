"""Guardrails API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, func
from typing import Optional, List
from datetime import datetime, timedelta
from pydantic import BaseModel
import json

from quanxai.database import get_session, Guardrail, GuardrailViolation

router = APIRouter()


class GuardrailCreate(BaseModel):
    """Request body for creating a guardrail."""
    name: str
    description: Optional[str] = None
    type: str  # "openai_moderation" | "presidio" | "prompt_injection" | "bedrock" | "custom"
    config: dict
    enabled: bool = True
    mode: str = "pre_call"
    apply_to_models: Optional[List[str]] = None
    organization_id: str


class GuardrailUpdate(BaseModel):
    """Request body for updating a guardrail."""
    name: Optional[str] = None
    description: Optional[str] = None
    config: Optional[dict] = None
    enabled: Optional[bool] = None
    mode: Optional[str] = None
    apply_to_models: Optional[List[str]] = None


class GuardrailResponse(BaseModel):
    """Response model for a guardrail."""
    id: str
    name: str
    description: Optional[str]
    type: str
    config: dict
    enabled: bool
    mode: str
    apply_to_models: Optional[List[str]]
    organization_id: str
    created_at: datetime
    updated_at: datetime
    violations_count: int
    blocked_count: int


class ViolationResponse(BaseModel):
    """Response model for a violation."""
    id: str
    guardrail_id: str
    guardrail_name: str
    request_id: Optional[str]
    api_key_id: Optional[str]
    violation_type: str
    severity: str
    blocked: bool
    details: dict
    created_at: datetime


class GuardrailMetrics(BaseModel):
    """Guardrail metrics response."""
    total_guardrails: int
    enabled_guardrails: int
    total_violations: int
    blocked_requests: int
    violation_rate: float


@router.get("/", response_model=List[GuardrailResponse])
def list_guardrails(
    organization_id: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    enabled: Optional[bool] = Query(None),
    session: Session = Depends(get_session)
):
    """List all guardrails."""
    query = select(Guardrail)

    if organization_id:
        query = query.where(Guardrail.organization_id == organization_id)
    if type:
        query = query.where(Guardrail.type == type)
    if enabled is not None:
        query = query.where(Guardrail.enabled == enabled)

    query = query.order_by(Guardrail.name)
    guardrails = session.exec(query).all()

    result = []
    for g in guardrails:
        # Get violation counts
        violations_count = session.exec(
            select(func.count(GuardrailViolation.id))
            .where(GuardrailViolation.guardrail_id == g.id)
        ).first() or 0

        blocked_count = session.exec(
            select(func.count(GuardrailViolation.id))
            .where(GuardrailViolation.guardrail_id == g.id)
            .where(GuardrailViolation.blocked == True)
        ).first() or 0

        result.append(GuardrailResponse(
            id=g.id,
            name=g.name,
            description=g.description,
            type=g.type,
            config=json.loads(g.config),
            enabled=g.enabled,
            mode=g.mode,
            apply_to_models=json.loads(g.apply_to_models) if g.apply_to_models else None,
            organization_id=g.organization_id,
            created_at=g.created_at,
            updated_at=g.updated_at,
            violations_count=violations_count,
            blocked_count=blocked_count,
        ))

    return result


@router.get("/metrics", response_model=GuardrailMetrics)
def get_guardrail_metrics(
    range: str = Query("last30days"),
    session: Session = Depends(get_session)
):
    """Get guardrail metrics for dashboard."""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=30 if range == "last30days" else 7)

    total_guardrails = session.exec(select(func.count(Guardrail.id))).first() or 0
    enabled_guardrails = session.exec(
        select(func.count(Guardrail.id)).where(Guardrail.enabled == True)
    ).first() or 0

    total_violations = session.exec(
        select(func.count(GuardrailViolation.id))
        .where(GuardrailViolation.created_at >= start_date)
    ).first() or 0

    blocked_requests = session.exec(
        select(func.count(GuardrailViolation.id))
        .where(GuardrailViolation.created_at >= start_date)
        .where(GuardrailViolation.blocked == True)
    ).first() or 0

    # Calculate violation rate (violations per 1000 requests)
    from quanxai.database import UsageLog
    total_requests = session.exec(
        select(func.count(UsageLog.id))
        .where(UsageLog.created_at >= start_date)
    ).first() or 1

    violation_rate = (total_violations / total_requests * 1000)

    return GuardrailMetrics(
        total_guardrails=total_guardrails,
        enabled_guardrails=enabled_guardrails,
        total_violations=total_violations,
        blocked_requests=blocked_requests,
        violation_rate=violation_rate,
    )


@router.post("/", response_model=GuardrailResponse)
def create_guardrail(
    data: GuardrailCreate,
    session: Session = Depends(get_session)
):
    """Create a new guardrail."""
    guardrail = Guardrail(
        name=data.name,
        description=data.description,
        type=data.type,
        config=json.dumps(data.config),
        enabled=data.enabled,
        mode=data.mode,
        apply_to_models=json.dumps(data.apply_to_models) if data.apply_to_models else None,
        organization_id=data.organization_id,
    )

    session.add(guardrail)
    session.commit()
    session.refresh(guardrail)

    return GuardrailResponse(
        id=guardrail.id,
        name=guardrail.name,
        description=guardrail.description,
        type=guardrail.type,
        config=json.loads(guardrail.config),
        enabled=guardrail.enabled,
        mode=guardrail.mode,
        apply_to_models=json.loads(guardrail.apply_to_models) if guardrail.apply_to_models else None,
        organization_id=guardrail.organization_id,
        created_at=guardrail.created_at,
        updated_at=guardrail.updated_at,
        violations_count=0,
        blocked_count=0,
    )


@router.get("/{guardrail_id}", response_model=GuardrailResponse)
def get_guardrail(guardrail_id: str, session: Session = Depends(get_session)):
    """Get a specific guardrail."""
    guardrail = session.get(Guardrail, guardrail_id)
    if not guardrail:
        raise HTTPException(status_code=404, detail="Guardrail not found")

    violations_count = session.exec(
        select(func.count(GuardrailViolation.id))
        .where(GuardrailViolation.guardrail_id == guardrail_id)
    ).first() or 0

    blocked_count = session.exec(
        select(func.count(GuardrailViolation.id))
        .where(GuardrailViolation.guardrail_id == guardrail_id)
        .where(GuardrailViolation.blocked == True)
    ).first() or 0

    return GuardrailResponse(
        id=guardrail.id,
        name=guardrail.name,
        description=guardrail.description,
        type=guardrail.type,
        config=json.loads(guardrail.config),
        enabled=guardrail.enabled,
        mode=guardrail.mode,
        apply_to_models=json.loads(guardrail.apply_to_models) if guardrail.apply_to_models else None,
        organization_id=guardrail.organization_id,
        created_at=guardrail.created_at,
        updated_at=guardrail.updated_at,
        violations_count=violations_count,
        blocked_count=blocked_count,
    )


@router.put("/{guardrail_id}", response_model=GuardrailResponse)
def update_guardrail(
    guardrail_id: str,
    data: GuardrailUpdate,
    session: Session = Depends(get_session)
):
    """Update a guardrail."""
    guardrail = session.get(Guardrail, guardrail_id)
    if not guardrail:
        raise HTTPException(status_code=404, detail="Guardrail not found")

    if data.name is not None:
        guardrail.name = data.name
    if data.description is not None:
        guardrail.description = data.description
    if data.config is not None:
        guardrail.config = json.dumps(data.config)
    if data.enabled is not None:
        guardrail.enabled = data.enabled
    if data.mode is not None:
        guardrail.mode = data.mode
    if data.apply_to_models is not None:
        guardrail.apply_to_models = json.dumps(data.apply_to_models)

    guardrail.updated_at = datetime.utcnow()

    session.add(guardrail)
    session.commit()
    session.refresh(guardrail)

    return get_guardrail(guardrail_id, session)


@router.delete("/{guardrail_id}")
def delete_guardrail(guardrail_id: str, session: Session = Depends(get_session)):
    """Delete a guardrail."""
    guardrail = session.get(Guardrail, guardrail_id)
    if not guardrail:
        raise HTTPException(status_code=404, detail="Guardrail not found")

    session.delete(guardrail)
    session.commit()

    return {"message": "Guardrail deleted successfully"}


@router.get("/violations", response_model=List[ViolationResponse])
def list_violations(
    guardrail_id: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    blocked: Optional[bool] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    limit: int = Query(50, le=500),
    offset: int = Query(0),
    session: Session = Depends(get_session)
):
    """List guardrail violations."""
    query = select(GuardrailViolation)

    if guardrail_id:
        query = query.where(GuardrailViolation.guardrail_id == guardrail_id)
    if severity:
        query = query.where(GuardrailViolation.severity == severity)
    if blocked is not None:
        query = query.where(GuardrailViolation.blocked == blocked)
    if start_date:
        query = query.where(GuardrailViolation.created_at >= start_date)
    if end_date:
        query = query.where(GuardrailViolation.created_at <= end_date)

    query = query.order_by(GuardrailViolation.created_at.desc()).offset(offset).limit(limit)
    violations = session.exec(query).all()

    result = []
    for v in violations:
        guardrail = session.get(Guardrail, v.guardrail_id)
        guardrail_name = guardrail.name if guardrail else "Unknown"

        result.append(ViolationResponse(
            id=v.id,
            guardrail_id=v.guardrail_id,
            guardrail_name=guardrail_name,
            request_id=v.request_id,
            api_key_id=v.api_key_id,
            violation_type=v.violation_type,
            severity=v.severity,
            blocked=v.blocked,
            details=json.loads(v.details),
            created_at=v.created_at,
        ))

    return result


@router.get("/violations/by-type")
def get_violations_by_type(
    range: str = Query("last30days"),
    session: Session = Depends(get_session)
):
    """Get violations grouped by type."""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=30 if range == "last30days" else 7)

    results = session.exec(
        select(
            GuardrailViolation.violation_type,
            func.count(GuardrailViolation.id).label("count"),
        )
        .where(GuardrailViolation.created_at >= start_date)
        .group_by(GuardrailViolation.violation_type)
        .order_by(func.count(GuardrailViolation.id).desc())
    ).all()

    return [
        {"type": r.violation_type, "count": r.count}
        for r in results
    ]


@router.get("/violations/trend")
def get_violations_trend(
    range: str = Query("last30days"),
    session: Session = Depends(get_session)
):
    """Get violations trend over time."""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=30 if range == "last30days" else 7)

    result = []
    current_date = start_date.date()

    while current_date <= end_date.date():
        next_date = current_date + timedelta(days=1)

        day_count = session.exec(
            select(func.count(GuardrailViolation.id))
            .where(GuardrailViolation.created_at >= datetime.combine(current_date, datetime.min.time()))
            .where(GuardrailViolation.created_at < datetime.combine(next_date, datetime.min.time()))
        ).first() or 0

        blocked_count = session.exec(
            select(func.count(GuardrailViolation.id))
            .where(GuardrailViolation.created_at >= datetime.combine(current_date, datetime.min.time()))
            .where(GuardrailViolation.created_at < datetime.combine(next_date, datetime.min.time()))
            .where(GuardrailViolation.blocked == True)
        ).first() or 0

        result.append({
            "date": current_date.isoformat(),
            "violations": day_count,
            "blocked": blocked_count,
        })

        current_date = next_date

    return result

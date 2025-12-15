"""Audit Logs API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, func
from typing import Optional, List
from datetime import datetime, timedelta
from pydantic import BaseModel
import json

from quanxai.database import get_session, AuditLog

router = APIRouter()


class AuditLogResponse(BaseModel):
    """Response model for an audit log entry."""
    id: str
    actor_id: str
    actor_type: str
    actor_email: Optional[str]
    action: str
    entity_type: str
    entity_id: str
    entity_name: Optional[str]
    old_value: Optional[dict]
    new_value: Optional[dict]
    details: Optional[dict]
    ip_address: Optional[str]
    user_agent: Optional[str]
    organization_id: str
    created_at: datetime


class AuditLogCreate(BaseModel):
    """Request body for creating an audit log entry."""
    actor_id: str
    actor_type: str
    actor_email: Optional[str] = None
    action: str
    entity_type: str
    entity_id: str
    entity_name: Optional[str] = None
    old_value: Optional[dict] = None
    new_value: Optional[dict] = None
    details: Optional[dict] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    organization_id: str


class AuditMetrics(BaseModel):
    """Audit metrics response."""
    total_events: int
    events_today: int
    unique_actors: int
    most_common_action: str


@router.get("/", response_model=List[AuditLogResponse])
def list_audit_logs(
    organization_id: Optional[str] = Query(None),
    actor_id: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    entity_type: Optional[str] = Query(None),
    entity_id: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    limit: int = Query(50, le=500),
    offset: int = Query(0),
    session: Session = Depends(get_session)
):
    """List audit log entries with filters."""
    query = select(AuditLog)

    if organization_id:
        query = query.where(AuditLog.organization_id == organization_id)
    if actor_id:
        query = query.where(AuditLog.actor_id == actor_id)
    if action:
        query = query.where(AuditLog.action == action)
    if entity_type:
        query = query.where(AuditLog.entity_type == entity_type)
    if entity_id:
        query = query.where(AuditLog.entity_id == entity_id)
    if start_date:
        query = query.where(AuditLog.created_at >= start_date)
    if end_date:
        query = query.where(AuditLog.created_at <= end_date)

    query = query.order_by(AuditLog.created_at.desc()).offset(offset).limit(limit)
    logs = session.exec(query).all()

    result = []
    for log in logs:
        result.append(AuditLogResponse(
            id=log.id,
            actor_id=log.actor_id,
            actor_type=log.actor_type,
            actor_email=log.actor_email,
            action=log.action,
            entity_type=log.entity_type,
            entity_id=log.entity_id,
            entity_name=log.entity_name,
            old_value=json.loads(log.old_value) if log.old_value else None,
            new_value=json.loads(log.new_value) if log.new_value else None,
            details=json.loads(log.details) if log.details else None,
            ip_address=log.ip_address,
            user_agent=log.user_agent,
            organization_id=log.organization_id,
            created_at=log.created_at,
        ))

    return result


@router.get("/metrics", response_model=AuditMetrics)
def get_audit_metrics(
    range: str = Query("last30days"),
    session: Session = Depends(get_session)
):
    """Get audit metrics for dashboard."""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=30 if range == "last30days" else 7)

    total_events = session.exec(
        select(func.count(AuditLog.id))
        .where(AuditLog.created_at >= start_date)
    ).first() or 0

    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    events_today = session.exec(
        select(func.count(AuditLog.id))
        .where(AuditLog.created_at >= today_start)
    ).first() or 0

    unique_actors = session.exec(
        select(func.count(func.distinct(AuditLog.actor_id)))
        .where(AuditLog.created_at >= start_date)
    ).first() or 0

    # Most common action
    action_counts = session.exec(
        select(AuditLog.action, func.count(AuditLog.id).label("count"))
        .where(AuditLog.created_at >= start_date)
        .group_by(AuditLog.action)
        .order_by(func.count(AuditLog.id).desc())
        .limit(1)
    ).first()

    most_common = action_counts.action if action_counts else "None"

    return AuditMetrics(
        total_events=total_events,
        events_today=events_today,
        unique_actors=unique_actors,
        most_common_action=most_common,
    )


@router.post("/", response_model=AuditLogResponse)
def create_audit_log(
    data: AuditLogCreate,
    session: Session = Depends(get_session)
):
    """Create a new audit log entry."""
    log = AuditLog(
        actor_id=data.actor_id,
        actor_type=data.actor_type,
        actor_email=data.actor_email,
        action=data.action,
        entity_type=data.entity_type,
        entity_id=data.entity_id,
        entity_name=data.entity_name,
        old_value=json.dumps(data.old_value) if data.old_value else None,
        new_value=json.dumps(data.new_value) if data.new_value else None,
        details=json.dumps(data.details) if data.details else None,
        ip_address=data.ip_address,
        user_agent=data.user_agent,
        organization_id=data.organization_id,
    )

    session.add(log)
    session.commit()
    session.refresh(log)

    return AuditLogResponse(
        id=log.id,
        actor_id=log.actor_id,
        actor_type=log.actor_type,
        actor_email=log.actor_email,
        action=log.action,
        entity_type=log.entity_type,
        entity_id=log.entity_id,
        entity_name=log.entity_name,
        old_value=data.old_value,
        new_value=data.new_value,
        details=data.details,
        ip_address=log.ip_address,
        user_agent=log.user_agent,
        organization_id=log.organization_id,
        created_at=log.created_at,
    )


@router.get("/by-action")
def get_logs_by_action(
    range: str = Query("last30days"),
    session: Session = Depends(get_session)
):
    """Get audit logs grouped by action."""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=30 if range == "last30days" else 7)

    results = session.exec(
        select(AuditLog.action, func.count(AuditLog.id).label("count"))
        .where(AuditLog.created_at >= start_date)
        .group_by(AuditLog.action)
        .order_by(func.count(AuditLog.id).desc())
    ).all()

    return [{"action": r.action, "count": r.count} for r in results]


@router.get("/by-entity-type")
def get_logs_by_entity_type(
    range: str = Query("last30days"),
    session: Session = Depends(get_session)
):
    """Get audit logs grouped by entity type."""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=30 if range == "last30days" else 7)

    results = session.exec(
        select(AuditLog.entity_type, func.count(AuditLog.id).label("count"))
        .where(AuditLog.created_at >= start_date)
        .group_by(AuditLog.entity_type)
        .order_by(func.count(AuditLog.id).desc())
    ).all()

    return [{"entity_type": r.entity_type, "count": r.count} for r in results]


@router.get("/by-actor")
def get_logs_by_actor(
    range: str = Query("last30days"),
    limit: int = Query(10, le=50),
    session: Session = Depends(get_session)
):
    """Get audit logs grouped by actor."""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=30 if range == "last30days" else 7)

    results = session.exec(
        select(
            AuditLog.actor_id,
            AuditLog.actor_email,
            func.count(AuditLog.id).label("count")
        )
        .where(AuditLog.created_at >= start_date)
        .group_by(AuditLog.actor_id, AuditLog.actor_email)
        .order_by(func.count(AuditLog.id).desc())
        .limit(limit)
    ).all()

    return [
        {
            "actor_id": r.actor_id,
            "actor_email": r.actor_email,
            "count": r.count
        }
        for r in results
    ]


@router.get("/timeline")
def get_audit_timeline(
    range: str = Query("last30days"),
    session: Session = Depends(get_session)
):
    """Get audit events over time."""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=30 if range == "last30days" else 7)

    result = []
    current_date = start_date.date()

    while current_date <= end_date.date():
        next_date = current_date + timedelta(days=1)

        day_count = session.exec(
            select(func.count(AuditLog.id))
            .where(AuditLog.created_at >= datetime.combine(current_date, datetime.min.time()))
            .where(AuditLog.created_at < datetime.combine(next_date, datetime.min.time()))
        ).first() or 0

        result.append({
            "date": current_date.isoformat(),
            "events": day_count,
        })

        current_date = next_date

    return result


@router.get("/{log_id}", response_model=AuditLogResponse)
def get_audit_log(log_id: str, session: Session = Depends(get_session)):
    """Get a specific audit log entry."""
    log = session.get(AuditLog, log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Audit log not found")

    return AuditLogResponse(
        id=log.id,
        actor_id=log.actor_id,
        actor_type=log.actor_type,
        actor_email=log.actor_email,
        action=log.action,
        entity_type=log.entity_type,
        entity_id=log.entity_id,
        entity_name=log.entity_name,
        old_value=json.loads(log.old_value) if log.old_value else None,
        new_value=json.loads(log.new_value) if log.new_value else None,
        details=json.loads(log.details) if log.details else None,
        ip_address=log.ip_address,
        user_agent=log.user_agent,
        organization_id=log.organization_id,
        created_at=log.created_at,
    )

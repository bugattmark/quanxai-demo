"""Tag Management API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, func
from typing import Optional, List
from datetime import datetime, timedelta
from pydantic import BaseModel

from quanxai.database import get_session, Tag, UsageLog, APIKey

router = APIRouter()


class TagCreate(BaseModel):
    """Request body for creating a tag."""
    name: str
    description: Optional[str] = None
    color: str = "#3B82F6"
    organization_id: str


class TagUpdate(BaseModel):
    """Request body for updating a tag."""
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    is_active: Optional[bool] = None


class TagResponse(BaseModel):
    """Response model for a tag."""
    id: str
    name: str
    description: Optional[str]
    color: str
    organization_id: str
    keys_count: int
    requests_count: int
    total_spend: float
    created_at: datetime
    updated_at: datetime
    is_active: bool


class TagMetrics(BaseModel):
    """Tag metrics response."""
    total_tags: int
    total_tagged_requests: int
    total_tagged_spend: float
    most_used_tag: dict


@router.get("/", response_model=List[TagResponse])
def list_tags(
    organization_id: Optional[str] = Query(None),
    session: Session = Depends(get_session)
):
    """List all tags."""
    query = select(Tag).where(Tag.is_active == True)

    if organization_id:
        query = query.where(Tag.organization_id == organization_id)

    query = query.order_by(Tag.name)
    tags = session.exec(query).all()

    result = []
    for tag in tags:
        # Count keys with this tag
        keys_count = session.exec(
            select(func.count(APIKey.id))
            .where(APIKey.tags.contains(tag.id))
        ).first() or 0

        # Get usage stats for this tag
        usage_stats = session.exec(
            select(
                func.count(UsageLog.id).label("requests"),
                func.sum(UsageLog.total_cost_usd).label("spend"),
            )
            .where(UsageLog.tags.contains(tag.id))
            .where(UsageLog.created_at >= datetime.utcnow() - timedelta(days=30))
        ).first()

        result.append(TagResponse(
            id=tag.id,
            name=tag.name,
            description=tag.description,
            color=tag.color,
            organization_id=tag.organization_id,
            keys_count=keys_count,
            requests_count=usage_stats.requests or 0,
            total_spend=float(usage_stats.spend or 0),
            created_at=tag.created_at,
            updated_at=tag.updated_at,
            is_active=tag.is_active,
        ))

    return result


@router.get("/metrics", response_model=TagMetrics)
def get_tag_metrics(session: Session = Depends(get_session)):
    """Get tag metrics for dashboard."""
    total_tags = session.exec(
        select(func.count(Tag.id)).where(Tag.is_active == True)
    ).first() or 0

    # Get total tagged requests and spend
    tags = session.exec(select(Tag).where(Tag.is_active == True)).all()

    total_requests = 0
    total_spend = 0.0
    most_used_tag = {"name": "None", "requests_count": 0}

    for tag in tags:
        usage_stats = session.exec(
            select(
                func.count(UsageLog.id).label("requests"),
                func.sum(UsageLog.total_cost_usd).label("spend"),
            )
            .where(UsageLog.tags.contains(tag.id))
            .where(UsageLog.created_at >= datetime.utcnow() - timedelta(days=30))
        ).first()

        requests = usage_stats.requests or 0
        spend = float(usage_stats.spend or 0)

        total_requests += requests
        total_spend += spend

        if requests > most_used_tag["requests_count"]:
            most_used_tag = {"name": tag.name, "requests_count": requests}

    return TagMetrics(
        total_tags=total_tags,
        total_tagged_requests=total_requests,
        total_tagged_spend=total_spend,
        most_used_tag=most_used_tag,
    )


@router.post("/", response_model=TagResponse)
def create_tag(
    data: TagCreate,
    session: Session = Depends(get_session)
):
    """Create a new tag."""
    # Check for duplicate name
    existing = session.exec(
        select(Tag)
        .where(Tag.name == data.name)
        .where(Tag.organization_id == data.organization_id)
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Tag with this name already exists")

    tag = Tag(
        name=data.name,
        description=data.description,
        color=data.color,
        organization_id=data.organization_id,
    )

    session.add(tag)
    session.commit()
    session.refresh(tag)

    return TagResponse(
        id=tag.id,
        name=tag.name,
        description=tag.description,
        color=tag.color,
        organization_id=tag.organization_id,
        keys_count=0,
        requests_count=0,
        total_spend=0,
        created_at=tag.created_at,
        updated_at=tag.updated_at,
        is_active=tag.is_active,
    )


@router.get("/spend-by-tag")
def get_spend_by_tag(
    range: str = Query("last30days"),
    session: Session = Depends(get_session)
):
    """Get spend breakdown by tag."""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=30 if range == "last30days" else 7)

    tags = session.exec(select(Tag).where(Tag.is_active == True)).all()

    result = []
    for tag in tags:
        spend = session.exec(
            select(func.sum(UsageLog.total_cost_usd))
            .where(UsageLog.tags.contains(tag.id))
            .where(UsageLog.created_at >= start_date)
        ).first() or 0

        result.append({
            "name": tag.name,
            "value": float(spend),
            "color": tag.color,
        })

    return sorted(result, key=lambda x: x["value"], reverse=True)


@router.get("/requests-by-tag")
def get_requests_by_tag(
    range: str = Query("last30days"),
    session: Session = Depends(get_session)
):
    """Get requests breakdown by tag."""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=30 if range == "last30days" else 7)

    tags = session.exec(select(Tag).where(Tag.is_active == True)).all()

    result = []
    for tag in tags:
        requests = session.exec(
            select(func.count(UsageLog.id))
            .where(UsageLog.tags.contains(tag.id))
            .where(UsageLog.created_at >= start_date)
        ).first() or 0

        result.append({
            "name": tag.name,
            "requests": requests,
            "color": tag.color,
        })

    return sorted(result, key=lambda x: x["requests"], reverse=True)


@router.get("/{tag_id}", response_model=TagResponse)
def get_tag(tag_id: str, session: Session = Depends(get_session)):
    """Get a specific tag."""
    tag = session.get(Tag, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")

    keys_count = session.exec(
        select(func.count(APIKey.id))
        .where(APIKey.tags.contains(tag.id))
    ).first() or 0

    usage_stats = session.exec(
        select(
            func.count(UsageLog.id).label("requests"),
            func.sum(UsageLog.total_cost_usd).label("spend"),
        )
        .where(UsageLog.tags.contains(tag.id))
        .where(UsageLog.created_at >= datetime.utcnow() - timedelta(days=30))
    ).first()

    return TagResponse(
        id=tag.id,
        name=tag.name,
        description=tag.description,
        color=tag.color,
        organization_id=tag.organization_id,
        keys_count=keys_count,
        requests_count=usage_stats.requests or 0,
        total_spend=float(usage_stats.spend or 0),
        created_at=tag.created_at,
        updated_at=tag.updated_at,
        is_active=tag.is_active,
    )


@router.put("/{tag_id}", response_model=TagResponse)
def update_tag(
    tag_id: str,
    data: TagUpdate,
    session: Session = Depends(get_session)
):
    """Update a tag."""
    tag = session.get(Tag, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")

    if data.name is not None:
        tag.name = data.name
    if data.description is not None:
        tag.description = data.description
    if data.color is not None:
        tag.color = data.color
    if data.is_active is not None:
        tag.is_active = data.is_active

    tag.updated_at = datetime.utcnow()

    session.add(tag)
    session.commit()
    session.refresh(tag)

    return get_tag(tag_id, session)


@router.delete("/{tag_id}")
def delete_tag(tag_id: str, session: Session = Depends(get_session)):
    """Delete a tag."""
    tag = session.get(Tag, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")

    session.delete(tag)
    session.commit()

    return {"message": "Tag deleted successfully"}

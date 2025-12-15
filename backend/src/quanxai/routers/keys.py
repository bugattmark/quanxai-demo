"""Virtual Keys API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, func
from typing import Optional, List
from datetime import datetime, timedelta
from pydantic import BaseModel
import secrets
import hashlib
import json

from quanxai.database import get_session, APIKey, Team, User

router = APIRouter()


class KeyCreate(BaseModel):
    """Request body for creating a new key."""
    alias: str
    team_id: Optional[str] = None
    user_id: Optional[str] = None
    models: Optional[List[str]] = None
    rate_limit_rpm: int = 60
    rate_limit_tpm: int = 100000
    max_budget_usd: float = 0.0
    expires_in_days: Optional[int] = None
    tags: Optional[List[str]] = None


class KeyUpdate(BaseModel):
    """Request body for updating a key."""
    alias: Optional[str] = None
    models: Optional[List[str]] = None
    rate_limit_rpm: Optional[int] = None
    rate_limit_tpm: Optional[int] = None
    max_budget_usd: Optional[float] = None
    is_blocked: Optional[bool] = None
    tags: Optional[List[str]] = None


class KeyResponse(BaseModel):
    """Response model for a key."""
    id: str
    alias: Optional[str]
    key_prefix: str
    team_id: Optional[str]
    team_name: Optional[str]
    user_id: Optional[str]
    user_name: Optional[str]
    models: List[str]
    rate_limit_rpm: int
    rate_limit_tpm: int
    max_budget_usd: float
    spent_usd: float
    status: str
    created_at: datetime
    last_used_at: Optional[datetime]
    expires_at: Optional[datetime]
    tags: List[str]


class KeyMetrics(BaseModel):
    """Key metrics response."""
    total_keys: int
    active_keys: int
    blocked_keys: int
    expired_keys: int
    total_spend: float
    keys_expiring_soon: int


def generate_api_key() -> tuple[str, str]:
    """Generate a new API key and its hash."""
    key = f"sk-quanxai-{secrets.token_urlsafe(32)}"
    key_hash = hashlib.sha256(key.encode()).hexdigest()
    key_prefix = f"sk-{key[12:16]}-****"
    return key, key_hash, key_prefix


@router.get("/", response_model=List[KeyResponse])
def list_keys(
    status: Optional[str] = Query(None, description="Filter by status: active, blocked, expired"),
    team_id: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
    offset: int = Query(0),
    session: Session = Depends(get_session)
):
    """List all virtual keys."""
    query = select(APIKey)

    if status == "active":
        query = query.where(APIKey.is_active == True, APIKey.is_blocked == False)
    elif status == "blocked":
        query = query.where(APIKey.is_blocked == True)
    elif status == "expired":
        query = query.where(APIKey.expires_at < datetime.utcnow())

    if team_id:
        query = query.where(APIKey.team_id == team_id)
    if user_id:
        query = query.where(APIKey.user_id == user_id)

    query = query.order_by(APIKey.created_at.desc()).offset(offset).limit(limit)
    keys = session.exec(query).all()

    result = []
    for key in keys:
        # Get team name
        team_name = None
        if key.team_id:
            team = session.get(Team, key.team_id)
            team_name = team.name if team else None

        # Get user name
        user_name = None
        if key.user_id:
            user = session.get(User, key.user_id)
            user_name = user.name if user else None

        # Parse models
        models = json.loads(key.allowed_models) if key.allowed_models else []
        tags = json.loads(key.tags) if key.tags else []

        # Determine status
        if key.is_blocked:
            status = "blocked"
        elif key.expires_at and key.expires_at < datetime.utcnow():
            status = "expired"
        else:
            status = "active"

        result.append(KeyResponse(
            id=key.id,
            alias=key.alias,
            key_prefix=key.key_prefix,
            team_id=key.team_id,
            team_name=team_name,
            user_id=key.user_id,
            user_name=user_name,
            models=models,
            rate_limit_rpm=key.rate_limit_rpm,
            rate_limit_tpm=key.rate_limit_tpm,
            max_budget_usd=key.max_budget_usd,
            spent_usd=key.spent_usd,
            status=status,
            created_at=key.created_at,
            last_used_at=key.last_used_at,
            expires_at=key.expires_at,
            tags=tags,
        ))

    return result


@router.get("/metrics", response_model=KeyMetrics)
def get_key_metrics(session: Session = Depends(get_session)):
    """Get key metrics for dashboard."""
    total_keys = session.exec(select(func.count(APIKey.id))).first() or 0
    active_keys = session.exec(
        select(func.count(APIKey.id))
        .where(APIKey.is_active == True, APIKey.is_blocked == False)
    ).first() or 0
    blocked_keys = session.exec(
        select(func.count(APIKey.id)).where(APIKey.is_blocked == True)
    ).first() or 0
    expired_keys = session.exec(
        select(func.count(APIKey.id))
        .where(APIKey.expires_at < datetime.utcnow())
    ).first() or 0

    total_spend = session.exec(
        select(func.sum(APIKey.spent_usd))
    ).first() or 0.0

    # Keys expiring in next 30 days
    thirty_days = datetime.utcnow() + timedelta(days=30)
    keys_expiring_soon = session.exec(
        select(func.count(APIKey.id))
        .where(APIKey.expires_at != None)
        .where(APIKey.expires_at <= thirty_days)
        .where(APIKey.expires_at > datetime.utcnow())
    ).first() or 0

    return KeyMetrics(
        total_keys=total_keys,
        active_keys=active_keys,
        blocked_keys=blocked_keys,
        expired_keys=expired_keys,
        total_spend=float(total_spend),
        keys_expiring_soon=keys_expiring_soon,
    )


@router.post("/generate")
def create_key(
    data: KeyCreate,
    session: Session = Depends(get_session)
):
    """Create a new virtual key."""
    raw_key, key_hash, key_prefix = generate_api_key()

    expires_at = None
    if data.expires_in_days:
        expires_at = datetime.utcnow() + timedelta(days=data.expires_in_days)

    key = APIKey(
        key_hash=key_hash,
        key_prefix=key_prefix,
        alias=data.alias,
        team_id=data.team_id,
        user_id=data.user_id,
        allowed_models=json.dumps(data.models) if data.models else None,
        rate_limit_rpm=data.rate_limit_rpm,
        rate_limit_tpm=data.rate_limit_tpm,
        max_budget_usd=data.max_budget_usd,
        expires_at=expires_at,
        tags=json.dumps(data.tags) if data.tags else None,
    )

    session.add(key)
    session.commit()
    session.refresh(key)

    return {
        "id": key.id,
        "key": raw_key,  # Only returned once at creation
        "key_prefix": key_prefix,
        "alias": key.alias,
        "created_at": key.created_at,
        "expires_at": key.expires_at,
    }


@router.get("/{key_id}", response_model=KeyResponse)
def get_key(key_id: str, session: Session = Depends(get_session)):
    """Get a specific key by ID."""
    key = session.get(APIKey, key_id)
    if not key:
        raise HTTPException(status_code=404, detail="Key not found")

    # Get team name
    team_name = None
    if key.team_id:
        team = session.get(Team, key.team_id)
        team_name = team.name if team else None

    # Get user name
    user_name = None
    if key.user_id:
        user = session.get(User, key.user_id)
        user_name = user.name if user else None

    models = json.loads(key.allowed_models) if key.allowed_models else []
    tags = json.loads(key.tags) if key.tags else []

    if key.is_blocked:
        status = "blocked"
    elif key.expires_at and key.expires_at < datetime.utcnow():
        status = "expired"
    else:
        status = "active"

    return KeyResponse(
        id=key.id,
        alias=key.alias,
        key_prefix=key.key_prefix,
        team_id=key.team_id,
        team_name=team_name,
        user_id=key.user_id,
        user_name=user_name,
        models=models,
        rate_limit_rpm=key.rate_limit_rpm,
        rate_limit_tpm=key.rate_limit_tpm,
        max_budget_usd=key.max_budget_usd,
        spent_usd=key.spent_usd,
        status=status,
        created_at=key.created_at,
        last_used_at=key.last_used_at,
        expires_at=key.expires_at,
        tags=tags,
    )


@router.put("/{key_id}", response_model=KeyResponse)
def update_key(
    key_id: str,
    data: KeyUpdate,
    session: Session = Depends(get_session)
):
    """Update a key's configuration."""
    key = session.get(APIKey, key_id)
    if not key:
        raise HTTPException(status_code=404, detail="Key not found")

    if data.alias is not None:
        key.alias = data.alias
    if data.models is not None:
        key.allowed_models = json.dumps(data.models)
    if data.rate_limit_rpm is not None:
        key.rate_limit_rpm = data.rate_limit_rpm
    if data.rate_limit_tpm is not None:
        key.rate_limit_tpm = data.rate_limit_tpm
    if data.max_budget_usd is not None:
        key.max_budget_usd = data.max_budget_usd
    if data.is_blocked is not None:
        key.is_blocked = data.is_blocked
    if data.tags is not None:
        key.tags = json.dumps(data.tags)

    session.add(key)
    session.commit()
    session.refresh(key)

    return get_key(key_id, session)


@router.delete("/{key_id}")
def delete_key(key_id: str, session: Session = Depends(get_session)):
    """Delete a key."""
    key = session.get(APIKey, key_id)
    if not key:
        raise HTTPException(status_code=404, detail="Key not found")

    session.delete(key)
    session.commit()

    return {"message": "Key deleted successfully"}


@router.post("/{key_id}/regenerate")
def regenerate_key(key_id: str, session: Session = Depends(get_session)):
    """Regenerate a key (creates new secret while keeping settings)."""
    key = session.get(APIKey, key_id)
    if not key:
        raise HTTPException(status_code=404, detail="Key not found")

    raw_key, key_hash, key_prefix = generate_api_key()

    key.key_hash = key_hash
    key.key_prefix = key_prefix

    session.add(key)
    session.commit()
    session.refresh(key)

    return {
        "id": key.id,
        "key": raw_key,  # Only returned once at regeneration
        "key_prefix": key_prefix,
        "message": "Key regenerated successfully",
    }


@router.post("/{key_id}/block")
def toggle_block_key(key_id: str, session: Session = Depends(get_session)):
    """Block or unblock a key."""
    key = session.get(APIKey, key_id)
    if not key:
        raise HTTPException(status_code=404, detail="Key not found")

    key.is_blocked = not key.is_blocked

    session.add(key)
    session.commit()
    session.refresh(key)

    return {
        "id": key.id,
        "is_blocked": key.is_blocked,
        "message": f"Key {'blocked' if key.is_blocked else 'unblocked'} successfully",
    }

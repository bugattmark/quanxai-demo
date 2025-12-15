"""User CRUD endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List, Optional

from quanxai.database import get_session, User

router = APIRouter()


@router.get("/", response_model=List[User])
def list_users(
    team_id: Optional[str] = Query(None),
    session: Session = Depends(get_session)
):
    """List users, optionally filtered by team."""
    query = select(User).where(User.is_active == True)
    if team_id:
        query = query.where(User.team_id == team_id)
    users = session.exec(query).all()
    return users


@router.get("/{user_id}", response_model=User)
def get_user(user_id: str, session: Session = Depends(get_session)):
    """Get user by ID."""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

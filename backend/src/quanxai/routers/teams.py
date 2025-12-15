"""Team CRUD endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List, Optional

from quanxai.database import get_session, Team

router = APIRouter()


@router.get("/", response_model=List[Team])
def list_teams(
    organization_id: Optional[str] = Query(None),
    session: Session = Depends(get_session)
):
    """List teams, optionally filtered by organization."""
    query = select(Team).where(Team.is_active == True)
    if organization_id:
        query = query.where(Team.organization_id == organization_id)
    teams = session.exec(query).all()
    return teams


@router.get("/{team_id}", response_model=Team)
def get_team(team_id: str, session: Session = Depends(get_session)):
    """Get team by ID."""
    team = session.get(Team, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team

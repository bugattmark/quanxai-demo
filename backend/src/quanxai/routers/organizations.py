"""Organization CRUD endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List

from quanxai.database import get_session, Organization

router = APIRouter()


@router.get("/", response_model=List[Organization])
def list_organizations(session: Session = Depends(get_session)):
    """List all organizations."""
    organizations = session.exec(select(Organization).where(Organization.is_active == True)).all()
    return organizations


@router.get("/{org_id}", response_model=Organization)
def get_organization(org_id: str, session: Session = Depends(get_session)):
    """Get organization by ID."""
    org = session.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org

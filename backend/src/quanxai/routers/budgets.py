"""Budget Management API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, func
from typing import Optional, List
from datetime import datetime, timedelta
from pydantic import BaseModel
import json

from quanxai.database import get_session, Budget, Team, User, APIKey

router = APIRouter()


class BudgetCreate(BaseModel):
    """Request body for creating a budget."""
    name: str
    description: Optional[str] = None
    max_budget_usd: float
    period: str = "monthly"  # "daily" | "weekly" | "monthly" | "total"
    alert_threshold: float = 0.8
    entity_type: str  # "organization" | "team" | "user" | "key"
    entity_id: str
    organization_id: str


class BudgetUpdate(BaseModel):
    """Request body for updating a budget."""
    name: Optional[str] = None
    description: Optional[str] = None
    max_budget_usd: Optional[float] = None
    alert_threshold: Optional[float] = None
    is_active: Optional[bool] = None


class BudgetResponse(BaseModel):
    """Response model for a budget."""
    id: str
    name: str
    description: Optional[str]
    max_budget_usd: float
    spent_usd: float
    period: str
    alert_threshold: float
    entity_type: str
    entity_id: str
    entity_name: str
    status: str  # "healthy" | "warning" | "critical" | "exceeded"
    period_start: datetime
    reset_date: Optional[datetime]
    alerts_triggered: List[str]
    organization_id: str
    created_at: datetime
    is_active: bool


class BudgetAlert(BaseModel):
    """Budget alert model."""
    id: str
    budget_id: str
    budget_name: str
    entity_name: str
    threshold: int
    percent_used: float
    severity: str
    acknowledged: bool
    triggered_at: datetime


class BudgetMetrics(BaseModel):
    """Budget metrics response."""
    total_budgets: int
    total_allocated: float
    total_spent: float
    budgets_exceeded: int
    budgets_critical: int
    budgets_warning: int
    budgets_healthy: int
    unacknowledged_alerts: int


def get_entity_name(entity_type: str, entity_id: str, session: Session) -> str:
    """Get entity name by type and ID."""
    if entity_type == "team":
        entity = session.get(Team, entity_id)
        return entity.name if entity else "Unknown Team"
    elif entity_type == "user":
        entity = session.get(User, entity_id)
        return entity.name if entity else "Unknown User"
    elif entity_type == "key":
        entity = session.get(APIKey, entity_id)
        return entity.alias if entity else "Unknown Key"
    else:
        return "Organization"


def get_budget_status(spent: float, max_budget: float, threshold: float) -> tuple[str, List[str]]:
    """Calculate budget status and triggered alerts."""
    percent_used = (spent / max_budget * 100) if max_budget > 0 else 0
    alerts = []

    if percent_used >= 100:
        status = "exceeded"
        alerts = ["50", "75", "90", "100"]
    elif percent_used >= 90:
        status = "critical"
        alerts = ["50", "75", "90"]
    elif percent_used >= threshold * 100:
        status = "warning"
        alerts = ["50", "75"] if percent_used >= 75 else ["50"]
    else:
        status = "healthy"
        if percent_used >= 50:
            alerts = ["50"]

    return status, alerts


def get_reset_date(period: str, period_start: datetime) -> Optional[datetime]:
    """Calculate next reset date based on period."""
    if period == "daily":
        return period_start + timedelta(days=1)
    elif period == "weekly":
        return period_start + timedelta(weeks=1)
    elif period == "monthly":
        # Add roughly one month
        next_month = period_start.month + 1
        year = period_start.year
        if next_month > 12:
            next_month = 1
            year += 1
        return period_start.replace(year=year, month=next_month)
    else:  # total - no reset
        return None


@router.get("/", response_model=List[BudgetResponse])
def list_budgets(
    organization_id: Optional[str] = Query(None),
    entity_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    session: Session = Depends(get_session)
):
    """List all budgets."""
    query = select(Budget)

    if organization_id:
        query = query.where(Budget.organization_id == organization_id)
    if entity_type:
        query = query.where(Budget.entity_type == entity_type)

    query = query.order_by(Budget.created_at.desc())
    budgets = session.exec(query).all()

    result = []
    for b in budgets:
        entity_name = get_entity_name(b.entity_type, b.entity_id, session)
        budget_status, alerts = get_budget_status(b.spent_usd, b.max_budget_usd, b.alert_threshold)

        if status and budget_status != status:
            continue

        result.append(BudgetResponse(
            id=b.id,
            name=b.name,
            description=b.description,
            max_budget_usd=b.max_budget_usd,
            spent_usd=b.spent_usd,
            period=b.period,
            alert_threshold=b.alert_threshold,
            entity_type=b.entity_type,
            entity_id=b.entity_id,
            entity_name=entity_name,
            status=budget_status,
            period_start=b.period_start,
            reset_date=get_reset_date(b.period, b.period_start),
            alerts_triggered=alerts,
            organization_id=b.organization_id,
            created_at=b.created_at,
            is_active=b.is_active,
        ))

    return result


@router.get("/metrics", response_model=BudgetMetrics)
def get_budget_metrics(session: Session = Depends(get_session)):
    """Get budget metrics for dashboard."""
    budgets = session.exec(select(Budget).where(Budget.is_active == True)).all()

    total_allocated = sum(b.max_budget_usd for b in budgets)
    total_spent = sum(b.spent_usd for b in budgets)

    exceeded = 0
    critical = 0
    warning = 0
    healthy = 0
    unacknowledged = 0

    for b in budgets:
        status, alerts = get_budget_status(b.spent_usd, b.max_budget_usd, b.alert_threshold)
        if status == "exceeded":
            exceeded += 1
            unacknowledged += 1
        elif status == "critical":
            critical += 1
            unacknowledged += 1
        elif status == "warning":
            warning += 1
        else:
            healthy += 1

    return BudgetMetrics(
        total_budgets=len(budgets),
        total_allocated=total_allocated,
        total_spent=total_spent,
        budgets_exceeded=exceeded,
        budgets_critical=critical,
        budgets_warning=warning,
        budgets_healthy=healthy,
        unacknowledged_alerts=unacknowledged,
    )


@router.post("/", response_model=BudgetResponse)
def create_budget(
    data: BudgetCreate,
    session: Session = Depends(get_session)
):
    """Create a new budget."""
    budget = Budget(
        name=data.name,
        description=data.description,
        max_budget_usd=data.max_budget_usd,
        period=data.period,
        alert_threshold=data.alert_threshold,
        entity_type=data.entity_type,
        entity_id=data.entity_id,
        organization_id=data.organization_id,
    )

    session.add(budget)
    session.commit()
    session.refresh(budget)

    entity_name = get_entity_name(data.entity_type, data.entity_id, session)

    return BudgetResponse(
        id=budget.id,
        name=budget.name,
        description=budget.description,
        max_budget_usd=budget.max_budget_usd,
        spent_usd=0,
        period=budget.period,
        alert_threshold=budget.alert_threshold,
        entity_type=budget.entity_type,
        entity_id=budget.entity_id,
        entity_name=entity_name,
        status="healthy",
        period_start=budget.period_start,
        reset_date=get_reset_date(budget.period, budget.period_start),
        alerts_triggered=[],
        organization_id=budget.organization_id,
        created_at=budget.created_at,
        is_active=budget.is_active,
    )


@router.get("/alerts", response_model=List[BudgetAlert])
def list_budget_alerts(
    severity: Optional[str] = Query(None),
    acknowledged: Optional[bool] = Query(None),
    session: Session = Depends(get_session)
):
    """List budget alerts."""
    budgets = session.exec(select(Budget).where(Budget.is_active == True)).all()

    alerts = []
    for b in budgets:
        status, triggered = get_budget_status(b.spent_usd, b.max_budget_usd, b.alert_threshold)
        entity_name = get_entity_name(b.entity_type, b.entity_id, session)
        percent_used = (b.spent_usd / b.max_budget_usd * 100) if b.max_budget_usd > 0 else 0

        for threshold in triggered:
            alert_severity = "critical" if int(threshold) >= 90 else "warning" if int(threshold) >= 75 else "info"

            if severity and alert_severity != severity:
                continue

            # Assume unacknowledged if over 90%
            is_acknowledged = percent_used < 90

            if acknowledged is not None and is_acknowledged != acknowledged:
                continue

            alerts.append(BudgetAlert(
                id=f"{b.id}-{threshold}",
                budget_id=b.id,
                budget_name=b.name,
                entity_name=entity_name,
                threshold=int(threshold),
                percent_used=percent_used,
                severity=alert_severity,
                acknowledged=is_acknowledged,
                triggered_at=b.updated_at,
            ))

    return sorted(alerts, key=lambda x: x.triggered_at, reverse=True)


@router.get("/by-entity-type")
def get_budgets_by_entity_type(session: Session = Depends(get_session)):
    """Get budgets grouped by entity type."""
    budgets = session.exec(select(Budget).where(Budget.is_active == True)).all()

    by_type = {}
    for b in budgets:
        if b.entity_type not in by_type:
            by_type[b.entity_type] = {"total_budget": 0, "total_spent": 0, "count": 0}

        by_type[b.entity_type]["total_budget"] += b.max_budget_usd
        by_type[b.entity_type]["total_spent"] += b.spent_usd
        by_type[b.entity_type]["count"] += 1

    return [
        {
            "type": t,
            "total_budget": data["total_budget"],
            "total_spent": data["total_spent"],
            "count": data["count"],
        }
        for t, data in by_type.items()
    ]


@router.get("/trend")
def get_budget_trend(
    range: str = Query("last30days"),
    session: Session = Depends(get_session)
):
    """Get budget spend trend over time."""
    from quanxai.database import UsageLog

    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=30 if range == "last30days" else 7)

    result = []
    current_date = start_date.date()

    while current_date <= end_date.date():
        next_date = current_date + timedelta(days=1)

        day_spend = session.exec(
            select(func.sum(UsageLog.total_cost_usd))
            .where(UsageLog.created_at >= datetime.combine(current_date, datetime.min.time()))
            .where(UsageLog.created_at < datetime.combine(next_date, datetime.min.time()))
        ).first() or 0

        result.append({
            "date": current_date.isoformat(),
            "daily_spend": float(day_spend),
        })

        current_date = next_date

    return result


@router.get("/{budget_id}", response_model=BudgetResponse)
def get_budget(budget_id: str, session: Session = Depends(get_session)):
    """Get a specific budget."""
    budget = session.get(Budget, budget_id)
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    entity_name = get_entity_name(budget.entity_type, budget.entity_id, session)
    status, alerts = get_budget_status(budget.spent_usd, budget.max_budget_usd, budget.alert_threshold)

    return BudgetResponse(
        id=budget.id,
        name=budget.name,
        description=budget.description,
        max_budget_usd=budget.max_budget_usd,
        spent_usd=budget.spent_usd,
        period=budget.period,
        alert_threshold=budget.alert_threshold,
        entity_type=budget.entity_type,
        entity_id=budget.entity_id,
        entity_name=entity_name,
        status=status,
        period_start=budget.period_start,
        reset_date=get_reset_date(budget.period, budget.period_start),
        alerts_triggered=alerts,
        organization_id=budget.organization_id,
        created_at=budget.created_at,
        is_active=budget.is_active,
    )


@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(
    budget_id: str,
    data: BudgetUpdate,
    session: Session = Depends(get_session)
):
    """Update a budget."""
    budget = session.get(Budget, budget_id)
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    if data.name is not None:
        budget.name = data.name
    if data.description is not None:
        budget.description = data.description
    if data.max_budget_usd is not None:
        budget.max_budget_usd = data.max_budget_usd
    if data.alert_threshold is not None:
        budget.alert_threshold = data.alert_threshold
    if data.is_active is not None:
        budget.is_active = data.is_active

    budget.updated_at = datetime.utcnow()

    session.add(budget)
    session.commit()
    session.refresh(budget)

    return get_budget(budget_id, session)


@router.delete("/{budget_id}")
def delete_budget(budget_id: str, session: Session = Depends(get_session)):
    """Delete a budget."""
    budget = session.get(Budget, budget_id)
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    session.delete(budget)
    session.commit()

    return {"message": "Budget deleted successfully"}

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
import uuid
from ..database.connection import get_db
from ..services.effective_status import EffectiveStatusService

router = APIRouter()

@router.get("/kpis/monthly-totals")
async def get_monthly_totals(
    planner_id: uuid.UUID, 
    scenario: str = "ALL", 
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get monthly financial totals with effective status calculations
    """
    try:
        totals = EffectiveStatusService.calculate_monthly_totals(db, planner_id, scenario)
        return {
            "planner_id": str(planner_id),
            "scenario": scenario,
            "totals": totals
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating monthly totals: {str(e)}")

@router.get("/kpis/effective-liabilities")
async def get_effective_liabilities(
    planner_id: uuid.UUID, 
    scenario: str = "ALL", 
    db: Session = Depends(get_db)
):
    """
    Get liabilities with effective status calculated
    """
    try:
        liabilities = EffectiveStatusService.get_effective_liabilities(db, planner_id, scenario)
        return {
            "planner_id": str(planner_id),
            "scenario": scenario,
            "liabilities": liabilities
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting effective liabilities: {str(e)}")

@router.get("/kpis/effective-expenses")
async def get_effective_expenses(
    planner_id: uuid.UUID, 
    scenario: str = "ALL", 
    db: Session = Depends(get_db)
):
    """
    Get expenses with effective status calculated
    """
    try:
        expenses = EffectiveStatusService.get_effective_expenses(db, planner_id, scenario)
        return {
            "planner_id": str(planner_id),
            "scenario": scenario,
            "expenses": expenses
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting effective expenses: {str(e)}")

@router.get("/kpis/effective-bills")
async def get_effective_bills(
    planner_id: uuid.UUID, 
    scenario: str = "ALL", 
    db: Session = Depends(get_db)
):
    """
    Get bills with effective status calculated
    """
    try:
        bills = EffectiveStatusService.get_effective_bills(db, planner_id, scenario)
        return {
            "planner_id": str(planner_id),
            "scenario": scenario,
            "bills": bills
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting effective bills: {str(e)}")

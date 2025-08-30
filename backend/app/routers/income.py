from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from ..database.connection import get_db
from ..models.income import Income
from ..schemas.income import IncomeCreate, IncomeUpdate, IncomeResponse

router = APIRouter()

@router.get("/income", response_model=List[IncomeResponse])
async def get_income(
    planner_id: uuid.UUID, 
    scenario: str = "ALL", 
    db: Session = Depends(get_db)
):
    """Get all income entries for a planner, optionally filtered by scenario"""
    query = db.query(Income).filter(Income.planner_id == planner_id)
    
    if scenario != "ALL":
        query = query.filter(Income.scenario == scenario)
    
    income_entries = query.all()
    return income_entries

@router.get("/income/{income_id}", response_model=IncomeResponse)
async def get_income_entry(income_id: uuid.UUID, db: Session = Depends(get_db)):
    """Get a specific income entry by ID"""
    income = db.query(Income).filter(Income.id == income_id).first()
    if not income:
        raise HTTPException(status_code=404, detail="Income entry not found")
    return income

@router.post("/income", response_model=IncomeResponse)
async def create_income(income: IncomeCreate, db: Session = Depends(get_db)):
    """Create a new income entry"""
    db_income = Income(**income.model_dump())
    db.add(db_income)
    db.commit()
    db.refresh(db_income)
    return db_income

@router.put("/income/{income_id}", response_model=IncomeResponse)
async def update_income(
    income_id: uuid.UUID, 
    income: IncomeUpdate, 
    db: Session = Depends(get_db)
):
    """Update an existing income entry"""
    db_income = db.query(Income).filter(Income.id == income_id).first()
    if not db_income:
        raise HTTPException(status_code=404, detail="Income entry not found")
    
    update_data = income.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_income, field, value)
    
    db.commit()
    db.refresh(db_income)
    return db_income

@router.delete("/income/{income_id}")
async def delete_income(income_id: uuid.UUID, db: Session = Depends(get_db)):
    """Delete an income entry"""
    db_income = db.query(Income).filter(Income.id == income_id).first()
    if not db_income:
        raise HTTPException(status_code=404, detail="Income entry not found")
    
    db.delete(db_income)
    db.commit()
    return {"message": "Income entry deleted successfully"}

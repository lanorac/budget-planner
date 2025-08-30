from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from ..database.connection import get_db
from ..models.liabilities import Liability
from ..schemas.liability import LiabilityCreate, LiabilityUpdate, LiabilityResponse

router = APIRouter()

@router.get("/liabilities", response_model=List[LiabilityResponse])
async def get_liabilities(
    planner_id: uuid.UUID, 
    scenario: str = "ALL", 
    db: Session = Depends(get_db)
):
    """Get all liabilities for a planner, optionally filtered by scenario"""
    query = db.query(Liability).filter(Liability.planner_id == planner_id)
    
    if scenario != "ALL":
        query = query.filter(Liability.scenario == scenario)
    
    liabilities = query.all()
    return liabilities

@router.get("/liabilities/{liability_id}", response_model=LiabilityResponse)
async def get_liability(liability_id: uuid.UUID, db: Session = Depends(get_db)):
    """Get a specific liability by ID"""
    liability = db.query(Liability).filter(Liability.id == liability_id).first()
    if not liability:
        raise HTTPException(status_code=404, detail="Liability not found")
    return liability

@router.post("/liabilities", response_model=LiabilityResponse)
async def create_liability(liability: LiabilityCreate, db: Session = Depends(get_db)):
    """Create a new liability"""
    db_liability = Liability(**liability.model_dump())
    db.add(db_liability)
    db.commit()
    db.refresh(db_liability)
    return db_liability

@router.put("/liabilities/{liability_id}", response_model=LiabilityResponse)
async def update_liability(
    liability_id: uuid.UUID, 
    liability: LiabilityUpdate, 
    db: Session = Depends(get_db)
):
    """Update an existing liability"""
    db_liability = db.query(Liability).filter(Liability.id == liability_id).first()
    if not db_liability:
        raise HTTPException(status_code=404, detail="Liability not found")
    
    update_data = liability.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_liability, field, value)
    
    db.commit()
    db.refresh(db_liability)
    return db_liability

@router.delete("/liabilities/{liability_id}")
async def delete_liability(liability_id: uuid.UUID, db: Session = Depends(get_db)):
    """Delete a liability"""
    db_liability = db.query(Liability).filter(Liability.id == liability_id).first()
    if not db_liability:
        raise HTTPException(status_code=404, detail="Liability not found")
    
    db.delete(db_liability)
    db.commit()
    return {"message": "Liability deleted successfully"}

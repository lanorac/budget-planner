from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from ..database.connection import get_db
from ..models.bills import Bill
from ..schemas.bill import BillCreate, BillUpdate, BillResponse

router = APIRouter()

@router.get("/bills", response_model=List[BillResponse])
async def get_bills(
    planner_id: uuid.UUID, 
    scenario: str = "ALL", 
    db: Session = Depends(get_db)
):
    """Get all bills for a planner, optionally filtered by scenario"""
    query = db.query(Bill).filter(Bill.planner_id == planner_id)
    
    if scenario != "ALL":
        query = query.filter(Bill.scenario == scenario)
    
    bills = query.all()
    return bills

@router.get("/bills/{bill_id}", response_model=BillResponse)
async def get_bill(bill_id: uuid.UUID, db: Session = Depends(get_db)):
    """Get a specific bill by ID"""
    bill = db.query(Bill).filter(Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    return bill

@router.post("/bills", response_model=BillResponse)
async def create_bill(bill: BillCreate, db: Session = Depends(get_db)):
    """Create a new bill"""
    db_bill = Bill(**bill.model_dump())
    db.add(db_bill)
    db.commit()
    db.refresh(db_bill)
    return db_bill

@router.put("/bills/{bill_id}", response_model=BillResponse)
async def update_bill(
    bill_id: uuid.UUID, 
    bill: BillUpdate, 
    db: Session = Depends(get_db)
):
    """Update an existing bill"""
    db_bill = db.query(Bill).filter(Bill.id == bill_id).first()
    if not db_bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    
    update_data = bill.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_bill, field, value)
    
    db.commit()
    db.refresh(db_bill)
    return db_bill

@router.delete("/bills/{bill_id}")
async def delete_bill(bill_id: uuid.UUID, db: Session = Depends(get_db)):
    """Delete a bill"""
    db_bill = db.query(Bill).filter(Bill.id == bill_id).first()
    if not db_bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    
    db.delete(db_bill)
    db.commit()
    return {"message": "Bill deleted successfully"}

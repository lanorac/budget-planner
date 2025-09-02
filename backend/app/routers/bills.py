from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from decimal import Decimal
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
    """Get all bills for a planner, filtered by scenario"""
    if scenario == "ALL":
        # For table view: show ALL bills regardless of scenario
        bills = db.query(Bill).filter(
            Bill.planner_id == planner_id
        ).all()
    else:
        # For overview calculations: filter by specific scenario (including ALL scenario bills)
        bills = db.query(Bill).filter(
            Bill.planner_id == planner_id,
            (Bill.scenario == "ALL") | (Bill.scenario == scenario)
        ).all()
    
    # Calculate monthly_average for each bill if not already set
    for bill in bills:
        if bill.monthly_average == 0 and bill.bill_amount > 0 and bill.interval_months > 0:
            bill.monthly_average = bill.bill_amount / bill.interval_months
    
    return bills

@router.get("/bills/{bill_id}", response_model=BillResponse)
async def get_bill(bill_id: uuid.UUID, db: Session = Depends(get_db)):
    """Get a specific bill by ID"""
    bill = db.query(Bill).filter(Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    
    # Calculate monthly_average if not already set
    if bill.monthly_average == 0 and bill.bill_amount > 0 and bill.interval_months > 0:
        bill.monthly_average = bill.bill_amount / bill.interval_months
    
    return bill

@router.post("/bills", response_model=BillResponse)
async def create_bill(bill: BillCreate, db: Session = Depends(get_db)):
    """Create a new bill"""
    # Calculate monthly_average and set monthly_amount for backward compatibility
    monthly_average = bill.bill_amount / bill.interval_months if bill.interval_months > 0 else Decimal('0.00')
    
    bill_data = bill.model_dump()
    bill_data['monthly_average'] = monthly_average
    bill_data['monthly_amount'] = monthly_average  # Legacy field
    
    db_bill = Bill(**bill_data)
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
    
    # Recalculate monthly_average if bill_amount or interval_months changed
    if 'bill_amount' in update_data or 'interval_months' in update_data:
        bill_amount = update_data.get('bill_amount', db_bill.bill_amount)
        interval_months = update_data.get('interval_months', db_bill.interval_months)
        
        if interval_months > 0:
            monthly_average = bill_amount / interval_months
            update_data['monthly_average'] = monthly_average
            update_data['monthly_amount'] = monthly_average  # Legacy field
    
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

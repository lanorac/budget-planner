from pydantic import BaseModel, Field, computed_field
from typing import Optional
from decimal import Decimal
import uuid
from datetime import datetime

class BillBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    include_toggle: str = Field(..., pattern="^(on|off)$")
    scenario: str = Field(..., pattern="^(ALL|A|B|C)$")
    
    # Enhanced billing fields
    bill_amount: Decimal = Field(..., ge=0, description="Total bill amount")
    interval_months: int = Field(..., ge=1, le=12, description="How often bill is paid (1=monthly, 3=quarterly, etc.)")
    
    # Optional fields
    category_id: Optional[uuid.UUID] = None
    linked_asset_id: Optional[uuid.UUID] = None
    linked_liability_id: Optional[uuid.UUID] = None
    notes: Optional[str] = None
    
    @computed_field
    @property
    def monthly_average(self) -> Decimal:
        """Calculate monthly average from bill amount and interval"""
        if self.interval_months <= 0:
            return Decimal('0.00')
        return self.bill_amount / self.interval_months

class BillCreate(BillBase):
    planner_id: uuid.UUID

class BillUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    include_toggle: Optional[str] = Field(None, pattern="^(on|off)$")
    scenario: Optional[str] = Field(None, pattern="^(ALL|A|B|C)$")
    bill_amount: Optional[Decimal] = Field(None, ge=0)
    interval_months: Optional[int] = Field(None, ge=1, le=12)
    category_id: Optional[uuid.UUID] = None
    linked_asset_id: Optional[uuid.UUID] = None
    linked_liability_id: Optional[uuid.UUID] = None
    notes: Optional[str] = None

class BillResponse(BillBase):
    id: uuid.UUID
    planner_id: uuid.UUID
    monthly_average: Decimal  # Include the calculated field in response
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

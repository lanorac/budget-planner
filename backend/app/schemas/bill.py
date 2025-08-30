from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal
import uuid
from datetime import datetime

class BillBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    include_toggle: str = Field(..., pattern="^(on|off)$")
    scenario: str = Field(..., pattern="^(ALL|A|B|C)$")
    monthly_amount: Decimal = Field(..., ge=0)
    category_id: Optional[uuid.UUID] = None
    linked_asset_id: Optional[uuid.UUID] = None
    linked_liability_id: Optional[uuid.UUID] = None
    notes: Optional[str] = None

class BillCreate(BillBase):
    planner_id: uuid.UUID

class BillUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    include_toggle: Optional[str] = Field(None, pattern="^(on|off)$")
    scenario: Optional[str] = Field(None, pattern="^(ALL|A|B|C)$")
    monthly_amount: Optional[Decimal] = Field(None, ge=0)
    category_id: Optional[uuid.UUID] = None
    linked_asset_id: Optional[uuid.UUID] = None
    linked_liability_id: Optional[uuid.UUID] = None
    notes: Optional[str] = None

class BillResponse(BillBase):
    id: uuid.UUID
    planner_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

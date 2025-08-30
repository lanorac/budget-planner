from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal
import uuid
from datetime import datetime

class LiabilityBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    include_toggle: str = Field(..., pattern="^(on|off)$")
    scenario: str = Field(..., pattern="^(ALL|A|B|C)$")
    monthly_cost: Decimal = Field(..., ge=0)
    principal: Optional[Decimal] = Field(None, ge=0)
    linked_asset_id: Optional[uuid.UUID] = None
    notes: Optional[str] = None

class LiabilityCreate(LiabilityBase):
    planner_id: uuid.UUID

class LiabilityUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    include_toggle: Optional[str] = Field(None, pattern="^(on|off)$")
    scenario: Optional[str] = Field(None, pattern="^(ALL|A|B|C)$")
    monthly_cost: Optional[Decimal] = Field(None, ge=0)
    principal: Optional[Decimal] = Field(None, ge=0)
    linked_asset_id: Optional[uuid.UUID] = None
    notes: Optional[str] = None

class LiabilityResponse(LiabilityBase):
    id: uuid.UUID
    planner_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

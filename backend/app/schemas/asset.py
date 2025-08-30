from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal
import uuid
from datetime import datetime

class AssetBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    include_toggle: str = Field(..., pattern="^(on|off)$")
    scenario: str = Field(..., pattern="^(ALL|A|B|C)$")
    sale_value: Decimal = Field(..., ge=0)
    notes: Optional[str] = None

class AssetCreate(AssetBase):
    planner_id: uuid.UUID

class AssetUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    include_toggle: Optional[str] = Field(None, pattern="^(on|off)$")
    scenario: Optional[str] = Field(None, pattern="^(ALL|A|B|C)$")
    sale_value: Optional[Decimal] = Field(None, ge=0)
    notes: Optional[str] = None

class AssetResponse(AssetBase):
    id: uuid.UUID
    planner_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

from pydantic import BaseModel, Field
from typing import Optional, List
import uuid
from datetime import datetime

class ScenarioBase(BaseModel):
    scenario: str = Field(..., pattern="^[A-Z0-9]+$", description="Scenario identifier (A, B, C, etc.)")
    display_name: str = Field(..., min_length=1, max_length=255, description="User-friendly scenario name")
    sale_month: int = Field(..., ge=0, le=12, description="Month to sell assets (0 = no sales)")

class ScenarioCreate(ScenarioBase):
    planner_id: uuid.UUID

class ScenarioUpdate(BaseModel):
    display_name: Optional[str] = Field(None, min_length=1, max_length=255)
    sale_month: Optional[int] = Field(None, ge=0, le=12)

class ScenarioResponse(ScenarioBase):
    id: uuid.UUID
    planner_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ScenarioItemBase(BaseModel):
    item_id: uuid.UUID
    item_type: str = Field(..., pattern="^(asset|liability|income|expense|bill)$")
    scenario_id: str = Field(..., pattern="^[A-Z0-9]+$")

class ScenarioItemCreate(ScenarioItemBase):
    pass

class ScenarioItemResponse(ScenarioItemBase):
    id: uuid.UUID
    created_at: datetime
    
    class Config:
        from_attributes = True

class ScenarioWithItems(ScenarioResponse):
    items: List[ScenarioItemResponse] = []

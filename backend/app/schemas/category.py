from pydantic import BaseModel, Field
from typing import Optional
import uuid
from datetime import datetime

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    kind: str = Field(..., pattern="^(expense|bill)$")

class CategoryCreate(CategoryBase):
    planner_id: uuid.UUID

class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    kind: Optional[str] = Field(None, pattern="^(expense|bill)$")

class CategoryResponse(CategoryBase):
    id: uuid.UUID
    planner_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

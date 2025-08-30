from sqlalchemy import Column, String, Text, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from .base import Base, TimestampMixin

class Expense(Base, TimestampMixin):
    __tablename__ = "expenses"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    planner_id = Column(UUID(as_uuid=True), ForeignKey("planners.id"), nullable=False)
    name = Column(Text, nullable=False)
    include_toggle = Column(String, nullable=False, default="on")  # 'on' or 'off'
    scenario = Column(String, nullable=False, default="ALL")  # 'ALL', 'A', 'B', 'C'
    monthly_amount = Column(Numeric(14, 2), nullable=False, default=0.00)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"))
    linked_asset_id = Column(UUID(as_uuid=True), ForeignKey("assets.id"))
    linked_liab_id = Column(UUID(as_uuid=True), ForeignKey("liabilities.id"))
    notes = Column(Text)
    
    # Relationships
    planner = relationship("Planner", back_populates="expenses")
    category = relationship("Category", back_populates="expenses")
    linked_asset = relationship("Asset", back_populates="linked_expenses")
    linked_liability = relationship("Liability", back_populates="linked_expenses")

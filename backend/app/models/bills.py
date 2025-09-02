from sqlalchemy import Column, String, Text, ForeignKey, Numeric, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from .base import Base, TimestampMixin

class Bill(Base, TimestampMixin):
    __tablename__ = "bills"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    planner_id = Column(UUID(as_uuid=True), ForeignKey("planners.id"), nullable=False)
    name = Column(Text, nullable=False)
    include_toggle = Column(String, nullable=False, default="on")  # 'on' or 'off'
    scenario = Column(String, nullable=False, default="ALL")  # 'ALL', 'A', 'B', 'C'
    
    # Enhanced billing fields
    bill_amount = Column(Numeric(14, 2), nullable=False, default=0.00)  # Total bill amount
    interval_months = Column(Integer, nullable=False, default=1)  # How often bill is paid (1=monthly, 3=quarterly, etc.)
    monthly_average = Column(Numeric(14, 2), nullable=False, default=0.00)  # Calculated monthly average
    
    # Legacy field for backward compatibility (will be calculated from bill_amount / interval_months)
    monthly_amount = Column(Numeric(14, 2), nullable=False, default=0.00)
    
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"))
    linked_asset_id = Column(UUID(as_uuid=True), ForeignKey("assets.id"))
    linked_liab_id = Column(UUID(as_uuid=True), ForeignKey("liabilities.id"))
    notes = Column(Text)
    
    # Relationships
    planner = relationship("Planner", back_populates="bills")
    category = relationship("Category", back_populates="bills")
    linked_asset = relationship("Asset", back_populates="linked_bills")
    linked_liability = relationship("Liability", back_populates="linked_bills")

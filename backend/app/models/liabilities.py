from sqlalchemy import Column, String, Text, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from .base import Base, TimestampMixin

class Liability(Base, TimestampMixin):
    __tablename__ = "liabilities"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    planner_id = Column(UUID(as_uuid=True), ForeignKey("planners.id"), nullable=False)
    name = Column(Text, nullable=False)
    include_toggle = Column(String, nullable=False, default="on")  # 'on' or 'off'
    scenario = Column(String, nullable=False, default="ALL")  # 'ALL', 'A', 'B', 'C'
    monthly_cost = Column(Numeric(14, 2), nullable=False, default=0.00)
    principal = Column(Numeric(14, 2))
    linked_asset_id = Column(UUID(as_uuid=True), ForeignKey("assets.id"))
    notes = Column(Text)
    
    # Relationships
    planner = relationship("Planner", back_populates="liabilities")
    linked_asset = relationship("Asset", back_populates="linked_liabilities")
    linked_expenses = relationship("Expense", back_populates="linked_liability")
    linked_bills = relationship("Bill", back_populates="linked_liability")

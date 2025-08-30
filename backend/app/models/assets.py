from sqlalchemy import Column, String, Text, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from .base import Base, TimestampMixin

class Asset(Base, TimestampMixin):
    __tablename__ = "assets"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    planner_id = Column(UUID(as_uuid=True), ForeignKey("planners.id"), nullable=False)
    name = Column(Text, nullable=False)
    include_toggle = Column(String, nullable=False, default="off")  # 'on' or 'off'
    scenario = Column(String, nullable=False, default="ALL")  # 'ALL', 'A', 'B', 'C'
    sale_value = Column(Numeric(14, 2), nullable=False, default=0.00)
    notes = Column(Text)
    
    # Relationships
    planner = relationship("Planner", back_populates="assets")
    linked_liabilities = relationship("Liability", back_populates="linked_asset")
    linked_expenses = relationship("Expense", back_populates="linked_asset")
    linked_bills = relationship("Bill", back_populates="linked_asset")

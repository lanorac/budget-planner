from sqlalchemy import Column, String, Text, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from .base import Base, TimestampMixin

class Category(Base, TimestampMixin):
    __tablename__ = "categories"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    planner_id = Column(UUID(as_uuid=True), ForeignKey("planners.id"), nullable=False)
    kind = Column(String, nullable=False)  # 'expense' or 'bill'
    name = Column(Text, nullable=False)
    
    # Relationships
    planner = relationship("Planner", back_populates="categories")
    expenses = relationship("Expense", back_populates="category")
    bills = relationship("Bill", back_populates="category")
    
    __table_args__ = (UniqueConstraint("planner_id", "kind", "name"),)

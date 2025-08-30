from sqlalchemy import Column, String, Text, ForeignKey, Numeric, Integer, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from .base import Base, TimestampMixin

class Planner(Base, TimestampMixin):
    __tablename__ = "planners"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    household_id = Column(UUID(as_uuid=True), ForeignKey("households.id"))
    owner_user_id = Column(UUID(as_uuid=True), ForeignKey("app_users.id"), nullable=False)
    name = Column(Text, nullable=False, default="My Planner")
    
    # Relationships
    household = relationship("Household", back_populates="planners")
    owner = relationship("AppUser", back_populates="planners")
    settings = relationship("PlannerSettings", back_populates="planner", uselist=False)
    scenario_settings = relationship("ScenarioSettings", back_populates="planner")
    categories = relationship("Category", back_populates="planner")
    assets = relationship("Asset", back_populates="planner")
    liabilities = relationship("Liability", back_populates="planner")
    income = relationship("Income", back_populates="planner")
    expenses = relationship("Expense", back_populates="planner")
    bills = relationship("Bill", back_populates="planner")

class PlannerSettings(Base, TimestampMixin):
    __tablename__ = "planner_settings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    planner_id = Column(UUID(as_uuid=True), ForeignKey("planners.id"), nullable=False)
    starting_cash = Column(Numeric(14, 2), nullable=False, default=0.00)
    
    # Relationships
    planner = relationship("Planner", back_populates="settings")
    
    __table_args__ = (UniqueConstraint("planner_id"),)

class ScenarioSettings(Base, TimestampMixin):
    __tablename__ = "scenario_settings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    planner_id = Column(UUID(as_uuid=True), ForeignKey("planners.id"), nullable=False)
    scenario = Column(String, nullable=False)  # 'ALL', 'A', 'B', 'C'
    sale_month = Column(Integer)
    
    # Relationships
    planner = relationship("Planner", back_populates="scenario_settings")
    
    __table_args__ = (UniqueConstraint("planner_id", "scenario"),)

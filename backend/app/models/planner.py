from sqlalchemy import Column, String, Text, ForeignKey, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from .base import Base, TimestampMixin

class Planner(Base, TimestampMixin):
    __tablename__ = "planners"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(Text, nullable=False)
    household_id = Column(UUID(as_uuid=True), ForeignKey("households.id"), nullable=False)
    owner_user_id = Column(UUID(as_uuid=True), ForeignKey("app_users.id"), nullable=False)
    
    # Relationships
    household = relationship("Household", back_populates="planners")
    owner_user = relationship("AppUser", back_populates="planners")
    settings = relationship("PlannerSettings", back_populates="planner", uselist=False)
    scenario_settings = relationship("ScenarioSettings", back_populates="planner")
    assets = relationship("Asset", back_populates="planner")
    liabilities = relationship("Liability", back_populates="planner")
    income = relationship("Income", back_populates="planner")
    expenses = relationship("Expense", back_populates="planner")
    bills = relationship("Bill", back_populates="planner")
    categories = relationship("Category", back_populates="planner")

class PlannerSettings(Base, TimestampMixin):
    __tablename__ = "planner_settings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    planner_id = Column(UUID(as_uuid=True), ForeignKey("planners.id"), nullable=False)
    starting_cash = Column(Integer, nullable=False, default=0)
    
    # Relationships
    planner = relationship("Planner", back_populates="settings")

class ScenarioSettings(Base, TimestampMixin):
    __tablename__ = "scenario_settings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    planner_id = Column(UUID(as_uuid=True), ForeignKey("planners.id"), nullable=False)
    scenario = Column(String, nullable=False)  # 'A', 'B', 'C', etc.
    display_name = Column(Text, nullable=False, default="")  # User-friendly name like "Sell House"
    sale_month = Column(Integer, nullable=False, default=0)  # Month to sell assets (0 = no sales)
    
    # Relationships
    planner = relationship("Planner", back_populates="scenario_settings")
    scenario_items = relationship("ScenarioItem", back_populates="scenario")

class ScenarioItem(Base, TimestampMixin):
    __tablename__ = "scenario_items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    item_id = Column(UUID(as_uuid=True), nullable=False)  # ID of the asset/liability/income/expense/bill
    item_type = Column(String, nullable=False)  # 'asset', 'liability', 'income', 'expense', 'bill'
    scenario_id = Column(String, nullable=False)  # References scenario_settings.scenario
    
    # Relationships
    scenario = relationship("ScenarioSettings", back_populates="scenario_items")

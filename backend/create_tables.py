#!/usr/bin/env python3
"""
Create database tables script
"""

from app.database.connection import engine
from app.models.base import Base
from app.models.user import AppUser, Household, HouseholdMember
from app.models.planner import Planner, PlannerSettings, ScenarioSettings
from app.models.categories import Category
from app.models.assets import Asset
from app.models.liabilities import Liability
from app.models.income import Income
from app.models.expenses import Expense
from app.models.bills import Bill

def create_tables():
    """Create all database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")

if __name__ == "__main__":
    create_tables()

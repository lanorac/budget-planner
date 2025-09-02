#!/usr/bin/env python3
"""
Seed data script for the Budget Planner application
Creates sample data for testing and development
"""

import uuid
from decimal import Decimal
from sqlalchemy.orm import Session
from app.database.connection import SessionLocal
from app.models.user import AppUser, Household, HouseholdMember
from app.models.planner import Planner, PlannerSettings, ScenarioSettings
from app.models.categories import Category
from app.models.assets import Asset
from app.models.liabilities import Liability
from app.models.income import Income
from app.models.expenses import Expense
from app.models.bills import Bill

def create_seed_data():
    """Create sample data for testing"""
    db = SessionLocal()
    
    try:
        # Create sample user and household
        user = AppUser(
            id=uuid.uuid4(),
            email="test@example.com",
            display_name="John Doe"
        )
        db.add(user)
        db.flush()
        
        household = Household(
            id=uuid.uuid4(),
            name="Doe Family",
            owner_user_id=user.id
        )
        db.add(household)
        db.flush()
        
        # Create household member
        member = HouseholdMember(
            household_id=household.id,
            user_id=user.id,
            role="owner"
        )
        db.add(member)
        db.flush()
        
        # Create planner with consistent ID for frontend testing
        planner = Planner(
            id=uuid.UUID('550e8400-e29b-41d4-a716-446655440000'),
            name="Main Budget Plan",
            household_id=household.id,
            owner_user_id=user.id
        )
        db.add(planner)
        db.flush()
        
        # Create planner settings
        planner_settings = PlannerSettings(
            id=uuid.uuid4(),
            planner_id=planner.id,
            starting_cash=10000.00
        )
        db.add(planner_settings)
        
        # Create scenario settings
        scenario_a = ScenarioSettings(
            id=uuid.uuid4(),
            planner_id=planner.id,
            scenario="A",
            sale_month=0  # No sales
        )
        db.add(scenario_a)
        
        scenario_b = ScenarioSettings(
            id=uuid.uuid4(),
            planner_id=planner.id,
            scenario="B",
            sale_month=3  # Sell in month 3
        )
        db.add(scenario_b)
        
        scenario_c = ScenarioSettings(
            id=uuid.uuid4(),
            planner_id=planner.id,
            scenario="C",
            sale_month=1  # Sell in month 1
        )
        db.add(scenario_c)
        
        # Create categories
        categories = [
            Category(
                id=uuid.uuid4(),
                planner_id=planner.id,
                kind="expense",
                name="Housing"
            ),
            Category(
                id=uuid.uuid4(),
                planner_id=planner.id,
                kind="expense",
                name="Transportation"
            ),
            Category(
                id=uuid.uuid4(),
                planner_id=planner.id,
                kind="expense",
                name="Utilities"
            ),
            Category(
                id=uuid.uuid4(),
                planner_id=planner.id,
                kind="expense",
                name="Food"
            ),
            Category(
                id=uuid.uuid4(),
                planner_id=planner.id,
                kind="expense",
                name="Entertainment"
            )
        ]
        
        for category in categories:
            db.add(category)
        db.flush()
        
        # Create assets
        house = Asset(
            id=uuid.uuid4(),
            planner_id=planner.id,
            name="Family House",
            include_toggle="on",
            scenario="ALL",
            sale_value=Decimal("250000.00"),
            notes="Primary residence"
        )
        db.add(house)
        
        car = Asset(
            id=uuid.uuid4(),
            planner_id=planner.id,
            name="Family Car",
            include_toggle="on",
            scenario="ALL",
            sale_value=Decimal("15000.00"),
            notes="Main family vehicle"
        )
        db.add(car)
        
        db.flush()
        
        # Create liabilities
        mortgage = Liability(
            id=uuid.uuid4(),
            planner_id=planner.id,
            name="House Mortgage",
            include_toggle="on",
            scenario="ALL",
            monthly_cost=Decimal("1200.00"),
            principal=Decimal("180000.00"),
            linked_asset_id=house.id,
            notes="Primary mortgage"
        )
        db.add(mortgage)
        
        car_loan = Liability(
            id=uuid.uuid4(),
            planner_id=planner.id,
            name="Car Loan",
            include_toggle="on",
            scenario="ALL",
            monthly_cost=Decimal("300.00"),
            principal=Decimal("8000.00"),
            linked_asset_id=car.id,
            notes="Car financing"
        )
        db.add(car_loan)
        
        # Create income
        salary = Income(
            id=uuid.uuid4(),
            planner_id=planner.id,
            name="Primary Salary",
            include_toggle="on",
            scenario="ALL",
            monthly_amount=Decimal("4000.00"),
            notes="Main employment income"
        )
        db.add(salary)
        
        # Create expenses
        groceries = Expense(
            id=uuid.uuid4(),
            planner_id=planner.id,
            name="Groceries",
            include_toggle="on",
            scenario="ALL",
            monthly_amount=Decimal("600.00"),
            category_id=categories[3].id,  # Food category
            notes="Monthly grocery shopping"
        )
        db.add(groceries)
        
        gas = Expense(
            id=uuid.uuid4(),
            planner_id=planner.id,
            name="Gas & Fuel",
            include_toggle="on",
            scenario="ALL",
            monthly_amount=Decimal("200.00"),
            category_id=categories[1].id,  # Transportation category
            linked_asset_id=car.id,
            notes="Car fuel expenses"
        )
        db.add(gas)
        
        # Create bills with enhanced interval structure
        electricity = Bill(
            id=uuid.uuid4(),
            planner_id=planner.id,
            name="Electricity Bill",
            include_toggle="on",
            scenario="ALL",
            bill_amount=Decimal("150.00"),
            interval_months=1,
            monthly_average=Decimal("150.00"),
            monthly_amount=Decimal("150.00"),  # Legacy field
            category_id=categories[2].id,  # Utilities category
            linked_asset_id=house.id,
            notes="Monthly electricity"
        )
        db.add(electricity)
        
        internet = Bill(
            id=uuid.uuid4(),
            planner_id=planner.id,
            name="Internet & Phone",
            include_toggle="on",
            scenario="ALL",
            bill_amount=Decimal("80.00"),
            interval_months=1,
            monthly_average=Decimal("80.00"),
            monthly_amount=Decimal("80.00"),  # Legacy field
            category_id=categories[2].id,  # Utilities category
            notes="Internet and phone service"
        )
        db.add(internet)
        
        # Add some bills with different intervals for testing
        insurance = Bill(
            id=uuid.uuid4(),
            planner_id=planner.id,
            name="Home Insurance",
            include_toggle="on",
            scenario="ALL",
            bill_amount=Decimal("1200.00"),
            interval_months=12,
            monthly_average=Decimal("100.00"),
            monthly_amount=Decimal("100.00"),  # Legacy field
            category_id=categories[0].id,  # Housing category
            linked_asset_id=house.id,
            notes="Annual home insurance premium"
        )
        db.add(insurance)
        
        property_tax = Bill(
            id=uuid.uuid4(),
            planner_id=planner.id,
            name="Property Tax",
            include_toggle="on",
            scenario="ALL",
            bill_amount=Decimal("2400.00"),
            interval_months=12,
            monthly_average=Decimal("200.00"),
            monthly_amount=Decimal("200.00"),  # Legacy field
            category_id=categories[0].id,  # Housing category
            linked_asset_id=house.id,
            notes="Annual property tax"
        )
        db.add(property_tax)
        
        # Commit all changes
        db.commit()
        
        print("✅ Seed data created successfully!")
        print(f"📊 Created planner: {planner.name}")
        print(f"🏠 Created assets: House (€250,000), Car (€15,000)")
        print(f"💳 Created liabilities: Mortgage (€1,200/month), Car Loan (€300/month)")
        print(f"💰 Created income: Salary (€4,000/month)")
        print(f"📈 Created expenses: Groceries (€600/month), Gas (€200/month)")
        print(f"📋 Created bills: Electricity (€150/month), Internet (€80/month), Insurance (€1200/year), Property Tax (€2400/year)")
        print(f"🏷️  Created categories: Housing, Transportation, Utilities, Food, Entertainment")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating seed data: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_seed_data()

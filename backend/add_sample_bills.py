#!/usr/bin/env python3
"""Add sample bills with intervals to existing database"""

import sqlite3
from decimal import Decimal

def add_sample_bills():
    conn = sqlite3.connect('budget_planner.db')
    cursor = conn.cursor()
    
    try:
        # Get the planner ID
        cursor.execute("SELECT id FROM planners LIMIT 1")
        planner_result = cursor.fetchone()
        if not planner_result:
            print("No planner found!")
            return
        
        planner_id = planner_result[0]
        print(f"Using planner ID: {planner_id}")
        
        # Get a category ID
        cursor.execute("SELECT id FROM categories WHERE kind = 'expense' LIMIT 1")
        category_result = cursor.fetchone()
        category_id = category_result[0] if category_result else None
        
        # Add sample bills with intervals
        sample_bills = [
            ("Home Insurance", 1200.00, 12, 100.00, "Annual home insurance premium"),
            ("Property Tax", 2400.00, 12, 200.00, "Annual property tax"),
            ("Car Insurance", 600.00, 6, 100.00, "Semi-annual car insurance"),
            ("Water Bill", 90.00, 3, 30.00, "Quarterly water bill"),
            ("Garbage Collection", 120.00, 4, 30.00, "Every 4 months garbage collection")
        ]
        
        for name, bill_amount, interval_months, monthly_average, notes in sample_bills:
            cursor.execute("""
                INSERT INTO bills (id, planner_id, name, include_toggle, scenario, 
                                 bill_amount, interval_months, monthly_average, monthly_amount,
                                 category_id, notes, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            """, (
                str(uuid.uuid4()).replace('-', ''),
                planner_id,
                name,
                'on',
                'ALL',
                bill_amount,
                interval_months,
                monthly_average,
                monthly_average,  # Legacy field
                category_id,
                notes
            ))
            print(f"Added bill: {name} (€{bill_amount} every {interval_months} months)")
        
        conn.commit()
        print("Successfully added sample bills!")
        
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    import uuid
    add_sample_bills()

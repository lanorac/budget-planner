#!/usr/bin/env python3
"""Add the missing bill_amount column to bills table"""

import sqlite3

def add_bill_amount_column():
    conn = sqlite3.connect('budget_planner.db')
    cursor = conn.cursor()
    
    try:
        # Add bill_amount column
        cursor.execute("ALTER TABLE bills ADD COLUMN bill_amount DECIMAL(14,2) DEFAULT 0.00")
        print("Added bill_amount column")
        
        # Update existing records
        cursor.execute("""
            UPDATE bills 
            SET bill_amount = monthly_amount
            WHERE bill_amount IS NULL OR bill_amount = 0
        """)
        print("Updated existing records")
        
        conn.commit()
        print("Success!")
        
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    add_bill_amount_column()

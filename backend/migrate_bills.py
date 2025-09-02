#!/usr/bin/env python3
"""
Database migration script to add interval fields to bills table.
Run this script to update your existing database schema.
"""

import sqlite3
import os

def migrate_bills_table():
    """Add new interval fields to bills table"""
    
    # Connect to the database
    db_path = "budget_planner.db"
    if not os.path.exists(db_path):
        print(f"Database file {db_path} not found!")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if the new columns already exist
        cursor.execute("PRAGMA table_info(bills)")
        columns = [column[1] for column in cursor.fetchall()]
        
        print("Current bills table columns:", columns)
        
        # Add new columns if they don't exist
        if 'bill_amount' not in columns:
            print("Adding bill_amount column...")
            cursor.execute("ALTER TABLE bills ADD COLUMN bill_amount DECIMAL(14,2) DEFAULT 0.00")
        
        if 'interval_months' not in columns:
            print("Adding interval_months column...")
            cursor.execute("ALTER TABLE bills ADD COLUMN interval_months INTEGER DEFAULT 1")
        
        if 'monthly_average' not in columns:
            print("Adding monthly_average column...")
            cursor.execute("ALTER TABLE bills ADD COLUMN monthly_average DECIMAL(14,2) DEFAULT 0.00")
        
        # Update existing records to populate new fields
        print("Updating existing records...")
        cursor.execute("""
            UPDATE bills 
            SET bill_amount = monthly_amount,
                interval_months = 1,
                monthly_average = monthly_amount
            WHERE bill_amount IS NULL OR bill_amount = 0
        """)
        
        # Commit changes
        conn.commit()
        print("Migration completed successfully!")
        
        # Verify the new structure
        cursor.execute("PRAGMA table_info(bills)")
        new_columns = [column[1] for column in cursor.fetchall()]
        print("Updated bills table columns:", new_columns)
        
        # Show sample data
        cursor.execute("SELECT * FROM bills LIMIT 3")
        sample_data = cursor.fetchall()
        print(f"\nSample bills data (first 3 rows):")
        for row in sample_data:
            print(row)
            
    except Exception as e:
        print(f"Error during migration: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    print("Starting bills table migration...")
    migrate_bills_table()
    print("Migration script completed.")

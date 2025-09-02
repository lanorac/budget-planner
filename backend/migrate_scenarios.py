#!/usr/bin/env python3
"""
Database migration script to update scenarios for multi-scenario support.
Run this script to update your existing database schema.
"""

import sqlite3
import os

def migrate_scenarios():
    """Update scenarios table and add multi-scenario support"""
    
    # Connect to the database
    db_path = "budget_planner.db"
    if not os.path.exists(db_path):
        print(f"Database file {db_path} not found!")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if the new columns already exist
        cursor.execute("PRAGMA table_info(scenario_settings)")
        columns = [column[1] for column in cursor.fetchall()]
        
        print("Current scenario_settings table columns:", columns)
        
        # Add display_name column if it doesn't exist
        if 'display_name' not in columns:
            print("Adding display_name column...")
            cursor.execute("ALTER TABLE scenario_settings ADD COLUMN display_name TEXT DEFAULT ''")
        
        # Update existing scenarios with default names
        print("Updating existing scenarios with default names...")
        cursor.execute("""
            UPDATE scenario_settings 
            SET display_name = CASE 
                WHEN scenario = 'ALL' THEN 'Current Situation'
                WHEN scenario = 'A' THEN 'Scenario 1'
                WHEN scenario = 'B' THEN 'Scenario 2'
                WHEN scenario = 'C' THEN 'Scenario 3'
                ELSE 'Scenario ' || scenario
            END
            WHERE display_name = '' OR display_name IS NULL
        """)
        
        # Create scenario_items junction table for multi-scenario support
        print("Creating scenario_items junction table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS scenario_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                item_id TEXT NOT NULL,
                item_type TEXT NOT NULL,
                scenario_id TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(item_id, item_type, scenario_id)
            )
        """)
        
        # Create index for performance
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_scenario_items_lookup 
            ON scenario_items(item_id, item_type, scenario_id)
        """)
        
        # Migrate existing single-scenario data to junction table
        print("Migrating existing single-scenario data...")
        
        # Migrate assets
        cursor.execute("""
            INSERT OR IGNORE INTO scenario_items (item_id, item_type, scenario_id)
            SELECT id, 'asset', scenario FROM assets 
            WHERE scenario IS NOT NULL AND scenario != ''
        """)
        
        # Migrate liabilities
        cursor.execute("""
            INSERT OR IGNORE INTO scenario_items (item_id, item_type, scenario_id)
            SELECT id, 'liability', scenario FROM liabilities 
            WHERE scenario IS NOT NULL AND scenario != ''
        """)
        
        # Migrate income
        cursor.execute("""
            INSERT OR IGNORE INTO scenario_items (item_id, item_type, scenario_id)
            SELECT id, 'income', scenario FROM income 
            WHERE scenario IS NOT NULL AND scenario != ''
        """)
        
        # Migrate expenses
        cursor.execute("""
            INSERT OR IGNORE INTO scenario_items (item_id, item_type, scenario_id)
            SELECT id, 'expense', scenario FROM expenses 
            WHERE scenario IS NOT NULL AND scenario != ''
        """)
        
        # Migrate bills
        cursor.execute("""
            INSERT OR IGNORE INTO scenario_items (item_id, item_type, scenario_id)
            SELECT id, 'bill', scenario FROM bills 
            WHERE scenario IS NOT NULL AND scenario != ''
        """)
        
        # Commit changes
        conn.commit()
        print("Migration completed successfully!")
        
        # Verify the new structure
        cursor.execute("PRAGMA table_info(scenario_settings)")
        new_columns = [column[1] for column in cursor.fetchall()]
        print("Updated scenario_settings table columns:", new_columns)
        
        # Show sample data
        cursor.execute("SELECT * FROM scenario_settings")
        scenarios = cursor.fetchall()
        print(f"\nScenarios:")
        for scenario in scenarios:
            print(f"  {scenario}")
            
        # Show sample junction table data
        cursor.execute("SELECT * FROM scenario_items LIMIT 5")
        items = cursor.fetchall()
        print(f"\nSample scenario_items (first 5 rows):")
        for item in items:
            print(f"  {item}")
            
    except Exception as e:
        print(f"Error during migration: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    print("Starting scenarios migration...")
    migrate_scenarios()
    print("Migration script completed.")

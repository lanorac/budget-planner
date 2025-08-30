from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Dict, Any
import uuid

class EffectiveStatusService:
    """Service for calculating effective status of items based on linked assets/liabilities"""
    
    @staticmethod
    def get_effective_liabilities(db: Session, planner_id: uuid.UUID, scenario: str = "ALL") -> List[Dict[str, Any]]:
        """
        Get liabilities with effective status calculated based on linked assets
        Uses the v_liabilities_effective view logic
        """
        query = text("""
            SELECT 
                l.id,
                l.name,
                l.include_toggle,
                l.scenario,
                l.monthly_payment,
                l.remaining_balance,
                l.interest_rate,
                l.notes,
                l.planner_id,
                l.created_at,
                l.updated_at,
                CASE 
                    WHEN l.include_toggle = 'off' THEN 'off'
                    WHEN l.linked_asset_id IS NULL THEN l.include_toggle
                    WHEN a.include_toggle = 'off' THEN 'off'
                    ELSE l.include_toggle
                END as effective_status
            FROM liabilities l
            LEFT JOIN assets a ON l.linked_asset_id = a.id
            WHERE l.planner_id = :planner_id
            AND (l.scenario = :scenario OR :scenario = 'ALL')
        """)
        
        result = db.execute(query, {"planner_id": str(planner_id), "scenario": scenario})
        return [dict(row._mapping) for row in result]
    
    @staticmethod
    def get_effective_expenses(db: Session, planner_id: uuid.UUID, scenario: str = "ALL") -> List[Dict[str, Any]]:
        """
        Get expenses with effective status calculated based on linked assets/liabilities
        Uses the v_expenses_effective view logic
        """
        query = text("""
            SELECT 
                e.id,
                e.name,
                e.include_toggle,
                e.scenario,
                e.monthly_amount,
                e.category_id,
                e.linked_asset_id,
                e.linked_liab_id,
                e.notes,
                e.planner_id,
                e.created_at,
                e.updated_at,
                CASE 
                    WHEN e.include_toggle = 'off' THEN 'off'
                    WHEN e.linked_asset_id IS NOT NULL AND a.include_toggle = 'off' THEN 'off'
                    WHEN e.linked_liab_id IS NOT NULL AND l.include_toggle = 'off' THEN 'off'
                    ELSE e.include_toggle
                END as effective_status
            FROM expenses e
            LEFT JOIN assets a ON e.linked_asset_id = a.id
            LEFT JOIN liabilities l ON e.linked_liability_id = l.id
            WHERE e.planner_id = :planner_id
            AND (e.scenario = :scenario OR :scenario = 'ALL')
        """)
        
        result = db.execute(query, {"planner_id": str(planner_id), "scenario": scenario})
        return [dict(row._mapping) for row in result]
    
    @staticmethod
    def get_effective_bills(db: Session, planner_id: uuid.UUID, scenario: str = "ALL") -> List[Dict[str, Any]]:
        """
        Get bills with effective status calculated based on linked assets/liabilities
        Uses the v_bills_effective view logic
        """
        query = text("""
            SELECT 
                b.id,
                b.name,
                b.include_toggle,
                b.scenario,
                b.monthly_amount,
                b.category_id,
                b.linked_asset_id,
                b.linked_liab_id,
                b.notes,
                b.planner_id,
                b.created_at,
                b.updated_at,
                CASE 
                    WHEN b.include_toggle = 'off' THEN 'off'
                    WHEN b.linked_asset_id IS NOT NULL AND a.include_toggle = 'off' THEN 'off'
                    WHEN b.linked_liab_id IS NOT NULL AND l.include_toggle = 'off' THEN 'off'
                    ELSE b.include_toggle
                END as effective_status
            FROM bills b
            LEFT JOIN assets a ON b.linked_asset_id = a.id
            LEFT JOIN liabilities l ON b.linked_liability_id = l.id
            WHERE b.planner_id = :planner_id
            AND (b.scenario = :scenario OR :scenario = 'ALL')
        """)
        
        result = db.execute(query, {"planner_id": str(planner_id), "scenario": scenario})
        return [dict(row._mapping) for row in result]
    
    @staticmethod
    def calculate_monthly_totals(db: Session, planner_id: uuid.UUID, scenario: str = "ALL") -> Dict[str, float]:
        """
        Calculate monthly totals for income, expenses, bills, and liabilities
        using effective status calculations
        """
        # Get effective income
        income_query = text("""
            SELECT COALESCE(SUM(monthly_amount), 0) as total_income
            FROM income 
            WHERE planner_id = :planner_id 
            AND include_toggle = 'on'
            AND (scenario = :scenario OR :scenario = 'ALL')
        """)
        
        # Get effective expenses
        expenses_query = text("""
            SELECT COALESCE(SUM(e.monthly_amount), 0) as total_expenses
            FROM expenses e
            LEFT JOIN assets a ON e.linked_asset_id = a.id
            LEFT JOIN liabilities l ON e.linked_liab_id = l.id
            WHERE e.planner_id = :planner_id
            AND (e.scenario = :scenario OR :scenario = 'ALL')
            AND CASE 
                WHEN e.include_toggle = 'off' THEN 'off'
                WHEN e.linked_asset_id IS NOT NULL AND a.include_toggle = 'off' THEN 'off'
                WHEN e.linked_liab_id IS NOT NULL AND l.include_toggle = 'off' THEN 'off'
                ELSE e.include_toggle
            END = 'on'
        """)
        
        # Get effective bills
        bills_query = text("""
            SELECT COALESCE(SUM(b.monthly_amount), 0) as total_bills
            FROM bills b
            LEFT JOIN assets a ON b.linked_asset_id = a.id
            LEFT JOIN liabilities l ON b.linked_liab_id = l.id
            WHERE b.planner_id = :planner_id
            AND (b.scenario = :scenario OR :scenario = 'ALL')
            AND CASE 
                WHEN b.include_toggle = 'off' THEN 'off'
                WHEN b.linked_asset_id IS NOT NULL AND a.include_toggle = 'off' THEN 'off'
                WHEN b.linked_liab_id IS NOT NULL AND l.include_toggle = 'off' THEN 'off'
                ELSE b.include_toggle
            END = 'on'
        """)
        
        # Get effective liabilities
        liabilities_query = text("""
            SELECT COALESCE(SUM(l.monthly_cost), 0) as total_liabilities
            FROM liabilities l
            LEFT JOIN assets a ON l.linked_asset_id = a.id
            WHERE l.planner_id = :planner_id
            AND (l.scenario = :scenario OR :scenario = 'ALL')
            AND CASE 
                WHEN l.include_toggle = 'off' THEN 'off'
                WHEN l.linked_asset_id IS NULL THEN l.include_toggle
                WHEN a.include_toggle = 'off' THEN 'off'
                ELSE l.include_toggle
            END = 'on'
        """)
        
        # Get asset sales for the scenario
        asset_sales_query = text("""
            SELECT COALESCE(SUM(sale_value), 0) as total_asset_sales
            FROM assets 
            WHERE planner_id = :planner_id 
            AND include_toggle = 'on'
            AND (scenario = :scenario OR :scenario = 'ALL')
        """)
        
        params = {"planner_id": str(planner_id), "scenario": scenario}
        
        income_result = db.execute(income_query, params).fetchone()
        expenses_result = db.execute(expenses_query, params).fetchone()
        bills_result = db.execute(bills_query, params).fetchone()
        liabilities_result = db.execute(liabilities_query, params).fetchone()
        asset_sales_result = db.execute(asset_sales_query, params).fetchone()
        
        total_income = float(income_result.total_income) if income_result.total_income else 0.0
        total_expenses = float(expenses_result.total_expenses) if expenses_result.total_expenses else 0.0
        total_bills = float(bills_result.total_bills) if bills_result.total_bills else 0.0
        total_liabilities = float(liabilities_result.total_liabilities) if liabilities_result.total_liabilities else 0.0
        total_asset_sales = float(asset_sales_result.total_asset_sales) if asset_sales_result.total_asset_sales else 0.0
        
        total_monthly_outgoings = total_expenses + total_bills + total_liabilities
        net_cash_flow = total_income - total_monthly_outgoings
        
        return {
            "monthly_income": total_income,
            "monthly_expenses": total_expenses,
            "monthly_bills": total_bills,
            "monthly_liabilities": total_liabilities,
            "total_monthly_outgoings": total_monthly_outgoings,
            "net_cash_flow": net_cash_flow,
            "asset_sales": total_asset_sales
        }

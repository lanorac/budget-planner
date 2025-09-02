from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from ..database.connection import get_db
from ..models.planner import ScenarioSettings, ScenarioItem
from ..schemas.scenario import ScenarioCreate, ScenarioUpdate, ScenarioResponse, ScenarioItemCreate, ScenarioItemResponse

router = APIRouter()

@router.get("/scenarios", response_model=List[ScenarioResponse])
async def get_scenarios(
    planner_id: uuid.UUID, 
    db: Session = Depends(get_db)
):
    """Get all scenarios for a planner"""
    scenarios = db.query(ScenarioSettings).filter(
        ScenarioSettings.planner_id == planner_id
    ).all()
    return scenarios

@router.get("/scenarios/{scenario_id}", response_model=ScenarioResponse)
async def get_scenario(scenario_id: uuid.UUID, db: Session = Depends(get_db)):
    """Get a specific scenario by ID"""
    scenario = db.query(ScenarioSettings).filter(ScenarioSettings.id == scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return scenario

@router.post("/scenarios", response_model=ScenarioResponse)
async def create_scenario(scenario: ScenarioCreate, db: Session = Depends(get_db)):
    """Create a new scenario"""
    # Check if scenario identifier already exists for this planner
    existing = db.query(ScenarioSettings).filter(
        ScenarioSettings.planner_id == scenario.planner_id,
        ScenarioSettings.scenario == scenario.scenario
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Scenario identifier already exists for this planner")
    
    db_scenario = ScenarioSettings(**scenario.model_dump())
    db.add(db_scenario)
    db.commit()
    db.refresh(db_scenario)
    return db_scenario

@router.put("/scenarios/{scenario_id}", response_model=ScenarioResponse)
async def update_scenario(
    scenario_id: uuid.UUID, 
    scenario: ScenarioUpdate, 
    db: Session = Depends(get_db)
):
    """Update an existing scenario"""
    db_scenario = db.query(ScenarioSettings).filter(ScenarioSettings.id == scenario_id).first()
    if not db_scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    
    update_data = scenario.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(db_scenario, field, value)
    
    db.commit()
    db.refresh(db_scenario)
    return db_scenario

@router.delete("/scenarios/{scenario_id}")
async def delete_scenario(scenario_id: uuid.UUID, db: Session = Depends(get_db)):
    """Delete a scenario and all its items"""
    db_scenario = db.query(ScenarioSettings).filter(ScenarioSettings.id == scenario_id).first()
    if not db_scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    
    # Delete all scenario items first
    db.query(ScenarioItem).filter(ScenarioItem.scenario_id == db_scenario.id).delete()
    
    # Delete the scenario
    db.delete(db_scenario)
    db.commit()
    return {"message": "Scenario deleted successfully"}

@router.post("/scenarios/{scenario_id}/items", response_model=ScenarioItemResponse)
async def add_item_to_scenario(
    scenario_id: uuid.UUID,
    item: ScenarioItemCreate,
    db: Session = Depends(get_db)
):
    """Add an item to a scenario"""
    # Verify the scenario exists
    scenario = db.query(ScenarioSettings).filter(ScenarioSettings.id == scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    
    # Check if item is already in this scenario
    existing = db.query(ScenarioItem).filter(
        ScenarioItem.item_id == item.item_id,
        ScenarioItem.item_type == item.item_type,
        ScenarioItem.scenario_id == scenario.id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Item is already in this scenario")
    
    # Create the scenario item
    db_item = ScenarioItem(
        item_id=item.item_id,
        item_type=item.item_type,
        scenario_id=scenario.id
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/scenarios/{scenario_id}/items/{item_id}")
async def remove_item_from_scenario(
    scenario_id: uuid.UUID,
    item_id: uuid.UUID,
    item_type: str,
    db: Session = Depends(get_db)
):
    """Remove an item from a scenario"""
    # Verify the scenario exists
    scenario = db.query(ScenarioSettings).filter(ScenarioSettings.id == scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    
    # Find and delete the scenario item
    db_item = db.query(ScenarioItem).filter(
        ScenarioItem.item_id == item_id,
        ScenarioItem.item_type == item_type,
        ScenarioItem.scenario_id == scenario.id
    ).first()
    
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found in this scenario")
    
    db.delete(db_item)
    db.commit()
    return {"message": "Item removed from scenario successfully"}

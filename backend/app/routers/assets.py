from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from ..database.connection import get_db
from ..models import Asset
from ..schemas.asset import AssetCreate, AssetUpdate, AssetResponse

router = APIRouter()

@router.get("/assets", response_model=List[AssetResponse])
async def get_assets(
    planner_id: uuid.UUID,
    scenario: str = "ALL",
    db: Session = Depends(get_db)
):
    """Get all assets for a planner, filtered by scenario"""
    assets = db.query(Asset).filter(
        Asset.planner_id == planner_id,
        (Asset.scenario == "ALL") | (Asset.scenario == scenario)
    ).all()
    return assets

@router.post("/assets", response_model=AssetResponse)
async def create_asset(
    asset: AssetCreate,
    db: Session = Depends(get_db)
):
    """Create a new asset"""
    db_asset = Asset(**asset.dict())
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    return db_asset

@router.get("/assets/{asset_id}", response_model=AssetResponse)
async def get_asset(
    asset_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """Get a specific asset by ID"""
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset

@router.put("/assets/{asset_id}", response_model=AssetResponse)
async def update_asset(
    asset_id: uuid.UUID,
    asset: AssetUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing asset"""
    db_asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not db_asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    for field, value in asset.dict(exclude_unset=True).items():
        setattr(db_asset, field, value)
    
    db.commit()
    db.refresh(db_asset)
    return db_asset

@router.delete("/assets/{asset_id}")
async def delete_asset(
    asset_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """Delete an asset"""
    db_asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not db_asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    db.delete(db_asset)
    db.commit()
    return {"message": "Asset deleted successfully"}

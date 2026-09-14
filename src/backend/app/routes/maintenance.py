from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from src.backend.app.database import get_db
from src.backend.app.schemas.maintenance_schema import MaintenanceItemSchema
from src.backend.app.services.maintenance_service import get_prioritized_maintenance

router = APIRouter()

@router.get("/maintenance/priorities", response_model=List[MaintenanceItemSchema])
def get_maintenance_queue(
    priority: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return get_prioritized_maintenance(db, priority)

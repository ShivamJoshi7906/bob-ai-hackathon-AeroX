from pydantic import BaseModel
from typing import List, Optional

class ReadinessResponse(BaseModel):
    asset_id: str
    readiness_score: float
    readiness_category: str
    mission_id: Optional[str] = None
    mission_window_start: Optional[str] = None
    mission_window_end: Optional[str] = None
    required_readiness_threshold: float = 0.85
    mission_cycles_required: int = 30
    predicted_rul: float
    buffer_cycles: float
    mission_buffer_cycles: Optional[float] = None
    risk_level: str
    evidence_reasons: List[str]
    recommended_action: str

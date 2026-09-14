from pydantic import BaseModel
from typing import List

class PredictionResponse(BaseModel):
    asset_id: str
    current_cycle: int
    predicted_rul: float
    confidence_interval: List[float]
    failure_within_30_prob: float
    degradation_stage: str
    dominant_sensors: List[str]

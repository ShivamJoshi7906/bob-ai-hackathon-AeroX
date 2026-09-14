from pydantic import BaseModel
from typing import Optional

class KnowledgeBaseMatchSchema(BaseModel):
    relevant_component: str
    action_type: str
    action_taken: str
    synthetic_linkage_note: str = "Derived from public aircraft maintenance knowledge base"

class MaintenanceItemSchema(BaseModel):
    priority: str                       # P1, P2, P3
    priority_label: str                 # CRITICAL, URGENT, SCHEDULED
    asset_id: str
    risk_level: str
    predicted_rul: float
    readiness_category: str
    issue: str
    mission_impact: str
    recommended_action: str
    knowledge_base_match: Optional[KnowledgeBaseMatchSchema] = None

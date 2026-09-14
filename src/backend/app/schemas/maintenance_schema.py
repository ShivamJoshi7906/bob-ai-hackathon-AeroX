from pydantic import BaseModel
from typing import Optional

class KnowledgeBaseMatchSchema(BaseModel):
    relevant_component: str
    action_type: str
    action_taken: str
    synthetic_linkage_note: str = "Derived from public aircraft maintenance knowledge base"

class MaintenanceItemSchema(BaseModel):
    id: str                             # MNT-003
    asset_id: str
    priority: str                       # P1, P2, P3
    priority_label: str                 # CRITICAL, URGENT, SCHEDULED
    risk_level: str
    predicted_rul: float
    readiness_category: str
    issue: str
    identified_issue: str               # Frontend compatibility
    affected_subsystem: str             # High Pressure Compressor (HPC), etc.
    mission_impact: str
    recommended_action: str
    knowledge_base_procedure: str       # Specific Zenodo / Technical Order task
    synthetic_asset_linkage: bool = True
    provenance_note: str = "Derived from public aviation maintenance knowledge base"
    created_at: str = "2026-09-14T10:00:00Z"
    knowledge_base_match: Optional[KnowledgeBaseMatchSchema] = None


export interface MaintenanceItem {
  id: string;
  asset_id: string;
  priority: 'P1 - CRITICAL' | 'P2 - URGENT' | 'P3 - SCHEDULED';
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  predicted_rul: number;
  identified_issue: string;
  affected_subsystem: string;
  mission_impact: string;
  recommended_action: string;
  knowledge_base_procedure: string;
  synthetic_asset_linkage: true;
  provenance_note: string;
  created_at: string;
}

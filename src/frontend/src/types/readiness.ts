export interface ReadinessEvidence {
  evidence_id: string;
  category: 'TELEMETRY' | 'RUL_MARGIN' | 'COMPONENT_WEAR' | 'MAINTENANCE_LOG';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  description: string;
  impact_score: number;
}

export interface AssetReadiness {
  asset_id: string;
  readiness_score: number;
  readiness_category: 'READY' | 'READY WITH MONITORING' | 'NEEDS INSPECTION' | 'NOT READY';
  predicted_rul: number;
  mission_buffer_cycles: number;
  recommended_action: string;
  evidence_bullets: ReadinessEvidence[];
  evaluated_at: string;
}

export interface FleetSummary {
  total_assets: number;
  ready_count: number;
  monitoring_count: number;
  inspection_count: number;
  not_ready_count: number;
  critical_risk_count: number;
  high_risk_count: number;
  upcoming_missions_30d: number;
  urgent_maintenance_p1: number;
}

export interface AssetRow {
  asset_id: string;
  asset_type: string;
  total_operating_hours: number;
  mission_criticality: string;
  predicted_rul: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  readiness_score: number;
  readiness_category: 'READY' | 'READY WITH MONITORING' | 'NEEDS INSPECTION' | 'NOT READY';
  next_mission_date?: string;
  next_mission_priority?: string;
}

export interface AssetDetail extends AssetRow {
  service_age_months: number;
  last_maintenance_cycle: number;
  current_cycle: number;
  baseline_life_cycles: number;
  engine_model: string;
  assigned_squadron: string;
}

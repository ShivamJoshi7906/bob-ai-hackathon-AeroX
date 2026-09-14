export interface MissionWindow {
  mission_id: string;
  mission_name: string;
  asset_id: string;
  asset_type: string;
  start_date: string;
  end_date: string;
  mission_priority: 'CRITICAL' | 'HIGH' | 'ROUTINE';
  required_cycles: number;
  current_rul: number;
  buffer_margin: number;
  status: 'SAFE' | 'AT RISK' | 'MISSION THREAT';
  data_origin: 'synthetic';
}

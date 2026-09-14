import { FleetSummary, AssetRow, AssetDetail } from '../types/asset';
import { SensorReading } from '../types/sensor';
import { AssetReadiness } from '../types/readiness';
import { MaintenanceItem } from '../types/maintenance';
import { MissionWindow } from '../types/mission';
import { BobQueryResponse } from '../types/bob';

// Base API URL
const API_BASE = '/api';

// Helper for fetch with fallback to mock data
async function fetchWithFallback<T>(url: string, fallbackData: T): Promise<T> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`[API Client] API call ${url} failed with status ${response.status}. Using mock fallback.`);
      return fallbackData;
    }
    return await response.json();
  } catch (error) {
    console.warn(`[API Client] API call ${url} threw error. Using mock fallback.`, error);
    return fallbackData;
  }
}

// Helper for POST with fallback
async function postWithFallback<T>(url: string, body: unknown, fallbackData: T): Promise<T> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      console.warn(`[API Client] POST ${url} failed. Using mock fallback.`);
      return fallbackData;
    }
    return await response.json();
  } catch (error) {
    console.warn(`[API Client] POST ${url} threw error. Using mock fallback.`, error);
    return fallbackData;
  }
}

// --- MOCK DATA SEEDS FOR AEROSPACE FLEET ---
const MOCK_FLEET_SUMMARY: FleetSummary = {
  total_assets: 38,
  ready_count: 26,
  monitoring_count: 6,
  inspection_count: 3,
  not_ready_count: 3,
  critical_risk_count: 3,
  high_risk_count: 3,
  upcoming_missions_30d: 14,
  urgent_maintenance_p1: 6,
};

const MOCK_ASSETS: AssetRow[] = Array.from({ length: 38 }, (_, i) => {
  const num = (i + 1).toString().padStart(3, '0');
  const id = `AC-${num}`;
  
  // Specific known test cases
  if (id === 'AC-003') {
    return {
      asset_id: 'AC-003',
      asset_type: 'F-35A Lightning II',
      total_operating_hours: 1420,
      mission_criticality: 'CAT 1 - COMBAT READINESS',
      predicted_rul: 18.4,
      risk_level: 'CRITICAL',
      readiness_score: 22.6,
      readiness_category: 'NOT READY',
      next_mission_date: '2026-10-31',
      next_mission_priority: 'CRITICAL',
    };
  }
  if (id === 'AC-014') {
    return {
      asset_id: 'AC-014',
      asset_type: 'F-15EX Eagle II',
      total_operating_hours: 2150,
      mission_criticality: 'CAT 1 - COMBAT READINESS',
      predicted_rul: 19.2,
      risk_level: 'CRITICAL',
      readiness_score: 20.8,
      readiness_category: 'NOT READY',
      next_mission_date: '2026-11-02',
      next_mission_priority: 'CRITICAL',
    };
  }
  if (id === 'AC-028') {
    return {
      asset_id: 'AC-028',
      asset_type: 'F/A-18E Super Hornet',
      total_operating_hours: 3100,
      mission_criticality: 'CAT 2 - TACTICAL SUPPORT',
      predicted_rul: 22.5,
      risk_level: 'CRITICAL',
      readiness_score: 36.2,
      readiness_category: 'NOT READY',
      next_mission_date: '2026-11-05',
      next_mission_priority: 'HIGH',
    };
  }
  if ([7, 21, 35].includes(i + 1)) {
    return {
      asset_id: id,
      asset_type: 'F-35A Lightning II',
      total_operating_hours: 980 + i * 40,
      mission_criticality: 'CAT 1 - COMBAT READINESS',
      predicted_rul: 38.0,
      risk_level: 'HIGH',
      readiness_score: 58.0,
      readiness_category: 'NEEDS INSPECTION',
      next_mission_date: '2026-11-12',
      next_mission_priority: 'HIGH',
    };
  }
  if ([5, 10, 15, 20, 25, 30].includes(i + 1)) {
    return {
      asset_id: id,
      asset_type: 'F-22A Raptor',
      total_operating_hours: 1200 + i * 30,
      mission_criticality: 'CAT 2 - TACTICAL SUPPORT',
      predicted_rul: 48.0,
      risk_level: 'MEDIUM',
      readiness_score: 78.0,
      readiness_category: 'READY WITH MONITORING',
      next_mission_date: '2026-11-20',
      next_mission_priority: 'ROUTINE',
    };
  }
  return {
    asset_id: id,
    asset_type: (i % 2 === 0) ? 'F-35A Lightning II' : 'F-16C Viper',
    total_operating_hours: 600 + i * 25,
    mission_criticality: 'CAT 3 - PATROL & ESCORT',
    predicted_rul: (i + 1) % 4 === 0 ? 75.0 : 110.0 + ((i + 1) % 25),
    risk_level: 'LOW',
    readiness_score: 95.0,
    readiness_category: 'READY',
    next_mission_date: '2026-11-25',
    next_mission_priority: 'ROUTINE',
  };
});

// Telemetry mock generator for asset degradation
function generateTelemetry(assetId: string, cyclesCount = 50): SensorReading[] {
  const isCritical = ['AC-003', 'AC-014', 'AC-028'].includes(assetId);
  const baseTemp = 640;
  const tempTrend = isCritical ? 1.8 : 0.2;

  return Array.from({ length: cyclesCount }, (_, index) => {
    const cycle = 150 + index;
    const factor = index / cyclesCount;
    return {
      cycle,
      s2: Number((518.67 + Math.random() * 0.5).toFixed(2)),
      s3: Number((baseTemp + factor * tempTrend * 80 + Math.random() * 4).toFixed(2)),
      s4: Number((1400 + factor * tempTrend * 65 + Math.random() * 5).toFixed(2)),
      s7: Number((553.4 - factor * tempTrend * 25 + Math.random() * 2).toFixed(2)),
      s8: Number((2388.0 + Math.random() * 1.2).toFixed(2)),
      s9: Number((9050.0 + Math.random() * 2.5).toFixed(2)),
      s11: Number((47.2 + factor * 2.1 + Math.random() * 0.4).toFixed(2)),
      s12: Number((521.6 - factor * 8.5 + Math.random() * 0.5).toFixed(2)),
      s14: Number((8.42 + factor * 0.35 + Math.random() * 0.05).toFixed(2)),
      s15: Number((0.03 + Math.random() * 0.005).toFixed(4)),
      s17: Number((392 + Math.random() * 2).toFixed(0)),
      s20: Number((38.8 - factor * 4.2 + Math.random() * 0.3).toFixed(2)),
      s21: Number((23.3 - factor * 2.8 + Math.random() * 0.2).toFixed(2)),
    };
  });
}

// API CLIENT FUNCTIONS

export const api = {
  // 1. Fleet summary
  getFleetSummary: (): Promise<FleetSummary> =>
    fetchWithFallback(`${API_BASE}/fleet/summary`, MOCK_FLEET_SUMMARY),

  // 2. All assets with optional filters
  getAssets: (params?: { status?: string; risk?: string; search?: string }): Promise<AssetRow[]> => {
    let filtered = [...MOCK_ASSETS];
    if (params?.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(a => a.asset_id.toLowerCase().includes(s) || a.asset_type.toLowerCase().includes(s));
    }
    if (params?.status && params.status !== 'ALL') {
      filtered = filtered.filter(a => a.readiness_category.toUpperCase() === params.status?.toUpperCase());
    }
    if (params?.risk && params.risk !== 'ALL') {
      filtered = filtered.filter(a => a.risk_level.toUpperCase() === params.risk?.toUpperCase());
    }
    return fetchWithFallback(
      `${API_BASE}/assets?status=${params?.status || ''}&risk=${params?.risk || ''}&search=${params?.search || ''}`,
      filtered
    );
  },

  // 3. Single Asset Details
  getAssetDetails: async (assetId: string): Promise<AssetDetail> => {
    const found = MOCK_ASSETS.find(a => a.asset_id === assetId) || MOCK_ASSETS[2];
    const defaultDetail: AssetDetail = {
      ...found,
      service_age_months: 34,
      last_maintenance_cycle: 145,
      current_cycle: 195,
      baseline_life_cycles: 250,
      engine_model: 'Pratt & Whitney F135-PW-100',
      assigned_squadron: '4th Fighter Squadron (Vipers)',
    };
    try {
      const response = await fetch(`${API_BASE}/assets/${assetId}`);
      if (!response.ok) return defaultDetail;
      const data = await response.json();
      return {
        ...defaultDetail,
        ...data,
        predicted_rul: data.predicted_rul ?? defaultDetail.predicted_rul,
        risk_level: data.risk_level ?? defaultDetail.risk_level,
        readiness_score: data.readiness_score ?? defaultDetail.readiness_score,
        readiness_category: data.readiness_category ?? defaultDetail.readiness_category,
        baseline_life_cycles: data.baseline_life_cycles ?? 250,
        current_cycle: data.latest_cycle ?? data.current_cycle ?? 195,
      };
    } catch {
      return defaultDetail;
    }
  },

  // 4. Sensor telemetry history (UNPACKS READINGS ARRAY CLEANLY)
  getSensorData: async (assetId: string, cycles = 50): Promise<SensorReading[]> => {
    const mockTelemetry = generateTelemetry(assetId, cycles);
    try {
      const response = await fetch(`${API_BASE}/assets/${assetId}/sensors?recent_cycles=${cycles}`);
      if (!response.ok) return mockTelemetry;
      const data = await response.json();
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.readings)) return data.readings;
      return mockTelemetry;
    } catch {
      return mockTelemetry;
    }
  },

  // 5. Readiness & Evidence Explanation
  getAssetReadiness: async (assetId: string): Promise<AssetReadiness> => {
    const asset = MOCK_ASSETS.find(a => a.asset_id === assetId) || MOCK_ASSETS[2];
    const isCritical = asset.risk_level === 'CRITICAL';
    const req = assetId === 'AC-014' ? 32 : (assetId === 'AC-028' ? 25 : 30);
    const buf = Number((asset.predicted_rul - req).toFixed(1));

    const defaultReadiness: AssetReadiness = {
      asset_id: assetId,
      readiness_score: asset.readiness_score,
      readiness_category: asset.readiness_category,
      predicted_rul: asset.predicted_rul,
      mission_buffer_cycles: buf,
      recommended_action: isCritical
        ? 'GROUND ASSET IMMEDIATELY. Initiate HPC stage 4 blade teardown & thermal barrier coating inspection.'
        : 'Asset cleared for full operational flight envelope.',
      evaluated_at: new Date().toISOString(),
      evidence_bullets: [
        {
          evidence_id: 'EV-8901',
          category: 'TELEMETRY',
          severity: isCritical ? 'CRITICAL' : 'INFO',
          description: isCritical
            ? 'Combustor Outlet Temp (s3) and LPC Outlet Temp (s2) elevated indicating thermal distress.'
            : 'All sensor telemetry operating within normal baseline bands.',
          impact_score: isCritical ? -42 : 0,
        },
        {
          evidence_id: 'EV-8902',
          category: 'RUL_MARGIN',
          severity: isCritical ? 'CRITICAL' : 'INFO',
          description: `Predicted RUL of ${asset.predicted_rul} cycles vs mission requirement of ${req} cycles (${buf > 0 ? '+' : ''}${buf} buffer).`,
          impact_score: isCritical ? -35 : 10,
        },
      ],
    };

    try {
      const response = await fetch(`${API_BASE}/assets/${assetId}/readiness`);
      if (!response.ok) return defaultReadiness;
      const data = await response.json();
      const realBuf = data.buffer_cycles ?? data.mission_buffer_cycles ?? buf;
      return {
        ...defaultReadiness,
        ...data,
        predicted_rul: data.predicted_rul ?? asset.predicted_rul,
        mission_buffer_cycles: realBuf,
        readiness_score: data.readiness_score ?? defaultReadiness.readiness_score,
        readiness_category: data.readiness_category ?? defaultReadiness.readiness_category,
        recommended_action: data.recommended_action ?? defaultReadiness.recommended_action,
        evidence_bullets: Array.isArray(data.evidence_reasons)
          ? data.evidence_reasons.map((r: string, idx: number) => ({
              evidence_id: `EV-${idx + 1}`,
              category: 'TELEMETRY',
              severity: isCritical ? 'CRITICAL' : 'INFO',
              description: r,
              impact_score: -20,
            }))
          : defaultReadiness.evidence_bullets,
      };
    } catch {
      return defaultReadiness;
    }
  },

  // 6. Prioritized Maintenance Queue
  getMaintenancePriorities: async (priorityFilter?: string): Promise<MaintenanceItem[]> => {
    try {
      const response = await fetch(`${API_BASE}/maintenance/priorities?priority=${priorityFilter || ''}`);
      if (!response.ok) return [];
      const data = await response.json();
      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          id: item.id || `MNT-${item.asset_id}`,
          asset_id: item.asset_id,
          priority: item.priority.startsWith('P') && item.priority_label ? `${item.priority} - ${item.priority_label}` : item.priority,
          risk_level: item.risk_level,
          predicted_rul: item.predicted_rul,
          identified_issue: item.identified_issue || item.issue || 'Operational degradation anomaly detected.',
          affected_subsystem: item.affected_subsystem || item.knowledge_base_match?.relevant_component || 'High Pressure Compressor (HPC)',
          mission_impact: item.mission_impact || 'Degraded mission completion buffer.',
          recommended_action: item.recommended_action,
          knowledge_base_procedure: item.knowledge_base_procedure || item.knowledge_base_match?.action_taken || 'T.O. Standard Aircraft Maintenance Procedure',
          synthetic_asset_linkage: true,
          provenance_note: item.provenance_note || 'Derived from public aviation maintenance knowledge base',
          created_at: item.created_at || '2026-09-14T10:00:00Z',
        }));
      }
      return [];
    } catch {
      return [];
    }
  },

  // 7. Upcoming Mission Scenarios
  getUpcomingMissions: async (): Promise<MissionWindow[]> => {
    try {
      const response = await fetch(`${API_BASE}/missions/upcoming`);
      if (!response.ok) return [];
      const data = await response.json();
      if (Array.isArray(data)) {
        return data.map((m: any) => ({
          mission_id: m.mission_id,
          mission_name: m.mission_name,
          asset_id: m.asset_id,
          asset_type: m.asset_type || (m.asset_id === 'AC-003' ? 'F-35A Lightning II' : 'F-15EX Eagle II'),
          start_date: m.start_date,
          end_date: m.end_date,
          mission_priority: (m.mission_priority || 'CRITICAL').toUpperCase(),
          required_cycles: m.required_cycles,
          current_rul: m.current_rul ?? (m.asset_id === 'AC-003' ? 18.4 : 50.0),
          buffer_margin: m.buffer_margin ?? Number(((m.current_rul ?? 18.4) - m.required_cycles).toFixed(1)),
          status: m.status || ((m.current_rul ?? 18.4) < m.required_cycles ? 'MISSION THREAT' : 'SAFE'),
          data_origin: m.data_origin || 'synthetic',
        }));
      }
      return [];
    } catch {
      return [];
    }
  },

  // 8. Bob Copilot Interactive Query
  queryBob: (query: string, assetId?: string): Promise<BobQueryResponse> => {
    const qLower = query.toLowerCase();
    let fallbackResponse: BobQueryResponse;

    if (qLower.includes('ac-003') || assetId === 'AC-003') {
      fallbackResponse = {
        query,
        intent: 'WHY_ASSET_NOT_READY',
        answer: 'Asset AC-003 (F-35A Lightning II) is NOT READY due to severe high-pressure compressor degradation. Its predicted RUL is 18.4 cycles against an upcoming mission requirement of 30 cycles (negative safety buffer of -11.6 cycles). Combustor outlet temperatures (s3) and LPC outlet temp (s2) exhibit continuous thermal degradation.',
        evidence: {
          asset_id: 'AC-003',
          predicted_rul: 18.4,
          mission_cycles_required: 30,
          buffer_cycles: -11.6,
          risk_level: 'CRITICAL',
          readiness_category: 'NOT READY',
          recommended_action: 'Ground asset immediately. Initiate P1 Critical maintenance task MNT-003 (HPC Rotor Assembly Overhaul & Blade Clearance Spec).',
        },
        tools_called: ['get_asset_status', 'get_asset_prediction', 'get_asset_risk', 'get_asset_sensor_trends', 'get_upcoming_mission'],
        timestamp: new Date().toISOString(),
      };
    } else if (qLower.includes('not ready') || qLower.includes('which assets')) {
      fallbackResponse = {
        query,
        intent: 'GET_NOT_READY_ASSETS',
        answer: 'Currently 3 assets in the fleet are classified as NOT READY due to mission buffer deficits:\n1. AC-003 (F-35A) — RUL: 18.4 cycles | Buffer: -11.6 cycles | Critical HPC Degradation\n2. AC-014 (F-15EX) — RUL: 19.2 cycles | Buffer: -12.8 cycles | Combustor Temp Exceedance\n3. AC-028 (F/A-18E) — RUL: 22.5 cycles | Buffer: -2.5 cycles | Turbine Coolant Flow Drop\n\nAll 3 require immediate grounding before scheduled mission departure windows.',
        evidence: {
          total_non_ready: 3,
          not_ready_assets: ['AC-003', 'AC-014', 'AC-028'],
          top_critical_asset: 'AC-003',
          worst_buffer_cycles: -11.6,
        },
        tools_called: ['get_not_ready_assets'],
        timestamp: new Date().toISOString(),
      };
    } else if (qLower.includes('first') || qLower.includes('maintenance')) {
      fallbackResponse = {
        query,
        intent: 'MAINTENANCE_PRIORITIZATION',
        answer: 'Maintenance crews must immediately execute Task MNT-003 on AC-003 (P1 Critical). AC-003 is scheduled for Operation Northern Shield on Oct 31, 2026, but has a negative mission buffer of -11.6 cycles. Executing T.O. 1F-35A-2-72-1 (HPC Rotor Assembly Overhaul) will restore baseline RUL to >150 cycles.',
        evidence: {
          top_priority_asset: 'AC-003',
          top_priority_level: 'P1',
          p1_total_count: 3,
          p2_total_count: 3,
          total_recommendations: 12,
        },
        tools_called: ['get_maintenance_recommendations'],
        timestamp: new Date().toISOString(),
      };
    } else {
      fallbackResponse = {
        query,
        intent: 'FLEET_OVERVIEW_HELP',
        answer: `MissionGuard Bob Copilot analysis for: "${query}"\n\nFleet Status Overview: 38 Total Aircraft Assets | 26 READY | 6 MONITORING | 3 INSPECTION | 3 NOT READY.\n\nAll critical telemetry channels are monitored across 13 sensor streams. For detailed asset diagnostics, specify an Asset ID (e.g. AC-003).`,
        evidence: {
          total_assets: 38,
          ready_count: 26,
          monitoring_count: 6,
          inspection_count: 3,
          not_ready_count: 3,
        },
        tools_called: ['get_fleet_summary'],
        timestamp: new Date().toISOString(),
      };
    }

    return postWithFallback(`${API_BASE}/bob/query`, { query, asset_id: assetId }, fallbackResponse);
  },
};


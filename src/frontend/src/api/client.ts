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
  ready_count: 22,
  monitoring_count: 9,
  inspection_count: 4,
  not_ready_count: 3,
  critical_risk_count: 3,
  high_risk_count: 6,
  upcoming_missions_30d: 14,
  urgent_maintenance_p1: 3,
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
      predicted_rul: 12,
      risk_level: 'CRITICAL',
      readiness_score: 18,
      readiness_category: 'NOT READY',
      next_mission_date: '2026-09-20',
      next_mission_priority: 'CRITICAL',
    };
  }
  if (id === 'AC-014') {
    return {
      asset_id: 'AC-014',
      asset_type: 'F-15EX Eagle II',
      total_operating_hours: 2150,
      mission_criticality: 'CAT 1 - COMBAT READINESS',
      predicted_rul: 19,
      risk_level: 'CRITICAL',
      readiness_score: 24,
      readiness_category: 'NOT READY',
      next_mission_date: '2026-09-22',
      next_mission_priority: 'HIGH',
    };
  }
  if (id === 'AC-028') {
    return {
      asset_id: 'AC-028',
      asset_type: 'F/A-18E Super Hornet',
      total_operating_hours: 3100,
      mission_criticality: 'CAT 2 - TACTICAL SUPPORT',
      predicted_rul: 22,
      risk_level: 'CRITICAL',
      readiness_score: 31,
      readiness_category: 'NOT READY',
      next_mission_date: '2026-09-25',
      next_mission_priority: 'HIGH',
    };
  }
  if (i % 7 === 0) {
    return {
      asset_id: id,
      asset_type: 'F-35A Lightning II',
      total_operating_hours: 980 + i * 40,
      mission_criticality: 'CAT 1 - COMBAT READINESS',
      predicted_rul: 38 + (i % 15),
      risk_level: 'HIGH',
      readiness_score: 55,
      readiness_category: 'NEEDS INSPECTION',
      next_mission_date: '2026-09-28',
      next_mission_priority: 'HIGH',
    };
  }
  if (i % 4 === 0) {
    return {
      asset_id: id,
      asset_type: 'F-22A Raptor',
      total_operating_hours: 1200 + i * 30,
      mission_criticality: 'CAT 1 - COMBAT READINESS',
      predicted_rul: 65 + (i % 20),
      risk_level: 'MEDIUM',
      readiness_score: 74,
      readiness_category: 'READY WITH MONITORING',
      next_mission_date: '2026-10-02',
      next_mission_priority: 'ROUTINE',
    };
  }
  return {
    asset_id: id,
    asset_type: (i % 2 === 0) ? 'F-35A Lightning II' : 'F-16C Viper',
    total_operating_hours: 600 + i * 25,
    mission_criticality: 'CAT 3 - PATROL & ESCORT',
    predicted_rul: 110 + (i % 50),
    risk_level: 'LOW',
    readiness_score: 92,
    readiness_category: 'READY',
    next_mission_date: '2026-10-10',
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
      s3: Number((baseTemp + factor * tempTrend * 80 + Math.random() * 4).toFixed(2)), // Combustor temp degradation
      s4: Number((1400 + factor * tempTrend * 65 + Math.random() * 5).toFixed(2)),     // LPT temp degradation
      s7: Number((553.4 - factor * tempTrend * 25 + Math.random() * 2).toFixed(2)),     // Pressure decay
      s8: Number((2388.0 + Math.random() * 1.2).toFixed(2)),
      s9: Number((9050.0 + Math.random() * 2.5).toFixed(2)),
      s11: Number((47.2 + factor * 2.1 + Math.random() * 0.4).toFixed(2)),
      s12: Number((521.6 - factor * 8.5 + Math.random() * 0.5).toFixed(2)),
      s14: Number((8.42 + factor * 0.35 + Math.random() * 0.05).toFixed(2)),
      s15: Number((0.03 + Math.random() * 0.005).toFixed(4)),
      s17: Number((392 + Math.random() * 2).toFixed(0)),
      s20: Number((38.8 - factor * 4.2 + Math.random() * 0.3).toFixed(2)),              // Coolant flow drop
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
    if (params?.status) {
      filtered = filtered.filter(a => a.readiness_category === params.status);
    }
    if (params?.risk) {
      filtered = filtered.filter(a => a.risk_level === params.risk);
    }
    return fetchWithFallback(
      `${API_BASE}/assets?status=${params?.status || ''}&risk=${params?.risk || ''}&search=${params?.search || ''}`,
      filtered
    );
  },

  // 3. Single Asset Details
  getAssetDetails: (assetId: string): Promise<AssetDetail> => {
    const found = MOCK_ASSETS.find(a => a.asset_id === assetId) || MOCK_ASSETS[2]; // Default to AC-003
    const detail: AssetDetail = {
      ...found,
      service_age_months: 34,
      last_maintenance_cycle: 145,
      current_cycle: 198,
      baseline_life_cycles: 250,
      engine_model: 'Pratt & Whitney F135-PW-100',
      assigned_squadron: '4th Fighter Squadron (Vipers)',
    };
    return fetchWithFallback(`${API_BASE}/assets/${assetId}`, detail);
  },

  // 4. Sensor telemetry history
  getSensorData: (assetId: string, cycles = 50): Promise<SensorReading[]> => {
    const mockTelemetry = generateTelemetry(assetId, cycles);
    return fetchWithFallback(`${API_BASE}/assets/${assetId}/sensors?recent_cycles=${cycles}`, mockTelemetry);
  },

  // 5. Readiness & Evidence Explanation
  getAssetReadiness: (assetId: string): Promise<AssetReadiness> => {
    const asset = MOCK_ASSETS.find(a => a.asset_id === assetId) || MOCK_ASSETS[2];
    const isCritical = asset.risk_level === 'CRITICAL';

    const mockReadiness: AssetReadiness = {
      asset_id: assetId,
      readiness_score: asset.readiness_score,
      readiness_category: asset.readiness_category,
      predicted_rul: asset.predicted_rul,
      mission_buffer_cycles: asset.predicted_rul - 30, // 30 cycle standard mission
      recommended_action: isCritical
        ? 'GROUND ASSET IMMEDIATELY. Initiate HPC stage 4 blade teardown & thermal barrier coating inspection.'
        : 'Perform standard 50-cycle turbine clearance check and monitor fuel ratio enthalpy.',
      evaluated_at: new Date().toISOString(),
      evidence_bullets: [
        {
          evidence_id: 'EV-8901',
          category: 'TELEMETRY',
          severity: isCritical ? 'CRITICAL' : 'WARNING',
          description: `Combustor Outlet Temp (s3) elevated by +${isCritical ? '48' : '12'}°K over recent 30 cycles indicating hot-section degradation.`,
          impact_score: isCritical ? -42 : -15,
        },
        {
          evidence_id: 'EV-8902',
          category: 'RUL_MARGIN',
          severity: isCritical ? 'CRITICAL' : 'INFO',
          description: `Predicted RUL of ${asset.predicted_rul} cycles is below required combat mission envelope threshold (30 cycles).`,
          impact_score: isCritical ? -35 : -5,
        },
        {
          evidence_id: 'EV-8903',
          category: 'COMPONENT_WEAR',
          severity: 'WARNING',
          description: 'HPT Coolant Bleed flow (s20) dropped by 10.8%, accelerating thermal stress on High-Pressure Turbine stage 1 blades.',
          impact_score: -18,
        },
        {
          evidence_id: 'EV-8904',
          category: 'MAINTENANCE_LOG',
          severity: 'INFO',
          description: 'Cross-referenced public aviation maintenance log #AV-2024-912: HPC stage 4 rotor seal wear symptoms detected.',
          impact_score: -10,
        },
      ],
    };
    return fetchWithFallback(`${API_BASE}/assets/${assetId}/readiness`, mockReadiness);
  },

  // 6. Prioritized Maintenance Queue
  getMaintenancePriorities: (priorityFilter?: string): Promise<MaintenanceItem[]> => {
    const queue: MaintenanceItem[] = [
      {
        id: 'MNT-101',
        asset_id: 'AC-003',
        priority: 'P1 - CRITICAL',
        risk_level: 'CRITICAL',
        predicted_rul: 12,
        identified_issue: 'HPC Outlet Thermal Spiking & Core Pressure Decay',
        affected_subsystem: 'High Pressure Compressor (HPC)',
        mission_impact: 'Severe threat of mid-flight engine stall during high-g combat maneuvers.',
        recommended_action: 'Ground asset; immediate teardown of HPC module & seal replacement.',
        knowledge_base_procedure: 'T.O. 1F-35A-2-70-1: HPC Rotor Stage 4 Inspection & Borescope Protocol',
        synthetic_asset_linkage: true,
        provenance_note: 'Recommended procedure derived from public aviation maintenance log knowledge base',
        created_at: '2026-09-14T08:00:00Z',
      },
      {
        id: 'MNT-102',
        asset_id: 'AC-014',
        priority: 'P1 - CRITICAL',
        risk_level: 'CRITICAL',
        predicted_rul: 19,
        identified_issue: 'Combustor Outlet Temperature Exceedance (s3 > 690K)',
        affected_subsystem: 'Combustion Chamber & Fuel Nozzles',
        mission_impact: 'Risk of turbine blade erosion during prolonged afterburner operation.',
        recommended_action: 'Replace fuel nozzle assembly #3 and inspect liner thermal barrier coating.',
        knowledge_base_procedure: 'T.O. 1F-15EX-2-20-4: Combustor Liner & Nozzle Refurbishment',
        synthetic_asset_linkage: true,
        provenance_note: 'Recommended procedure derived from public aviation maintenance log knowledge base',
        created_at: '2026-09-14T09:15:00Z',
      },
      {
        id: 'MNT-103',
        asset_id: 'AC-028',
        priority: 'P1 - CRITICAL',
        risk_level: 'CRITICAL',
        predicted_rul: 22,
        identified_issue: 'HPT Coolant Bleed Flow Drop (s20 < 35 lbf)',
        affected_subsystem: 'High Pressure Turbine Cooling Circuit',
        mission_impact: 'Potential thermal breakdown of turbine disk under high payload takeoff.',
        recommended_action: 'Flushing of secondary cooling passages and valve actuator recalibration.',
        knowledge_base_procedure: 'T.O. 1F-18E-2-40-1: Turbine Coolant Duct Clear & Flush Procedure',
        synthetic_asset_linkage: true,
        provenance_note: 'Recommended procedure derived from public aviation maintenance log knowledge base',
        created_at: '2026-09-14T10:30:00Z',
      },
      {
        id: 'MNT-104',
        asset_id: 'AC-007',
        priority: 'P2 - URGENT',
        risk_level: 'HIGH',
        predicted_rul: 42,
        identified_issue: 'Bypass Ratio Fluctuations (s14 drift)',
        affected_subsystem: 'Fan Guide Vane Actuator System',
        mission_impact: 'Sub-optimal fuel efficiency; potential operational range reduction.',
        recommended_action: 'Calibrate variable inlet guide vanes during scheduled overnight ground turn.',
        knowledge_base_procedure: 'T.O. 1F-35A-2-72-3: Fan Vane Rigging & Calibration',
        synthetic_asset_linkage: true,
        provenance_note: 'Recommended procedure derived from public aviation maintenance log knowledge base',
        created_at: '2026-09-13T14:20:00Z',
      },
      {
        id: 'MNT-105',
        asset_id: 'AC-019',
        priority: 'P3 - SCHEDULED',
        risk_level: 'MEDIUM',
        predicted_rul: 68,
        identified_issue: 'Routine 200-Hour Oil Sampling & Filter Replacement',
        affected_subsystem: 'Engine Lubrication & Sump Subsystem',
        mission_impact: 'None currently; routine preventive maintenance window.',
        recommended_action: 'Drain oil sump, replace magnetic chip detector filter, sample fluid.',
        knowledge_base_procedure: 'T.O. 1F-22A-2-12-1: Standard Lubrication Servicing',
        synthetic_asset_linkage: true,
        provenance_note: 'Recommended procedure derived from public aviation maintenance log knowledge base',
        created_at: '2026-09-12T11:00:00Z',
      },
    ];

    let res = queue;
    if (priorityFilter && priorityFilter !== 'ALL') {
      res = queue.filter(item => item.priority.startsWith(priorityFilter));
    }

    return fetchWithFallback(`${API_BASE}/maintenance/priorities?priority=${priorityFilter || ''}`, res);
  },

  // 7. Upcoming Mission Scenarios
  getUpcomingMissions: (): Promise<MissionWindow[]> => {
    const missions: MissionWindow[] = [
      {
        mission_id: 'MSN-2026-ALPHA',
        mission_name: 'Operation Northern Shield (Strike Patrol)',
        asset_id: 'AC-003',
        asset_type: 'F-35A Lightning II',
        start_date: '2026-09-20',
        end_date: '2026-09-24',
        mission_priority: 'CRITICAL',
        required_cycles: 28,
        current_rul: 12,
        buffer_margin: -16,
        status: 'MISSION THREAT',
        data_origin: 'synthetic',
      },
      {
        mission_id: 'MSN-2026-BRAVO',
        mission_name: 'Exercise Agile Reaper (Combat Air Patrol)',
        asset_id: 'AC-014',
        asset_type: 'F-15EX Eagle II',
        start_date: '2026-09-22',
        end_date: '2026-09-27',
        mission_priority: 'CRITICAL',
        required_cycles: 32,
        current_rul: 19,
        buffer_margin: -13,
        status: 'MISSION THREAT',
        data_origin: 'synthetic',
      },
      {
        mission_id: 'MSN-2026-CHARLIE',
        mission_name: 'Pacific Defender Reconnaissance',
        asset_id: 'AC-028',
        asset_type: 'F/A-18E Super Hornet',
        start_date: '2026-09-25',
        end_date: '2026-09-29',
        mission_priority: 'HIGH',
        required_cycles: 25,
        current_rul: 22,
        buffer_margin: -3,
        status: 'AT RISK',
        data_origin: 'synthetic',
      },
      {
        mission_id: 'MSN-2026-DELTA',
        mission_name: 'Baltic Escort & Intercept Patrol',
        asset_id: 'AC-007',
        asset_type: 'F-35A Lightning II',
        start_date: '2026-09-28',
        end_date: '2026-10-04',
        mission_priority: 'HIGH',
        required_cycles: 30,
        current_rul: 42,
        buffer_margin: +12,
        status: 'SAFE',
        data_origin: 'synthetic',
      },
      {
        mission_id: 'MSN-2026-ECHO',
        mission_name: 'Joint Force Maritime Air Defense',
        asset_id: 'AC-012',
        asset_type: 'F-22A Raptor',
        start_date: '2026-10-01',
        end_date: '2026-10-06',
        mission_priority: 'ROUTINE',
        required_cycles: 20,
        current_rul: 85,
        buffer_margin: +65,
        status: 'SAFE',
        data_origin: 'synthetic',
      },
    ];
    return fetchWithFallback(`${API_BASE}/missions/upcoming`, missions);
  },

  // 8. Bob Copilot Interactive Query
  queryBob: (query: string, assetId?: string): Promise<BobQueryResponse> => {
    const qLower = query.toLowerCase();
    let response: BobQueryResponse;

    if (qLower.includes('ac-003') || assetId === 'AC-003') {
      response = {
        answer: 'Asset AC-003 (F-35A Lightning II) is NOT READY due to severe high-pressure compressor degradation. Its predicted RUL is 12 cycles against an upcoming mission requirement of 28 cycles (negative margin of -16 cycles). Combustor outlet temperatures (s3) have spiked by +48K.',
        evidence: {
          asset_id: 'AC-003',
          predicted_rul: 12,
          mission_cycles_required: 28,
          buffer_cycles: -16,
          risk_level: 'CRITICAL',
          readiness_category: 'NOT READY',
          recommended_action: 'Ground asset immediately. Initiate P1 Critical maintenance task MNT-101 (HPC Stage 4 Teardown & Rotor Seal Replacement).',
        },
        tools_called: ['get_asset_details("AC-003")', 'get_readiness_evidence("AC-003")', 'check_mission_compatibility("AC-003")'],
      };
    } else if (qLower.includes('not ready') || qLower.includes('which assets')) {
      response = {
        answer: 'Currently 3 assets in the fleet are classified as NOT READY:\n1. AC-003 (F-35A) — RUL: 12 cycles | Critical HPC Spiking\n2. AC-014 (F-15EX) — RUL: 19 cycles | Combustor Temp Exceedance\n3. AC-028 (F/A-18E) — RUL: 22 cycles | Turbine Coolant Bleed Drop\n\nAll 3 present severe mission threats for upcoming 30-day combat operational windows.',
        evidence: {
          asset_id: 'AC-003, AC-014, AC-028',
          predicted_rul: 12,
          risk_level: 'CRITICAL',
          readiness_category: 'NOT READY',
          recommended_action: 'Prioritize P1 Critical Queue tasks MNT-101, MNT-102, and MNT-103 before mission start dates.',
        },
        tools_called: ['get_fleet_summary()', 'filter_assets(readiness="NOT READY")', 'get_maintenance_queue(priority="P1")'],
      };
    } else if (qLower.includes('first') || qLower.includes('maintenance')) {
      response = {
        answer: 'Maintenance crews must immediately execute Task MNT-101 on AC-003 (P1 Critical). AC-003 is scheduled for Operation Northern Shield on Sept 20, 2026, but has a negative mission buffer of -16 cycles. Replacing the HPC Stage 4 rotor seal will restore baseline RUL to >150 cycles.',
        evidence: {
          asset_id: 'AC-003',
          predicted_rul: 12,
          risk_level: 'CRITICAL',
          readiness_category: 'NOT READY',
          recommended_action: 'Execute T.O. 1F-35A-2-70-1: HPC Rotor Stage 4 Inspection & Borescope Protocol.',
        },
        tools_called: ['get_p1_maintenance_priorities()', 'cross_reference_knowledge_base("HPC Rotor Seal")'],
      };
    } else if (qLower.includes('mission') || qLower.includes('risk')) {
      response = {
        answer: '3 upcoming missions are currently threatened by asset non-readiness:\n- MSN-2026-ALPHA (AC-003): Threat margin -16 cycles\n- MSN-2026-BRAVO (AC-014): Threat margin -13 cycles\n- MSN-2026-CHARLIE (AC-028): At risk margin -3 cycles\n\nRecommend swapping AC-003 with fully ready reserve asset AC-012 (RUL: 85 cycles).',
        evidence: {
          asset_id: 'AC-003 (Swap with AC-012)',
          predicted_rul: 85,
          mission_cycles_required: 28,
          buffer_cycles: +57,
          risk_level: 'LOW',
          readiness_category: 'READY',
          recommended_action: 'Reassign MSN-2026-ALPHA to AC-012 to eliminate mission risk immediately.',
        },
        tools_called: ['get_upcoming_missions()', 'find_ready_reserve_assets(min_rul=50)'],
      };
    } else {
      response = {
        answer: `MissionGuard Bob Copilot analysis for query: "${query}"\n\nFleet Status Overview: 38 Total Aircraft Assets | 22 READY | 9 MONITORING | 4 INSPECTION | 3 NOT READY.\n\nAll critical telemetry parameters are being monitored in real time across 13 sensor streams (s2 to s21). For detailed asset drilldowns, specify an Asset ID such as AC-003 or select from the fleet table.`,
        evidence: {
          asset_id: 'FLEET-WIDE',
          predicted_rul: 110,
          risk_level: 'LOW',
          readiness_category: 'READY',
          recommended_action: 'Continue real-time telemetry monitoring.',
        },
        tools_called: ['query_fleet_telemetry()', 'evaluate_mission_readiness()'],
      };
    }

    return postWithFallback(`${API_BASE}/bob/query`, { query, asset_id: assetId }, response);
  },
};

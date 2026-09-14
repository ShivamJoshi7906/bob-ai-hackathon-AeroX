import React, { useState, useEffect } from 'react';
import {
  Plane,
  ShieldAlert,
  Clock,
  Calendar,
  Wrench,
  AlertTriangle,
  CheckCircle,
  FileText,
  Activity,
  ArrowLeft,
  Bot,
  Zap,
} from 'lucide-react';

import { AssetDetail } from '../types/asset';
import { AssetReadiness } from '../types/readiness';
import { SensorReading } from '../types/sensor';
import { StatusBadge } from '../components/StatusBadge';
import { RiskBadge } from '../components/RiskBadge';
import { LoadingState } from '../components/LoadingState';
import { api } from '../api/client';

interface AssetDetailsProps {
  assetId: string;
  onBack: () => void;
  onNavigateToSensors: (assetId: string) => void;
  onNavigateToBob: (query?: string, assetId?: string) => void;
}

export const AssetDetails: React.FC<AssetDetailsProps> = ({
  assetId,
  onBack,
  onNavigateToSensors,
  onNavigateToBob,
}) => {
  const [asset, setAsset] = useState<AssetDetail | null>(null);
  const [readiness, setReadiness] = useState<AssetReadiness | null>(null);
  const [telemetry, setTelemetry] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadAssetData() {
      setLoading(true);
      try {
        const [assetRes, readinessRes, sensorRes] = await Promise.all([
          api.getAssetDetails(assetId),
          api.getAssetReadiness(assetId),
          api.getSensorData(assetId, 10),
        ]);
        setAsset(assetRes);
        setReadiness(readinessRes);
        setTelemetry(sensorRes);
      } catch (err) {
        console.error('Error fetching asset details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAssetData();
  }, [assetId]);

  if (loading || !asset || !readiness) {
    return <LoadingState message={`Fetching diagnostics for ${assetId}...`} />;
  }

  const rulPercentage = Math.min(100, Math.round((asset.predicted_rul / asset.baseline_life_cycles) * 100));
  const isMissionThreat = readiness.mission_buffer_cycles < 0;

  return (
    <div className="space-y-6">
      
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Back to Fleet Register</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigateToSensors(assetId)}
            className="flex items-center space-x-2 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-lg text-xs font-mono transition"
          >
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Multi-Sensor Plot</span>
          </button>

          <button
            onClick={() => onNavigateToBob(`Why is ${assetId} ${readiness.readiness_category}?`, assetId)}
            className="flex items-center space-x-2 px-3.5 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 rounded-lg text-xs font-mono font-semibold transition"
          >
            <Bot className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>Ask Bob Copilot</span>
          </button>
        </div>
      </div>

      {/* Asset Overview Card Header */}
      <div className="glass-panel p-6 border-l-4 border-l-cyan-500 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-cyan-400">
              <Plane className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-black font-mono text-white tracking-wider">{asset.asset_id}</h1>
                <StatusBadge status={asset.readiness_category} size="md" />
                <RiskBadge risk={asset.risk_level} size="md" />
              </div>
              <p className="text-xs text-slate-400 font-medium mt-1">
                {asset.asset_type} • {asset.engine_model} • {asset.assigned_squadron}
              </p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-4 font-mono text-xs text-right">
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">OPERATING HOURS</span>
              <span className="text-white font-bold text-sm">{asset.total_operating_hours} hrs</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">CURRENT CYCLE</span>
              <span className="text-cyan-400 font-bold text-sm">#{asset.current_cycle}</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">SERVICE AGE</span>
              <span className="text-slate-200 font-bold text-sm">{asset.service_age_months} months</span>
            </div>
          </div>
        </div>
      </div>

      {/* RUL Gauge & Mission Compatibility Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* RUL Estimation Gauge Panel */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center">
              <Clock className="w-4 h-4 text-cyan-400 mr-2" />
              Predicted Remaining Useful Life (RUL)
            </h3>
            <span className="text-xs font-mono text-slate-400">Baseline: {asset.baseline_life_cycles} cycles</span>
          </div>

          {/* Gauge Value Display */}
          <div className="flex items-baseline justify-between pt-2">
            <div>
              <span className="text-4xl font-extrabold font-mono tracking-tight text-white">
                {asset.predicted_rul}
              </span>
              <span className="text-slate-400 text-sm font-mono ml-2">cycles remaining</span>
            </div>
            <span
              className={`text-sm font-mono font-bold px-2.5 py-1 rounded ${
                rulPercentage < 25
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {rulPercentage}% Life Margin
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-950 rounded-full h-4 p-0.5 border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                rulPercentage < 25
                  ? 'bg-gradient-to-r from-rose-600 to-orange-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                  : 'bg-gradient-to-r from-emerald-500 to-cyan-500'
              }`}
              style={{ width: `${rulPercentage}%` }}
            />
          </div>

          <p className="text-xs text-slate-400">
            * ML Model (RandomForest RUL Regressor) trained on C-MAPSS FD001 degradation telemetry.
          </p>
        </div>

        {/* Mission Compatibility Banner */}
        <div
          className={`glass-panel p-6 space-y-4 border ${
            isMissionThreat ? 'border-rose-500/50 bg-rose-950/10' : 'border-emerald-500/50 bg-emerald-950/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center">
              <Calendar className="w-4 h-4 text-cyan-400 mr-2" />
              Upcoming Mission Compatibility
            </h3>
            <span
              className={`px-2.5 py-0.5 text-xs font-mono font-bold rounded ${
                isMissionThreat
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}
            >
              {isMissionThreat ? 'MISSION THREAT' : 'MISSION READY'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 font-mono text-xs pt-2">
            <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">NEXT MISSION DATE</span>
              <span className="text-white font-bold">{readiness.mission_window_start || asset.next_mission_date || '2026-10-31'}</span>
            </div>
            <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">REQUIRED MISSION CYCLES</span>
              <span className="text-cyan-400 font-bold">{readiness.mission_cycles_required ?? 30} cycles</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 flex items-center justify-between font-mono text-xs">
            <span className="text-slate-300">Buffer Margin (RUL - Mission Req):</span>
            <span
              className={`text-sm font-bold ${
                readiness.mission_buffer_cycles < 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {readiness.mission_buffer_cycles > 0 ? '+' : ''}
              {readiness.mission_buffer_cycles} cycles
            </span>
          </div>
        </div>
      </div>

      {/* Readiness Explanation Box (Core Innovation) */}
      <div className="glass-panel p-6 space-y-4 border-l-4 border-l-amber-500">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center">
              <FileText className="w-5 h-5 text-amber-400 mr-2" />
              Readiness & Telemetry Evidence Explanation
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated multi-factor evidence audit generating actionable maintenance reasoning
            </p>
          </div>
          <div className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
            Readiness Score: {readiness.readiness_score} / 100
          </div>
        </div>

        {/* Recommended Action Box */}
        <div className="p-4 bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 rounded-xl flex items-start space-x-3">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
              RECOMMENDED MAINTENANCE ACTION
            </span>
            <p className="text-xs text-slate-100 font-medium mt-1 leading-relaxed">
              {readiness.recommended_action}
            </p>
          </div>
        </div>

        {/* Evidence Bullets */}
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Retrieved Evidence Bullets:
          </h4>
          <div className="grid grid-cols-1 gap-2.5">
            {readiness.evidence_bullets.map(item => (
              <div
                key={item.evidence_id}
                className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-lg flex items-start justify-between text-xs"
              >
                <div className="flex items-start space-x-3">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded uppercase ${
                      item.severity === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : item.severity === 'WARNING'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.category}
                  </span>
                  <p className="text-slate-200 leading-snug">{item.description}</p>
                </div>
                <span className="font-mono text-slate-400 font-bold ml-4">
                  {item.impact_score > 0 ? '+' : ''}
                  {item.impact_score} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Telemetry Snapshot */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center">
            <Activity className="w-4 h-4 text-cyan-400 mr-2" />
            Recent Telemetry Snapshot (Latest 10 Cycles)
          </h3>
          <button
            onClick={() => onNavigateToSensors(assetId)}
            className="text-xs font-mono text-cyan-400 hover:underline"
          >
            Open Full Sensor Studio →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase">
              <tr>
                <th className="p-2.5">Cycle</th>
                <th className="p-2.5">s2 (HPC Temp)</th>
                <th className="p-2.5">s3 (Combustor Temp)</th>
                <th className="p-2.5">s4 (LPT Temp)</th>
                <th className="p-2.5">s7 (HPC Pressure)</th>
                <th className="p-2.5">s20 (HPT Coolant)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {Array.isArray(telemetry) && telemetry.length > 0 ? (
                telemetry.map(row => (
                  <tr key={row.cycle} className="hover:bg-slate-900/60">
                    <td className="p-2.5 text-cyan-400 font-bold">#{row.cycle}</td>
                    <td className="p-2.5 text-slate-300">{row.s2} K</td>
                    <td
                      className={`p-2.5 font-bold ${
                        (row.s3 || 0) > 680 ? 'text-rose-400' : 'text-slate-300'
                      }`}
                    >
                      {row.s3} K
                    </td>
                    <td className="p-2.5 text-slate-300">{row.s4} K</td>
                    <td className="p-2.5 text-slate-300">{row.s7} psia</td>
                    <td className="p-2.5 text-slate-300">{row.s20} lbf</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-500">
                    No telemetry cycles recorded for this asset.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

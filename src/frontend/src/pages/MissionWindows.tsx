import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Crosshair,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Plane,
} from 'lucide-react';

import { MissionWindow } from '../types/mission';
import { LoadingState } from '../components/LoadingState';
import { api } from '../api/client';

interface MissionWindowsProps {
  onSelectAsset: (assetId: string) => void;
  onNavigateToBob: (query?: string, assetId?: string) => void;
}

export const MissionWindows: React.FC<MissionWindowsProps> = ({
  onSelectAsset,
  onNavigateToBob,
}) => {
  const [missions, setMissions] = useState<MissionWindow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadMissions() {
      setLoading(true);
      try {
        const data = await api.getUpcomingMissions();
        setMissions(data);
      } catch (err) {
        console.error('Error loading mission windows:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMissions();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-xl font-extrabold text-white flex items-center">
              <Calendar className="w-6 h-6 text-cyan-400 mr-2" />
              Upcoming Operational Mission Compatibility Timelines
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Synthetic 30-day mission deployment windows cross-referenced with predicted asset RUL cycles
            </p>
          </div>

          <button
            onClick={() => onNavigateToBob('Which assets are at risk before the next mission?')}
            className="flex items-center space-x-2 px-3.5 py-2 bg-cyan-950 border border-cyan-500/40 text-cyan-300 rounded-lg text-xs font-mono font-semibold hover:bg-cyan-900 transition"
          >
            <Crosshair className="w-4 h-4 text-cyan-400" />
            <span>Bob AI Mission Audit</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Total Missions Scheduled:</span>
            <span className="text-white font-bold">{missions.length} Operations</span>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Mission Threats Identified:</span>
            <span className="text-rose-400 font-bold">
              {missions.filter(m => m.status === 'MISSION THREAT').length} Operations (Deficit Cycles)
            </span>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Data Origin:</span>
            <span className="text-cyan-400 font-bold">Operational Timelines (2026-10-31)</span>
          </div>
        </div>
      </div>

      {/* Mission Timeline Table */}
      {loading ? (
        <LoadingState message="Calculating mission RUL buffer margins..." />
      ) : (
        <div className="glass-panel p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Active Mission Window Compatibility Register
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase">
                <tr>
                  <th className="p-3">Mission ID & Name</th>
                  <th className="p-3">Assigned Asset</th>
                  <th className="p-3">Window Dates</th>
                  <th className="p-3">Req Cycles</th>
                  <th className="p-3">Asset RUL</th>
                  <th className="p-3">Buffer Margin</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {missions.map(msn => {
                  const isThreat = msn.status === 'MISSION THREAT';
                  const isRisk = msn.status === 'AT RISK';

                  return (
                    <tr
                      key={msn.mission_id}
                      className={`transition hover:bg-slate-900/60 ${
                        isThreat ? 'bg-rose-950/20' : isRisk ? 'bg-amber-950/20' : ''
                      }`}
                    >
                      <td className="p-3">
                        <div className="font-bold text-white">{msn.mission_id}</div>
                        <div className="text-[11px] text-slate-400 font-sans">{msn.mission_name}</div>
                      </td>

                      <td className="p-3">
                        <button
                          onClick={() => onSelectAsset(msn.asset_id)}
                          className="font-bold text-cyan-300 hover:underline flex items-center"
                        >
                          <Plane className="w-3.5 h-3.5 mr-1" />
                          {msn.asset_id}
                        </button>
                        <div className="text-[10px] text-slate-400 font-sans">{msn.asset_type}</div>
                      </td>

                      <td className="p-3 text-slate-300">
                        {msn.start_date} → {msn.end_date}
                      </td>

                      <td className="p-3 text-slate-300">{msn.required_cycles} cycles</td>

                      <td
                        className={`p-3 font-bold ${
                          msn.current_rul < msn.required_cycles
                            ? 'text-rose-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {msn.current_rul} cycles
                      </td>

                      <td className="p-3 font-bold">
                        <span
                          className={`px-2 py-0.5 rounded ${
                            msn.buffer_margin < 0
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : msn.buffer_margin < 10
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {msn.buffer_margin > 0 ? '+' : ''}
                          {msn.buffer_margin} cycles
                        </span>
                      </td>

                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                            isThreat
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                              : isRisk
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          }`}
                        >
                          {msn.status}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <button
                          onClick={() => onSelectAsset(msn.asset_id)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded border border-slate-700 text-[11px]"
                        >
                          Inspect Asset →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

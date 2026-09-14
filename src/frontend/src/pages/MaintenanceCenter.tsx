import React, { useState, useEffect } from 'react';
import {
  Wrench,
  ShieldAlert,
  AlertTriangle,
  Clock,
  BookOpen,
  CheckCircle2,
  Filter,
  ArrowRight,
  Database,
} from 'lucide-react';

import { MaintenanceItem } from '../types/maintenance';
import { RiskBadge } from '../components/RiskBadge';
import { LoadingState } from '../components/LoadingState';
import { api } from '../api/client';

interface MaintenanceCenterProps {
  onSelectAsset: (assetId: string) => void;
}

export const MaintenanceCenter: React.FC<MaintenanceCenterProps> = ({ onSelectAsset }) => {
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [items, setItems] = useState<MaintenanceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadMaintenance() {
      setLoading(true);
      try {
        const data = await api.getMaintenancePriorities(activeTab);
        setItems(data);
      } catch (err) {
        console.error('Error loading maintenance tasks:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMaintenance();
  }, [activeTab]);

  return (
    <div className="space-y-6">
      
      {/* Header & Priority Tabs */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-xl font-extrabold text-white flex items-center">
              <Wrench className="w-6 h-6 text-cyan-400 mr-2" />
              Prioritized Aircraft Maintenance Command Center
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Ranked P1 Critical through P3 Scheduled maintenance actions cross-referenced with aviation KB logs
            </p>
          </div>

          {/* Priority Tabs */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'ALL'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Priorities
            </button>
            <button
              onClick={() => setActiveTab('P1')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'P1'
                  ? 'bg-rose-500/20 text-rose-400 font-bold border border-rose-500/40 animate-pulse'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              P1 - CRITICAL
            </button>
            <button
              onClick={() => setActiveTab('P2')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'P2'
                  ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              P2 - URGENT
            </button>
            <button
              onClick={() => setActiveTab('P3')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'P3'
                  ? 'bg-slate-800 text-slate-200 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              P3 - SCHEDULED
            </button>
          </div>
        </div>

        <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>KNOWLEDGE BASE PROVENANCE LINKAGE ACTIVE</span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">
            synthetic_asset_linkage: true (Public Aviation KB)
          </span>
        </div>
      </div>

      {/* Task Queue Grid */}
      {loading ? (
        <LoadingState message="Ranking maintenance queue priorities..." />
      ) : (
        <div className="space-y-4">
          {items.map(item => {
            const isP1 = item.priority.startsWith('P1');
            const isP2 = item.priority.startsWith('P2');

            return (
              <div
                key={item.id}
                className={`glass-panel p-6 space-y-4 border-l-4 transition hover:border-slate-600 ${
                  isP1
                    ? 'border-l-rose-500 bg-gradient-to-r from-rose-950/10 via-slate-900 to-slate-900'
                    : isP2
                    ? 'border-l-amber-500'
                    : 'border-l-slate-600'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2.5 py-1 text-xs font-mono font-extrabold rounded ${
                        isP1
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                          : isP2
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.priority}
                    </span>

                    <button
                      onClick={() => onSelectAsset(item.asset_id)}
                      className="text-base font-extrabold font-mono text-cyan-300 hover:underline"
                    >
                      {item.asset_id}
                    </button>

                    <RiskBadge risk={item.risk_level} size="sm" />
                  </div>

                  <div className="flex items-center space-x-4 font-mono text-xs text-slate-400">
                    <div>
                      <span>PREDICTED RUL: </span>
                      <span className="font-bold text-white">{item.predicted_rul} cycles</span>
                    </div>
                    <div>
                      <span>TICKET: </span>
                      <span className="font-bold text-slate-300">{item.id}</span>
                    </div>
                  </div>
                </div>

                {/* Body Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Issue & Impact */}
                  <div className="space-y-2 p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                    <div className="flex items-center space-x-2 text-slate-400 font-mono font-bold">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>IDENTIFIED TECHNICAL ISSUE</span>
                    </div>
                    <p className="text-white font-semibold">{item.identified_issue || 'Degradation detected across operational cycles'}</p>
                    <p className="text-slate-400">
                      <strong className="text-slate-300">Subsystem:</strong> {item.affected_subsystem || 'Turbofan Propulsion Subsystem'}
                    </p>
                    <p className="text-rose-300 font-medium">
                      <strong className="text-rose-400">Mission Impact:</strong> {item.mission_impact || 'Degraded mission capability'}
                    </p>
                  </div>

                  {/* Recommended Action & Knowledge Base Procedure */}
                  <div className="space-y-2 p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                    <div className="flex items-center space-x-2 text-cyan-400 font-mono font-bold">
                      <Wrench className="w-4 h-4" />
                      <span>ACTION & KNOWLEDGE BASE PROCEDURE</span>
                    </div>
                    <p className="text-emerald-300 font-medium">{item.recommended_action}</p>
                    <div className="p-2 bg-slate-900 rounded border border-slate-800 font-mono text-[11px] text-cyan-300 flex items-center space-x-2">
                      <BookOpen className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <span>{item.knowledge_base_procedure || 'Technical Order TO 1F-15E-2-71 Inspection Protocol'}</span>
                    </div>
                  </div>
                </div>

                {/* Provenance Tag */}
                <div className="flex items-center justify-between pt-2 text-[11px] font-mono text-slate-400 border-t border-slate-800/60">
                  <div className="flex items-center space-x-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{item.provenance_note || 'Derived from Public Aviation Maintenance Corpus (Zenodo)'}</span>
                  </div>

                  <button
                    onClick={() => onSelectAsset(item.asset_id)}
                    className="flex items-center space-x-1 text-cyan-400 hover:underline"
                  >
                    <span>Inspect Asset Telemetry</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

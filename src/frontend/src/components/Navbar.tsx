import React, { useState, useEffect } from 'react';
import { Shield, Radio, Activity, Bot } from 'lucide-react';
import { FleetSummary } from '../types/asset';

interface NavbarProps {
  summary?: FleetSummary | null;
  onNavigateToBob?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ summary, onNavigateToBob }) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5 shadow-2xl">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        
        {/* Left Brand Identity */}
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Shield className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black tracking-wider bg-gradient-to-r from-cyan-400 via-sky-200 to-white bg-clip-text text-transparent">
                MISSIONGUARD<span className="text-cyan-400 font-mono">.AI</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-700/50 rounded uppercase tracking-widest">
                DEFENSE D1
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Aerospace Predictive Maintenance & Mission Readiness Operations
            </p>
          </div>
        </div>

        {/* Center Fleet Status Pill */}
        <div className="hidden md:flex items-center space-x-3 px-4 py-2 bg-slate-900/90 border border-slate-800 rounded-full text-xs font-mono">
          <div className="flex items-center space-x-2 border-r border-slate-800 pr-3">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-semibold">FLEET STATUS:</span>
            <span className="text-cyan-400 font-bold">{summary ? summary.total_assets : 38} ASSETS</span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-emerald-400 font-bold">{summary ? summary.ready_count : 22} READY</span>
            <span className="text-amber-400 font-semibold">{summary ? summary.monitoring_count : 9} MONITOR</span>
            <span className="text-orange-400 font-semibold">{summary ? summary.inspection_count : 4} INSPEC</span>
            <span className="text-rose-400 font-extrabold animate-pulse">{summary ? summary.not_ready_count : 3} NOT READY</span>
          </div>
        </div>

        {/* Right Tools & Time */}
        <div className="flex items-center space-x-4">
          
          {/* Bob AI Copilot Trigger Pill */}
          {onNavigateToBob && (
            <button
              onClick={onNavigateToBob}
              className="flex items-center space-x-2 px-3.5 py-1.5 bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 rounded-lg text-xs font-mono font-semibold transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)]"
            >
              <Bot className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>BOB COPILOT</span>
            </button>
          )}

          {/* System Heartbeat & Time */}
          <div className="text-right hidden sm:block">
            <div className="flex items-center justify-end space-x-1.5 text-xs text-slate-400 font-mono">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>LIVE TELEMETRY</span>
            </div>
            <div className="text-xs font-mono font-semibold text-slate-300 tracking-wider">
              {time || '2026-09-14 12:15:00 UTC'}
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};

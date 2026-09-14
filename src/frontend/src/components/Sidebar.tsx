import React from 'react';
import {
  LayoutDashboard,
  Plane,
  LineChart,
  Wrench,
  Calendar,
  Bot,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export type PageId = 'fleet' | 'asset' | 'sensors' | 'maintenance' | 'missions' | 'bob';

interface SidebarProps {
  currentPage: PageId;
  onPageChange: (page: PageId) => void;
  selectedAssetId?: string;
  criticalCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onPageChange,
  selectedAssetId = 'AC-003',
  criticalCount = 3,
}) => {
  const navItems = [
    {
      id: 'fleet' as PageId,
      label: 'Fleet Dashboard',
      subtitle: 'Overview & KPI Metrics',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'asset' as PageId,
      label: 'Asset Details',
      subtitle: `Drilldown (${selectedAssetId})`,
      icon: Plane,
      badge: null,
    },
    {
      id: 'sensors' as PageId,
      label: 'Sensor Analytics',
      subtitle: 'Multi-Sensor Telemetry',
      icon: LineChart,
      badge: null,
    },
    {
      id: 'maintenance' as PageId,
      label: 'Maintenance Center',
      subtitle: 'Prioritized P1-P3 Queue',
      icon: Wrench,
      badge: criticalCount > 0 ? `${criticalCount} P1` : null,
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    },
    {
      id: 'missions' as PageId,
      label: 'Mission Windows',
      subtitle: 'Compatibility Timelines',
      icon: Calendar,
      badge: null,
    },
    {
      id: 'bob' as PageId,
      label: 'IBM Bob Copilot',
      subtitle: 'AI Decision Terminal',
      icon: Bot,
      badge: 'AI LIVE',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
  ];

  return (
    <aside className="w-64 bg-slate-950/80 border-r border-slate-800/80 flex flex-col justify-between p-4 min-h-[calc(100vh-65px)]">
      
      {/* Navigation List */}
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-3">
            OPERATIONAL COMMAND
          </p>

          <nav className="space-y-1.5">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group text-left ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-950/80 to-slate-900 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)] font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'bg-slate-900 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold tracking-wide">{item.label}</div>
                      <div className="text-[10px] text-slate-400 group-hover:text-slate-400">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    {item.badge && (
                      <span
                        className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded border uppercase ${
                          item.badgeColor || 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        isActive ? 'text-cyan-400 translate-x-0.5' : 'text-slate-400 group-hover:text-slate-300'
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tactical Readiness Widget */}
        <div className="p-3.5 rounded-xl glass-panel border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 font-semibold flex items-center">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 mr-1.5 animate-pulse" />
              PRIORITY ALERT
            </span>
            <span className="text-rose-400 font-bold">AC-003 GROUNDED</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            HPC Stage 4 Temp Spiking (+48K). Predicted RUL: 18.4 cycles.
          </p>
          <button
            onClick={() => onPageChange('asset')}
            className="w-full mt-1 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 underline text-left"
          >
            → Inspect AC-003 Evidence
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 space-y-1">
        <div>BOB AI HACKATHON 2026</div>
        <div>CHALLENGE D1: AEROSPACE AI</div>
        <div className="text-cyan-400 font-semibold">VALIDATION R²: 0.69 | MAE: 25.4c</div>
      </div>

    </aside>
  );
};

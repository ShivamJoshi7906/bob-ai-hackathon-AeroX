import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Search,
  Filter,
  ShieldAlert,
  Plane,
  AlertTriangle,
  CheckCircle,
  Activity,
  ChevronRight,
  ArrowUpDown,
} from 'lucide-react';

import { FleetSummary, AssetRow } from '../types/asset';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
import { RiskBadge } from '../components/RiskBadge';

interface FleetDashboardProps {
  summary: FleetSummary | null;
  assets: AssetRow[];
  onSelectAsset: (assetId: string) => void;
  onNavigateToMaintenance: () => void;
  onNavigateToBob: () => void;
}

interface RiskTooltipProps {
  active?: boolean;
  payload?: any[];
  totalAssets: number;
}

const RiskTooltip: React.FC<RiskTooltipProps> = ({ active, payload, totalAssets }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const level: string = data.level;
  const count: number = data.count;
  const fill: string = data.fill;
  const percentage = totalAssets > 0 ? ((count / totalAssets) * 100).toFixed(1) : '0.0';

  return (
    <div className="bg-slate-900 border border-slate-700/90 rounded-xl p-3.5 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.8)] font-mono text-xs min-w-[170px] space-y-2 pointer-events-none transition-all duration-150">
      {/* Title & Level Badge */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 gap-3">
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-sans">
          Failure Risk
        </span>
        <span
          className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider font-mono shadow-sm"
          style={{
            backgroundColor: `${fill}25`,
            color: fill,
            border: `1px solid ${fill}60`,
          }}
        >
          {level}
        </span>
      </div>

      {/* Metric Breakdown */}
      <div className="space-y-1.5 pt-0.5">
        <div className="flex items-baseline justify-between text-slate-300">
          <span className="text-slate-400 text-[11px]">Asset Count:</span>
          <span className="text-white font-bold text-sm">
            {count} {count === 1 ? 'Asset' : 'Assets'}
          </span>
        </div>
        <div className="flex items-baseline justify-between text-slate-300">
          <span className="text-slate-400 text-[11px]">Fleet Share:</span>
          <span className="font-bold text-cyan-300 text-xs">
            {percentage}% <span className="text-slate-400 text-[10px] font-normal">of Fleet</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export const FleetDashboard: React.FC<FleetDashboardProps> = ({
  summary,
  assets,
  onSelectAsset,
  onNavigateToMaintenance,
  onNavigateToBob,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [hoveredRiskIndex, setHoveredRiskIndex] = useState<number | null>(null);

  const totalFleetAssets = summary?.total_assets ?? (assets.length > 0 ? assets.length : 38);

  // Filtered Assets
  const filteredAssets = assets.filter(asset => {
    const matchesSearch =
      asset.asset_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.asset_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || asset.readiness_category === statusFilter;
    const matchesRisk = riskFilter === 'ALL' || asset.risk_level === riskFilter;
    return matchesSearch && matchesStatus && matchesRisk;
  });

  // Recharts Readiness Donut Data
  const readinessChartData = [
    { name: 'READY', value: summary?.ready_count ?? 26, color: '#10B981' },
    { name: 'MONITORING', value: summary?.monitoring_count ?? 6, color: '#F59E0B' },
    { name: 'INSPECTION', value: summary?.inspection_count ?? 3, color: '#F97316' },
    { name: 'NOT READY', value: summary?.not_ready_count ?? 3, color: '#EF4444' },
  ];

  // Dynamic Risk Distribution Bar Data from assets or summary
  const riskCounts = assets.reduce(
    (acc, a) => {
      const r = (a.risk_level || 'LOW').toUpperCase();
      if (r === 'CRITICAL') acc.critical++;
      else if (r === 'HIGH') acc.high++;
      else if (r === 'MEDIUM') acc.medium++;
      else acc.low++;
      return acc;
    },
    { low: 0, medium: 0, high: 0, critical: 0 }
  );

  const riskChartData = [
    { level: 'LOW', count: assets.length > 0 ? riskCounts.low : 26, fill: '#10B981' },
    { level: 'MEDIUM', count: assets.length > 0 ? riskCounts.medium : 6, fill: '#F59E0B' },
    { level: 'HIGH', count: assets.length > 0 ? riskCounts.high : 3, fill: '#F97316' },
    { level: 'CRITICAL', count: assets.length > 0 ? riskCounts.critical : (summary?.critical_risk_count ?? 3), fill: '#EF4444' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner: P1 Critical Operational Alert */}
      <div className="p-4 bg-gradient-to-r from-rose-950/90 via-slate-900 to-slate-900 border border-rose-500/40 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.15)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg animate-pulse">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded uppercase">
                P1 CRITICAL ALERT
              </span>
              <h2 className="text-sm font-bold text-white tracking-wide">
                3 AIRCRAFT ASSETS GROUNDED FOR IMMEDIATE MAINTENANCE
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              AC-003, AC-014, and AC-028 require urgent ground turns prior to upcoming combat mission deployment dates.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button
            onClick={() => onSelectAsset('AC-003')}
            className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 rounded-lg text-xs font-mono font-semibold transition"
          >
            Inspect AC-003 →
          </button>
          <button
            onClick={onNavigateToMaintenance}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition"
          >
            View Maintenance Queue
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Fleet Assets"
          value={summary?.total_assets ?? 38}
          subtitle="Active Fighter Fleet"
          icon={Plane}
          color="slate"
        />
        <MetricCard
          title="Fully Ready"
          value={summary?.ready_count ?? 26}
          subtitle="Mission Capable"
          icon={CheckCircle}
          color="emerald"
        />
        <MetricCard
          title="Ready w/ Monitoring"
          value={summary?.monitoring_count ?? 6}
          subtitle="Active Telemetry Watch"
          icon={Activity}
          color="amber"
        />
        <MetricCard
          title="Needs Inspection"
          value={summary?.inspection_count ?? 3}
          subtitle="Depot Clearance Pending"
          icon={AlertTriangle}
          color="orange"
        />
        <MetricCard
          title="Grounded / Not Ready"
          value={summary?.not_ready_count ?? 3}
          subtitle="P1 Critical Action"
          icon={ShieldAlert}
          color="rose"
        />
      </div>

      {/* Charts Section: Readiness Donut & Risk Distribution Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Readiness Distribution Donut */}
        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Fleet Readiness Breakdown
            </h3>
            <span className="text-xs font-mono text-slate-400">38 Total</span>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={readinessChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {readinessChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#020617" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const item = payload[0].payload;
                    const pct = totalFleetAssets > 0 ? ((item.value / totalFleetAssets) * 100).toFixed(1) : '0.0';
                    return (
                      <div className="bg-slate-900 border border-slate-700/90 rounded-xl p-3 shadow-2xl shadow-black/80 font-mono text-xs space-y-1.5 pointer-events-none min-w-[150px]">
                        <div className="flex items-center space-x-2 border-b border-slate-800 pb-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="font-bold text-white uppercase tracking-wider">{item.name}</span>
                        </div>
                        <div className="flex justify-between items-baseline text-slate-300">
                          <span className="text-slate-400 text-[11px]">Assets:</span>
                          <span className="font-bold text-white text-sm">{item.value}</span>
                        </div>
                        <div className="flex justify-between items-baseline text-slate-300">
                          <span className="text-slate-400 text-[11px]">Fleet Share:</span>
                          <span className="font-bold text-emerald-400">{pct}%</span>
                        </div>
                      </div>
                    );
                  }}
                  wrapperStyle={{ outline: 'none', zIndex: 100 }}
                  allowEscapeViewBox={{ x: true, y: true }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono border-t border-slate-800 pt-3">
            {readinessChartData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-1.5 rounded bg-slate-950/60">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300 font-semibold">{item.name}</span>
                </div>
                <span className="font-bold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Level Distribution Bar Chart */}
        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Failure Risk Profile
            </h3>
            <span className="text-xs font-mono text-slate-400">ML Predictions</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={riskChartData}
                margin={{ top: 12, right: 10, left: -20, bottom: 0 }}
                onMouseLeave={() => setHoveredRiskIndex(null)}
              >
                <XAxis dataKey="level" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  content={<RiskTooltip totalAssets={totalFleetAssets} />}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  wrapperStyle={{ outline: 'none', zIndex: 100 }}
                  allowEscapeViewBox={{ x: true, y: true }}
                  animationDuration={150}
                />
                <Bar
                  dataKey="count"
                  radius={[6, 6, 0, 0]}
                  cursor="pointer"
                  onMouseEnter={(_, index) => setHoveredRiskIndex(index)}
                >
                  {riskChartData.map((entry, index) => (
                    <Cell
                      key={`bar-${index}`}
                      fill={entry.fill}
                      fillOpacity={hoveredRiskIndex === null || hoveredRiskIndex === index ? 1 : 0.6}
                      stroke={hoveredRiskIndex === index ? '#ffffff' : 'transparent'}
                      strokeWidth={hoveredRiskIndex === index ? 1.5 : 0}
                      className="transition-all duration-150"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <span>High/Critical Risk Assets:</span>
            <span className="font-mono font-bold text-rose-400">
              {(summary?.high_risk_count ?? 3) + (summary?.critical_risk_count ?? 3)} Aircraft ({((((summary?.high_risk_count ?? 3) + (summary?.critical_risk_count ?? 3)) / (summary?.total_assets ?? 38)) * 100).toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* Copilot Quick Access Widget */}
        <div className="glass-panel p-5 flex flex-col justify-between space-y-4 bg-gradient-to-br from-slate-900 to-cyan-950/40 border-cyan-900/50">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 mb-2">
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-cyan-500/20 border border-cyan-500/30 rounded">
                IBM BOB COPILOT
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-white">
              AI Operational Assistant
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Ask natural language queries regarding aircraft readiness, telemetry anomalies, RUL estimates, and mission constraints.
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => onNavigateToBob()}
              className="w-full p-2.5 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 rounded-lg text-left text-xs font-mono text-cyan-300 transition flex items-center justify-between group"
            >
              <span>"Which assets are not ready?"</span>
              <ChevronRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onNavigateToBob()}
              className="w-full p-2.5 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 rounded-lg text-left text-xs font-mono text-cyan-300 transition flex items-center justify-between group"
            >
              <span>"Why is AC-003 not ready?"</span>
              <ChevronRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <button
            onClick={onNavigateToBob}
            className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-lg text-xs tracking-wider transition shadow-[0_0_15px_rgba(6,182,212,0.3)] uppercase font-mono"
          >
            Launch Bob AI Terminal →
          </button>
        </div>
      </div>

      {/* Asset Table with Search & Filters */}
      <div className="glass-panel p-6 space-y-4">
        
        {/* Table Header Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center">
              <Plane className="w-5 h-5 text-cyan-400 mr-2" />
              Fleet Operations & Readiness Register
            </h3>
            <p className="text-xs text-slate-400">
              Showing {filteredAssets.length} of {assets.length} monitored aerospace assets
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Asset ID (e.g. AC-003)..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 font-mono w-60"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1">
              <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none font-mono cursor-pointer"
              >
                <option value="ALL">All Readiness Statuses</option>
                <option value="READY">READY</option>
                <option value="READY WITH MONITORING">READY WITH MONITORING</option>
                <option value="NEEDS INSPECTION">NEEDS INSPECTION</option>
                <option value="NOT READY">NOT READY</option>
              </select>
            </div>

            {/* Risk Filter */}
            <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1">
              <select
                value={riskFilter}
                onChange={e => setRiskFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none font-mono cursor-pointer"
              >
                <option value="ALL">All Risk Levels</option>
                <option value="LOW">LOW Risk</option>
                <option value="MEDIUM">MEDIUM Risk</option>
                <option value="HIGH">HIGH Risk</option>
                <option value="CRITICAL">CRITICAL Risk</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Asset ID</th>
                <th className="p-3">Aircraft Model</th>
                <th className="p-3">Op Hours</th>
                <th className="p-3">Predicted RUL</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3">Readiness Category</th>
                <th className="p-3">Next Mission</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredAssets.map(asset => {
                const isTarget = ['AC-003', 'AC-014', 'AC-028'].includes(asset.asset_id);

                return (
                  <tr
                    key={asset.asset_id}
                    className={`transition hover:bg-slate-800/40 ${
                      isTarget ? 'bg-rose-950/20' : ''
                    }`}
                  >
                    <td className="p-3 font-bold text-cyan-300">
                      <button
                        onClick={() => onSelectAsset(asset.asset_id)}
                        className="hover:underline text-left"
                      >
                        {asset.asset_id}
                      </button>
                    </td>

                    <td className="p-3 text-slate-200 font-sans font-medium">
                      {asset.asset_type}
                    </td>

                    <td className="p-3 text-slate-300">
                      {asset.total_operating_hours} hrs
                    </td>

                    <td className="p-3">
                      <span
                        className={`font-bold font-mono ${
                          asset.predicted_rul < 20
                            ? 'text-rose-400'
                            : asset.predicted_rul < 50
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {asset.predicted_rul} cycles
                      </span>
                    </td>

                    <td className="p-3">
                      <RiskBadge risk={asset.risk_level} size="sm" />
                    </td>

                    <td className="p-3">
                      <StatusBadge status={asset.readiness_category} size="sm" />
                    </td>

                    <td className="p-3 text-slate-400 font-mono">
                      {asset.next_mission_date || '2026-09-20'}
                    </td>

                    <td className="p-3 text-right">
                      <button
                        onClick={() => onSelectAsset(asset.asset_id)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 border border-slate-700 rounded transition text-[11px] font-semibold"
                      >
                        View Details →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

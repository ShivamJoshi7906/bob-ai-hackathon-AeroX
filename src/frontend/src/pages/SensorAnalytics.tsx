import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import {
  Activity,
  Sliders,
  Filter,
  AlertTriangle,
  RefreshCw,
  Info,
} from 'lucide-react';

import { SensorReading, SensorMeta } from '../types/sensor';
import { LoadingState } from '../components/LoadingState';
import { api } from '../api/client';

interface SensorAnalyticsProps {
  initialAssetId?: string;
  onSelectAsset?: (assetId: string) => void;
}

const AVAILABLE_SENSORS: SensorMeta[] = [
  { key: 's3', name: 's3: Combustor Outlet Temp', unit: 'K', warningThreshold: 670, criticalThreshold: 690, normalRange: '640 - 660 K' },
  { key: 's4', name: 's4: LPT Outlet Temp', unit: 'K', warningThreshold: 1440, criticalThreshold: 1470, normalRange: '1390 - 1420 K' },
  { key: 's7', name: 's7: HPC Pressure', unit: 'psia', warningThreshold: 535, criticalThreshold: 520, normalRange: '550 - 560 psia' },
  { key: 's20', name: 's20: HPT Coolant Flow', unit: 'lbf', warningThreshold: 36, criticalThreshold: 34, normalRange: '38 - 39 lbf' },
  { key: 's21', name: 's21: LPT Coolant Flow', unit: 'lbf', warningThreshold: 22, criticalThreshold: 20, normalRange: '23 - 24 lbf' },
  { key: 's11', name: 's11: Static Pressure', unit: 'psia', warningThreshold: 48.5, criticalThreshold: 50.0, normalRange: '47.0 - 47.8 psia' },
  { key: 's14', name: 's14: Bypass Ratio', unit: 'ratio', warningThreshold: 8.6, criticalThreshold: 8.8, normalRange: '8.3 - 8.5' },
];

const SENSOR_COLORS: Record<string, string> = {
  s3: '#ef4444', // Red for combustor temp
  s4: '#f97316', // Orange for LPT temp
  s7: '#06b6d4', // Cyan for pressure
  s20: '#f59e0b', // Amber for coolant
  s21: '#10b981', // Emerald for LPT coolant
  s11: '#8b5cf6', // Purple for static pressure
  s14: '#ec4899', // Pink for bypass ratio
};

export const SensorAnalytics: React.FC<SensorAnalyticsProps> = ({
  initialAssetId = 'AC-003',
  onSelectAsset,
}) => {
  const [selectedAssetId, setSelectedAssetId] = useState<string>(initialAssetId);
  const [selectedSensors, setSelectedSensors] = useState<string[]>(['s3', 's7', 's20']);
  const [cycleRange, setCycleRange] = useState<number>(50);
  const [telemetry, setTelemetry] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadTelemetry() {
      setLoading(true);
      try {
        const data = await api.getSensorData(selectedAssetId, cycleRange);
        setTelemetry(data);
      } catch (err) {
        console.error('Error fetching sensor data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTelemetry();
  }, [selectedAssetId, cycleRange]);

  const toggleSensor = (key: string) => {
    if (selectedSensors.includes(key)) {
      if (selectedSensors.length > 1) {
        setSelectedSensors(selectedSensors.filter(k => k !== key));
      }
    } else {
      setSelectedSensors([...selectedSensors, key]);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Controls */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-xl font-extrabold text-white flex items-center">
              <Activity className="w-6 h-6 text-cyan-400 mr-2" />
              Multi-Sensor Telemetry Degradation Analytics
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Real-time thermal, pressure, and coolant flow sensor streams with degradation thresholds
            </p>
          </div>

          {/* Asset Selector & Cycle Zoom */}
          <div className="flex items-center space-x-4">
            
            {/* Asset Dropdown */}
            <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
              <span className="text-slate-400">Target Asset:</span>
              <select
                value={selectedAssetId}
                onChange={e => {
                  setSelectedAssetId(e.target.value);
                  if (onSelectAsset) onSelectAsset(e.target.value);
                }}
                className="bg-transparent text-cyan-300 font-bold focus:outline-none cursor-pointer"
              >
                <option value="AC-003">AC-003 (NOT READY - Critical)</option>
                <option value="AC-014">AC-014 (NOT READY - Critical)</option>
                <option value="AC-028">AC-028 (NOT READY - Critical)</option>
                <option value="AC-007">AC-007 (Inspection Needed)</option>
                <option value="AC-012">AC-012 (Fully Ready)</option>
                <option value="AC-001">AC-001 (Fully Ready)</option>
              </select>
            </div>

            {/* Cycle Count Selector */}
            <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
              <span className="text-slate-400">Range:</span>
              <button
                onClick={() => setCycleRange(30)}
                className={`px-2 py-0.5 rounded ${cycleRange === 30 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'}`}
              >
                30 Cycles
              </button>
              <button
                onClick={() => setCycleRange(50)}
                className={`px-2 py-0.5 rounded ${cycleRange === 50 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'}`}
              >
                50 Cycles
              </button>
            </div>

          </div>
        </div>

        {/* Sensor Toggle Chips */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">
            Select Active Sensors to Plot:
          </span>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_SENSORS.map(s => {
              const isSelected = selectedSensors.includes(s.key);
              const color = SENSOR_COLORS[s.key] || '#06b6d4';

              return (
                <button
                  key={s.key}
                  onClick={() => toggleSensor(s.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition flex items-center space-x-2 border ${
                    isSelected
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                  style={{ borderColor: isSelected ? color : undefined }}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span>{s.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Recharts Telemetry Canvas */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            {selectedAssetId} — Multi-Sensor Degradation Curves
          </h2>
          <span className="text-xs font-mono text-cyan-400">
            Plotting {telemetry.length} Operating Cycles
          </span>
        </div>

        {loading ? (
          <LoadingState message="Rendering high-frequency sensor streams..." />
        ) : (
          <div className="h-96 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetry} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="cycle" stroke="#64748b" fontSize={11} label={{ value: 'Operating Cycle #', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#64748b" fontSize={11} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />

                {/* Reference Line for Combustor Warning Threshold */}
                {selectedSensors.includes('s3') && (
                  <ReferenceLine
                    y={670}
                    label={{ value: 's3 Warning (670K)', fill: '#ef4444', fontSize: 10, position: 'top' }}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                  />
                )}

                {/* Active Lines */}
                {selectedSensors.map(key => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={AVAILABLE_SENSORS.find(s => s.key === key)?.name || key}
                    stroke={SENSOR_COLORS[key] || '#06b6d4'}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Sensor Specification Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {AVAILABLE_SENSORS.filter(s => selectedSensors.includes(s.key)).map(s => (
          <div key={s.key} className="glass-panel p-4 space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-slate-200">{s.name}</span>
              <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-cyan-400 rounded">
                {s.unit}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Normal Operating Band:</span>
              <span className="text-slate-200">{s.normalRange}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Warning Threshold:</span>
              <span className="text-amber-400 font-bold">{s.warningThreshold} {s.unit}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

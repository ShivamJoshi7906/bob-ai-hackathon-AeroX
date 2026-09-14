import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

interface RiskBadgeProps {
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
  size?: 'sm' | 'md';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ risk, size = 'md' }) => {
  const getStyle = () => {
    switch (risk) {
      case 'LOW':
        return 'risk-low';
      case 'MEDIUM':
        return 'risk-medium';
      case 'HIGH':
        return 'risk-high';
      case 'CRITICAL':
        return 'risk-critical';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  const sizeCss = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center font-mono font-bold rounded-md uppercase tracking-wider ${getStyle()} ${sizeCss}`}>
      {risk === 'CRITICAL' && <ShieldAlert className="w-3 h-3 mr-1 text-rose-400 animate-pulse" />}
      {risk === 'HIGH' && <AlertTriangle className="w-3 h-3 mr-1 text-orange-400" />}
      {risk === 'LOW' && <ShieldCheck className="w-3 h-3 mr-1 text-emerald-400" />}
      {risk}
    </span>
  );
};

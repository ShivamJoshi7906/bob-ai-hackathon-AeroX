import React from 'react';
import { CheckCircle, AlertTriangle, AlertOctagon, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'READY' | 'READY WITH MONITORING' | 'NEEDS INSPECTION' | 'NOT READY' | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', showIcon = true }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'READY':
        return {
          css: 'badge-ready',
          icon: <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />,
        };
      case 'READY WITH MONITORING':
        return {
          css: 'badge-monitoring',
          icon: <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-amber-400" />,
        };
      case 'NEEDS INSPECTION':
        return {
          css: 'badge-inspection',
          icon: <AlertOctagon className="w-3.5 h-3.5 mr-1.5 text-orange-400" />,
        };
      case 'NOT READY':
        return {
          css: 'badge-not-ready',
          icon: <XCircle className="w-3.5 h-3.5 mr-1.5 text-rose-400" />,
        };
      default:
        return {
          css: 'bg-slate-800 text-slate-300 border border-slate-700',
          icon: null,
        };
    }
  };

  const { css, icon } = getBadgeStyle();

  const sizeCss = size === 'sm' 
    ? 'px-2 py-0.5 text-xs font-semibold' 
    : size === 'lg' 
    ? 'px-3.5 py-1.5 text-sm font-bold' 
    : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span className={`inline-flex items-center rounded-full uppercase tracking-wider ${css} ${sizeCss}`}>
      {showIcon && icon}
      {status}
    </span>
  );
};

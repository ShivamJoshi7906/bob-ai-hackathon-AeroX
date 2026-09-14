import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  color?: 'cyan' | 'emerald' | 'amber' | 'orange' | 'rose' | 'slate';
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'cyan',
  trend,
  trendType = 'neutral',
  onClick,
}) => {
  const getColorStyles = () => {
    switch (color) {
      case 'emerald':
        return {
          border: 'hover:border-emerald-500/50',
          text: 'text-emerald-400',
          glow: 'group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]',
          iconBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
        };
      case 'amber':
        return {
          border: 'hover:border-amber-500/50',
          text: 'text-amber-400',
          glow: 'group-hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]',
          iconBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
        };
      case 'orange':
        return {
          border: 'hover:border-orange-500/50',
          text: 'text-orange-400',
          glow: 'group-hover:shadow-[0_0_20px_rgba(249,115,22,0.15)]',
          iconBg: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
        };
      case 'rose':
        return {
          border: 'hover:border-rose-500/50',
          text: 'text-rose-400',
          glow: 'group-hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]',
          iconBg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
        };
      case 'slate':
        return {
          border: 'hover:border-slate-600',
          text: 'text-slate-200',
          glow: '',
          iconBg: 'bg-slate-800 text-slate-400 border border-slate-700',
        };
      case 'cyan':
      default:
        return {
          border: 'hover:border-cyan-500/50',
          text: 'text-cyan-400',
          glow: 'group-hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]',
          iconBg: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
        };
    }
  };

  const styles = getColorStyles();

  return (
    <div
      onClick={onClick}
      className={`group relative glass-panel p-5 transition-all duration-300 ${styles.border} ${styles.glow} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className={`mt-2 text-3xl font-extrabold font-mono tracking-tight ${styles.text}`}>
            {value}
          </h3>
        </div>

        {Icon && (
          <div className={`p-3 rounded-lg ${styles.iconBg}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 flex items-center justify-between text-xs border-t border-slate-800/80 pt-3">
          {subtitle && <span className="text-slate-400 font-medium">{subtitle}</span>}
          {trend && (
            <span
              className={`font-mono font-semibold ${
                trendType === 'positive'
                  ? 'text-emerald-400'
                  : trendType === 'negative'
                  ? 'text-rose-400'
                  : 'text-slate-400'
              }`}
            >
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

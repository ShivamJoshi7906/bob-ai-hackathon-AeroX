import React from 'react';
import { RefreshCw } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  rows?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading aerospace telemetry data...', rows = 3 }) => {
  return (
    <div className="w-full p-8 glass-panel flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin" />
        <RefreshCw className="w-5 h-5 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      </div>
      <p className="text-sm font-medium text-slate-400 font-mono tracking-wide animate-pulse">
        {message}
      </p>

      {/* Skeleton placeholders */}
      <div className="w-full max-w-md space-y-2 pt-2">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="h-3 bg-slate-800/80 rounded animate-pulse" style={{ animationDelay: `${idx * 150}ms` }} />
        ))}
      </div>
    </div>
  );
};

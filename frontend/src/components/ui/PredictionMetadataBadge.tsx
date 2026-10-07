'use client';

import React from 'react';
import { useActiveDataset } from '@/context/ActiveDatasetContext';
import { Database, Calendar, Layers, CheckCircle2, Sparkles } from 'lucide-react';

interface PredictionMetadataBadgeProps {
  className?: string;
  compact?: boolean;
}

export const PredictionMetadataBadge: React.FC<PredictionMetadataBadgeProps> = ({
  className = '',
  compact = false
}) => {
  const { activeDataset, isDefault } = useActiveDataset();

  if (compact) {
    return (
      <div className={`inline-flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
        isDefault
          ? 'bg-slate-900/90 border-slate-800 text-slate-300'
          : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
      } ${className}`}>
        <span className="font-semibold text-slate-400">Prediction based on:</span>
        <code className="font-bold text-white font-mono">{activeDataset.filename}</code>
        <span className="text-slate-600">•</span>
        <span>{activeDataset.timeRange}</span>
        <span className="text-slate-600">•</span>
        <span>{activeDataset.primaryFrequency}</span>
      </div>
    );
  }

  return (
    <div
      className={`p-3.5 sm:p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
        isDefault
          ? 'bg-slate-900/80 border-slate-800 text-slate-300'
          : 'bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-900 border-emerald-500/40 text-emerald-200 shadow-md'
      } ${className}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className={`p-1.5 rounded-lg shrink-0 ${
            isDefault
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
          }`}
        >
          <Database size={15} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              Prediction based on:
            </span>
            <span className="font-mono font-bold text-white truncate text-xs sm:text-sm">
              {activeDataset.filename}
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                isDefault
                  ? 'bg-slate-800 text-slate-400 border-slate-700'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}
            >
              {isDefault ? 'Default' : 'Active Upload'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs text-slate-400">
        <span>
          Rows used: <strong className="text-white font-mono">{activeDataset.rowsUsed}</strong>
        </span>
        <span className="text-slate-600">•</span>
        <span>
          Valid compute: <strong className="text-emerald-400 font-mono">{activeDataset.validComputeRecords}</strong>
        </span>
        <span className="text-slate-600">•</span>
        <span>
          Time range: <strong className="text-cyan-300 font-mono">{activeDataset.timeRange}</strong>
        </span>
        <span className="text-slate-600">•</span>
        <span>
          Primary frequency: <strong className="text-purple-300">{activeDataset.primaryFrequency}</strong>
        </span>
      </div>
    </div>
  );
};

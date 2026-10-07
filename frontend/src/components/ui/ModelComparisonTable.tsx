'use client';

import React from 'react';
import { ModelComparison } from '@/data/projectData';
import { CheckCircle2, AlertOctagon } from 'lucide-react';

interface ModelComparisonTableProps {
  models: ModelComparison[];
  selectedModelName?: string;
}

export const ModelComparisonTable: React.FC<ModelComparisonTableProps> = ({
  models,
  selectedModelName = 'Linear Trend'
}) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/90 shadow-md">
      <table className="w-full text-left text-xs sm:text-sm border-collapse">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
            <th className="py-3 px-4">Candidate Model</th>
            <th className="py-3 px-3 text-right">Backtest MAE</th>
            <th className="py-3 px-3 text-right">Backtest RMSE</th>
            <th className="py-3 px-3 text-right">OOS R²</th>
            <th className="py-3 px-3 text-right">2026 Error</th>
            <th className="py-3 px-3 text-right">2030 (log10)</th>
            <th className="py-3 px-3">Extrapolation Nature</th>
            <th className="py-3 px-3 text-center">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {models.map((m) => {
            const isSelected = m.model.includes('Linear Trend');
            const isLowestRmse = m.model.includes('ARIMA(0,1,0)');
            const isExplosive = m.model.includes('Quadratic');

            return (
              <tr
                key={m.model}
                className={`transition-colors hover:bg-slate-800/40 ${
                  isSelected ? 'bg-blue-950/30 font-medium' : ''
                }`}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${isSelected ? 'text-blue-400' : 'text-white'}`}>
                      {m.model}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold">
                        PRIMARY
                      </span>
                    )}
                  </div>
                </td>

                <td className="py-3 px-3 text-right font-mono text-slate-200">
                  {m.mae.toFixed(4)}
                </td>

                <td className="py-3 px-3 text-right font-mono">
                  <span className={`${isLowestRmse ? 'text-emerald-400 font-bold' : isExplosive ? 'text-rose-400 font-bold' : 'text-slate-200'}`}>
                    {m.rmse.toFixed(4)}
                  </span>
                </td>

                <td className="py-3 px-3 text-right font-mono text-slate-200">
                  {m.oosR2.toFixed(4)}
                </td>

                <td className="py-3 px-3 text-right font-mono">
                  <span className={`${Math.abs(m.error2026Partial) < 0.05 ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                    {m.error2026Partial > 0 ? `+${m.error2026Partial.toFixed(4)}` : m.error2026Partial.toFixed(4)}
                  </span>
                </td>

                <td className="py-3 px-3 text-right font-mono text-slate-200">
                  {m.forecast2030Log10.toFixed(2)}
                </td>

                <td className="py-3 px-3 text-slate-300 text-xs">
                  {m.behavior}
                </td>

                <td className="py-3 px-3 text-center">
                  {isSelected ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                      <CheckCircle2 size={14} /> Selected
                    </span>
                  ) : isExplosive ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-rose-400">
                      <AlertOctagon size={14} /> Rejected
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      Evaluated
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

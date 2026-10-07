'use client';

import React, { useState, useMemo } from 'react';
import { useActiveDataset } from '@/context/ActiveDatasetContext';
import { ModelComparisonTable } from '@/components/ui/ModelComparisonTable';
import { StatCard } from '@/components/ui/StatCard';
import { ExplanationCard } from '@/components/ui/ExplanationCard';
import { PredictionMetadataBadge } from '@/components/ui/PredictionMetadataBadge';
import { Badge } from '@/components/ui/Badge';
import {
  History,
  Calendar,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export const BacktestingView: React.FC = () => {
  const { modelComparison, backtestResults, activeDataset, isDefault } = useActiveDataset();

  // Extract unique test years dynamically from backtest results
  const uniqueTestYears = useMemo(() => {
    return Array.from(new Set(backtestResults.map((r) => r.testYear))).sort((a, b) => a - b);
  }, [backtestResults]);

  const defaultYear = uniqueTestYears.length > 0 ? uniqueTestYears[uniqueTestYears.length - 1] : 2025;
  const [selectedFold, setSelectedFold] = useState<number>(defaultYear);

  const activeSelectedFold = uniqueTestYears.includes(selectedFold) ? selectedFold : defaultYear;

  // Folds definitions
  const folds = useMemo(() => {
    return uniqueTestYears.map((yr, idx) => ({
      fold: idx + 1,
      train: `Historical (Through ${yr - 1})`,
      test: yr,
      desc: `Out-of-sample evaluation on ${yr}`
    }));
  }, [uniqueTestYears]);

  // Chart data comparing MAE & RMSE across all models
  const errorChartData = modelComparison.map((m) => ({
    name: m.model.replace('+drift', '').replace('Trend', ''),
    MAE: m.mae,
    RMSE: m.rmse,
    OOS_R2: m.oosR2
  }));

  // Filter backtest results for selected test year
  const foldResults = backtestResults.filter((r) => r.testYear === activeSelectedFold);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-md">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {folds.length}-Fold Chronological Rolling-Origin Backtesting
          </h2>
          <Badge variant="success">Strict Out-of-Sample Protocol</Badge>
          <Badge variant="purple">No Lookahead Bias</Badge>
        </div>
        <p className="text-xs sm:text-sm text-slate-300">
          Rigorous temporal validation across {folds.length} consecutive folds. Models are trained strictly on past history and tested on unseen future observations.
        </p>
      </div>

      {/* Critical Active Dataset Label */}
      <PredictionMetadataBadge />

      {/* Visual Timeline of 7 Folds */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <History size={18} className="text-blue-400" />
            Chronological Rolling-Origin Windows (Click to inspect errors)
          </h3>
          <span className="text-xs text-slate-400">
            Selected Test Year: <strong className="text-emerald-400">{selectedFold}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5">
          {folds.map((f) => {
            const isSelected = selectedFold === f.test;
            return (
              <button
                key={f.test}
                onClick={() => setSelectedFold(f.test)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-950/30 shadow-md'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Fold {f.fold}</span>
                  <span className={`font-bold ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`}>
                    Test {f.test}
                  </span>
                </div>
                <div className="text-xs font-semibold text-white">
                  Train: {f.train.split(' ')[0]}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 truncate">
                  {f.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Fold Detail Inspection Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/90 shadow-md">
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">
              Fold Detailed Errors for Unseen Test Year: {selectedFold}
            </h3>
            <p className="text-xs text-slate-400">
              True Observed Y_{selectedFold} = <strong className="text-white font-mono">{foldResults[0]?.actual.toFixed(4) || 'N/A'}</strong> log₁₀ FLOP
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono">
            Error = Actual - Predicted
          </span>
        </div>

        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold uppercase text-[11px]">
              <th className="py-2.5 px-4">Model</th>
              <th className="py-2.5 px-3 text-right">Actual Y_t</th>
              <th className="py-2.5 px-3 text-right">Predicted Y_t</th>
              <th className="py-2.5 px-3 text-right">Raw Error (e_t)</th>
              <th className="py-2.5 px-3 text-right">Absolute Error (|e_t|)</th>
              <th className="py-2.5 px-3 text-right">Squared Error (e_t²)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {foldResults.map((r) => {
              const isLinear = r.model.includes('Linear');
              return (
                <tr
                  key={r.model}
                  className={`hover:bg-slate-800/40 transition ${
                    isLinear ? 'bg-blue-950/20 font-medium' : ''
                  }`}
                >
                  <td className="py-2 px-4 font-sans font-semibold text-white">
                    {r.model}
                    {isLinear && (
                      <span className="ml-2 text-[10px] px-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        PRIMARY
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-300">
                    {r.actual.toFixed(4)}
                  </td>
                  <td className="py-2 px-3 text-right text-cyan-300">
                    {r.predicted.toFixed(4)}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-200">
                    {r.error > 0 ? `+${r.error.toFixed(4)}` : r.error.toFixed(4)}
                  </td>
                  <td className="py-2 px-3 text-right text-amber-300 font-semibold">
                    {r.absoluteError.toFixed(4)}
                  </td>
                  <td className="py-2 px-3 text-right text-rose-300">
                    {r.squaredError.toFixed(4)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Comprehensive Model Comparison Across All 7 Folds */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">
            Overall 7-Fold Aggregate Model Performance Table
          </h3>
          <span className="text-xs text-slate-400">
            Across All 7 Folds (2019–2025)
          </span>
        </div>
        <ModelComparisonTable models={modelComparison} />
      </div>

      {/* Visual Bar Chart of MAE & RMSE */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-md">
        <div className="mb-4">
          <h3 className="text-base font-bold text-white">
            Out-of-Sample MAE & RMSE Comparison Across 6 Models
          </h3>
          <p className="text-xs text-slate-400">
            Lower error is better. Notice how Quadratic exhibits high RMSE due to out-of-sample instability.
          </p>
        </div>

        <div className="h-72 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={errorChartData} margin={{ top: 15, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="MAE" fill="#38bdf8" radius={[4, 4, 0, 0]} name="Mean Absolute Error (MAE)" />
              <Bar dataKey="RMSE" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Root Mean Square Error (RMSE)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Methodological Rationale Card */}
      <ExplanationCard
        title="Methodological Rationale: Why Rolling-Origin Backtesting?"
        type="tip"
        badge="Temporal Integrity"
      >
        <p className="text-white font-medium">
          The model is trained strictly on earlier chronological years and tested on later unseen horizons.
        </p>
        <p className="mt-1 text-xs text-slate-300 leading-relaxed">
          Standard k-fold cross-validation randomly scrambles years, training on 2024 to predict 2012. This introduces <em>lookahead bias</em>, as future technological scaling leaks backward into past predictions. Chronological expanding-window validation respects time causality, proving true predictive generalization.
        </p>
      </ExplanationCard>
    </div>
  );
};

'use client';

import React, { useState, useMemo } from 'react';
import { useActiveDataset } from '@/context/ActiveDatasetContext';
import { StatCard } from '@/components/ui/StatCard';
import { ExplanationCard } from '@/components/ui/ExplanationCard';
import { PredictionMetadataBadge } from '@/components/ui/PredictionMetadataBadge';
import { Badge } from '@/components/ui/Badge';
import {
  CheckCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Sliders,
  Filter
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

export const ActualVsPredictedView: React.FC = () => {
  const { backtestResults, activeDataset } = useActiveDataset();
  const [selectedModel, setSelectedModel] = useState<string>('Linear Trend');

  const availableModels = useMemo(() => {
    const models = Array.from(new Set(backtestResults.map((r) => r.model)));
    return models.length > 0 ? models : ['Linear Trend', 'Naive'];
  }, [backtestResults]);

  // Filter backtest records for the selected model
  const modelRecords = backtestResults.filter((r) => r.model === selectedModel);

  // Compute aggregate metrics for selected model
  const meanAbsError =
    modelRecords.reduce((acc, r) => acc + r.absoluteError, 0) / (modelRecords.length || 1);
  const rootMeanSqError = Math.sqrt(
    modelRecords.reduce((acc, r) => acc + r.squaredError, 0) / (modelRecords.length || 1)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Actual vs. Predicted Evaluation ({activeDataset.filename})
              </h2>
              <Badge variant="primary">Model Diagnostics</Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              Interactive residual examination across out-of-sample backtest evaluation folds for {activeDataset.filename}.
            </p>
          </div>

          {/* Model Selector Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Select Model:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-blue-500 shadow-sm"
            >
              {availableModels.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Critical Active Dataset Label */}
      <PredictionMetadataBadge />

      {/* Model KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Selected Model"
          value={selectedModel.replace(' Trend', '')}
          subtitle="7-fold backtest evaluation"
          badge={selectedModel.includes('Linear') ? 'PRIMARY' : 'EVAL'}
          badgeColor={selectedModel.includes('Linear') ? 'green' : 'blue'}
        />
        <StatCard
          title="Evaluation Folds"
          value="7 Years"
          subtitle="2019, 2020, ..., 2025"
          badge="1-Step Out-of-Sample"
          badgeColor="purple"
        />
        <StatCard
          title="Model MAE"
          value={meanAbsError.toFixed(4)}
          subtitle="Mean Absolute Error (dex)"
          badge="Linear Error"
          badgeColor="blue"
        />
        <StatCard
          title="Model RMSE"
          value={rootMeanSqError.toFixed(4)}
          subtitle="Root Mean Square Error"
          badge="Penalizes Spikes"
          badgeColor={rootMeanSqError < 0.9 ? 'green' : 'amber'}
        />
      </div>

      {/* Chart: Actual vs Predicted across 2019–2025 */}
      <div className="p-5 sm:p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-md">
        <div className="mb-4">
          <h3 className="text-base font-bold text-white">
            Observed Actual Y_t vs. {selectedModel} Forecast (2019–2025)
          </h3>
          <p className="text-xs text-slate-400">
            Solid blue = Ground Truth actual observations. Dashed cyan = 1-step out-of-sample predictions.
          </p>
        </div>

        <div className="h-80 sm:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={modelRecords} margin={{ top: 15, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="testYear" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis domain={[17, 26]} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                formatter={(val: any, name: any) => {
                  const num = typeof val === 'number' ? val.toFixed(4) : val;
                  if (name === 'actual') return [`${num} log₁₀ FLOP`, 'Ground Truth Actual'];
                  if (name === 'predicted') return [`${num} log₁₀ FLOP`, `${selectedModel} Forecast`];
                  return [num, name];
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line
                type="monotone"
                dataKey="actual"
                name="Actual Observed Median"
                stroke="#38bdf8"
                strokeWidth={3}
                dot={{ r: 5, fill: '#38bdf8' }}
              />
              <Line
                type="monotone"
                dataKey="predicted"
                name={`${selectedModel} Prediction`}
                stroke="#10b981"
                strokeWidth={2.5}
                strokeDasharray="4 4"
                dot={{ r: 4, fill: '#10b981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Residual Breakdown Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/90 shadow-md">
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">
            Residual & Error Breakdown Table for {selectedModel}
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            e_t = y_t - ŷ_t
          </span>
        </div>

        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold uppercase text-[11px]">
              <th className="py-2.5 px-4">Test Year</th>
              <th className="py-2.5 px-3 text-right">Actual (y_t)</th>
              <th className="py-2.5 px-3 text-right">Predicted (ŷ_t)</th>
              <th className="py-2.5 px-3 text-right">Residual (e_t)</th>
              <th className="py-2.5 px-3 text-right">Absolute Error (|e_t|)</th>
              <th className="py-2.5 px-3 text-right">Squared Error (e_t²)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {modelRecords.map((r) => (
              <tr key={r.testYear} className="hover:bg-slate-800/30">
                <td className="py-2.5 px-4 font-sans font-bold text-white">
                  {r.testYear}
                </td>
                <td className="py-2.5 px-3 text-right text-slate-300">
                  {r.actual.toFixed(4)}
                </td>
                <td className="py-2.5 px-3 text-right text-cyan-300">
                  {r.predicted.toFixed(4)}
                </td>
                <td className="py-2.5 px-3 text-right">
                  <span className={r.error >= 0 ? 'text-emerald-400' : 'text-amber-400'}>
                    {r.error >= 0 ? `+${r.error.toFixed(4)}` : r.error.toFixed(4)}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right text-amber-300 font-medium">
                  {r.absoluteError.toFixed(4)}
                </td>
                <td className="py-2.5 px-3 text-right text-rose-300">
                  {r.squaredError.toFixed(4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Error Mathematical Definitions Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 text-xs space-y-1">
          <span className="font-bold text-blue-400 block uppercase text-[10px] tracking-wider">
            1. Raw Residual Error
          </span>
          <div className="font-mono text-cyan-300 text-sm py-1">
            Error = Actual - Predicted
          </div>
          <p className="text-slate-400">
            Measures directional bias. Positive error means the model under-predicted; negative means over-predicted.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 text-xs space-y-1">
          <span className="font-bold text-amber-400 block uppercase text-[10px] tracking-wider">
            2. Absolute Error
          </span>
          <div className="font-mono text-amber-300 text-sm py-1">
            Absolute Error = |Actual - Predicted|
          </div>
          <p className="text-slate-400">
            Measures linear distance without sign. Averaged across folds to yield MAE.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 text-xs space-y-1">
          <span className="font-bold text-rose-400 block uppercase text-[10px] tracking-wider">
            3. Squared Error
          </span>
          <div className="font-mono text-rose-300 text-sm py-1">
            Squared Error = (Actual - Predicted)²
          </div>
          <p className="text-slate-400">
            Penalizes large deviations quadratically. Averaged and square-rooted to compute RMSE.
          </p>
        </div>
      </div>
    </div>
  );
};

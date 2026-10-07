'use client';

import React, { useState } from 'react';
import { useActiveDataset } from '@/context/ActiveDatasetContext';
import { StatCard } from '@/components/ui/StatCard';
import { ExplanationCard } from '@/components/ui/ExplanationCard';
import { PredictionMetadataBadge } from '@/components/ui/PredictionMetadataBadge';
import { Badge } from '@/components/ui/Badge';
import {
  TrendingUp,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  Calendar,
  Layers,
  ShieldAlert,
  Info,
  Clock,
  CheckCircle2
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
  Area,
  ComposedChart,
  ReferenceArea,
  ReferenceLine
} from 'recharts';

export const FinalForecastView: React.FC = () => {
  const { yearlyCompute, forecasts, projectInfo, activeDataset, isDefault, forecastHorizon, setForecastHorizon } = useActiveDataset();
  const [showIntervals, setShowIntervals] = useState(true);
  const [showAlternativeModels, setShowAlternativeModels] = useState(false);

  // Combine historical observations with future forecasts
  const chartData = [
    ...yearlyCompute
      .filter((d) => d.medianLog10 !== null)
      .map((d) => ({
        year: d.year,
        actual: d.medianLog10,
        linearFit: d.linearFit,
        piLower: null,
        piUpper: null,
        arima: null,
        holt: null,
        isForecast: false,
        isPartial: d.isPartial
      })),
    ...forecasts.map((f) => ({
      year: f.year,
      actual: null,
      linearFit: f.linearLog10,
      piLower: f.piLowerLog10,
      piUpper: f.piUpperLog10,
      arima: f.arima010Log10,
      holt: f.holtLog10,
      isForecast: true,
      isPartial: false
    }))
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-md">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Final Long-Range Forecast ({projectInfo.dataset.forecastPeriod}) with 95% Prediction Intervals
          </h2>
          <Badge variant="success">Primary Linear OLS Model</Badge>
          <Badge variant={isDefault ? 'warning' : 'purple'}>
            {isDefault ? '2026: Partial Snapshot' : `Active Dataset: ${activeDataset.filename}`}
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-slate-300">
          Statistical extrapolation of annual aggregate median AI compute based on historical dynamics from {projectInfo.dataset.modelingPeriod}.
        </p>
      </div>

      {/* Critical Active Dataset Label */}
      <PredictionMetadataBadge />

      {/* Dedicated Forecast Result Card (Required by Specification) */}
      <div className="p-5 sm:p-6 rounded-2xl border-2 border-emerald-500/40 bg-slate-900/95 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 size={18} />
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">
                FORECAST RESULT
              </h3>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-x-4 gap-y-1">
              <span>Dataset: <strong className="text-cyan-300 font-mono">{activeDataset.filename}</strong></span>
              <span>Model: <strong className="text-white">Linear Trend (OLS)</strong></span>
              <span>Forecast horizon: <strong className="text-emerald-400">{forecastHorizon} years</strong></span>
            </div>
          </div>

          {/* Horizon Toggle */}
          <div className="flex items-center gap-1.5 text-xs bg-slate-950 p-1 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 px-2 font-mono">Horizon:</span>
            {[2, 3, 4, 5, 8].map((h) => (
              <button
                key={h}
                onClick={() => setForecastHorizon(h)}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  forecastHorizon === h ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {h}y
              </button>
            ))}
          </div>
        </div>

        {/* Prediction Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Forecast Year</th>
                <th className="py-2.5 px-4 font-semibold text-cyan-300">Predicted log₁₀(FLOP)</th>
                <th className="py-2.5 px-4 font-semibold text-emerald-400">Predicted FLOPs</th>
                <th className="py-2.5 px-4 font-semibold text-slate-300">95% Prediction Interval (log₁₀)</th>
                <th className="py-2.5 px-4 font-semibold text-slate-300">95% Prediction Interval (FLOP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {forecasts.map((f) => (
                <tr key={f.year} className="hover:bg-slate-800/30 transition">
                  <td className="py-2.5 px-4 font-bold text-white text-sm">{f.year}</td>
                  <td className="py-2.5 px-4 text-cyan-300 font-bold">{f.linearLog10.toFixed(4)}</td>
                  <td className="py-2.5 px-4 text-emerald-400 font-bold text-sm">{f.linearFLOPStr}</td>
                  <td className="py-2.5 px-4 text-slate-300">
                    [{f.piLowerLog10.toFixed(4)}, {f.piUpperLog10.toFixed(4)}]
                  </td>
                  <td className="py-2.5 px-4 text-slate-400 text-[11px]">
                    {f.piLowerFLOPStr} to {f.piUpperFLOPStr}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Prominent Large Warning Banner */}
      <div className="p-5 sm:p-6 rounded-2xl border-2 border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 shadow-xl space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm sm:text-base">
          <ShieldAlert size={22} className="shrink-0" />
          <span>IMPORTANT STATISTICAL DISCLAIMER</span>
        </div>
        <div className="text-lg sm:text-xl font-bold text-white">
          &ldquo;These are model-based statistical forecasts, not guaranteed future values.&rdquo;
        </div>
        <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
          &ldquo;We predict the annual aggregate compute trend of notable AI models, not the exact compute of a specific future GPT model.&rdquo; Long-range extrapolations assume unbroken capital scaling, semiconductor fabrication access, and grid power availability.
        </p>
      </div>

      {/* Forecast Point Estimates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {forecasts.map((f) => (
          <div
            key={f.year}
            className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-white text-base">Year {f.year}</span>
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold font-mono">
                  {f.linearLog10.toFixed(2)} log₁₀
                </span>
              </div>

              <div className="my-2">
                <span className="text-xs text-slate-400 block mb-0.5">Point Forecast (FLOP):</span>
                <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
                  {f.linearFLOPStr}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
              <span className="font-semibold text-slate-300 block">95% Prediction Interval:</span>
              <div className="font-mono text-cyan-300 text-xs">
                [{f.piLowerLog10.toFixed(2)}, {f.piUpperLog10.toFixed(2)}] log₁₀
              </div>
              <div className="font-mono text-slate-400 text-[10px]">
                {f.piLowerFLOPStr} to {f.piUpperFLOPStr}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Interactive Forecast Chart */}
      <div className="p-5 sm:p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Historical Observations (2010–2026) & Forecasts (2027–2030)
            </h3>
            <p className="text-xs text-slate-400">
              Selected Linear Trend: Ŷ = -1156.0523 + 0.5828 × Year with 95% analytical prediction intervals.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setShowIntervals(!showIntervals)}
              className={`px-3 py-1 rounded font-medium transition ${
                showIntervals ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              95% Uncertainty Interval
            </button>
            <button
              onClick={() => setShowAlternativeModels(!showAlternativeModels)}
              className={`px-3 py-1 rounded font-medium transition ${
                showAlternativeModels ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Alternative Models (ARIMA/Holt)
            </button>
          </div>
        </div>

        <div className="h-80 sm:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 15, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis domain={[14, 30]} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                formatter={(val: any, name: any) => {
                  const num = typeof val === 'number' ? val.toFixed(2) : val;
                  if (name === 'actual') return [`${num} log₁₀ FLOP`, 'Historical Actual'];
                  if (name === 'linearFit') return [`${num} log₁₀ FLOP`, 'Primary Linear Forecast'];
                  if (name === 'piUpper') return [`${num} log₁₀ FLOP`, '95% Upper Bound'];
                  if (name === 'piLower') return [`${num} log₁₀ FLOP`, '95% Lower Bound'];
                  if (name === 'arima') return [`${num} log₁₀ FLOP`, 'ARIMA(0,1,0)+drift'];
                  if (name === 'holt') return [`${num} log₁₀ FLOP`, 'Holt Linear'];
                  return [num, name];
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />

              {/* Shaded Forecast Zone */}
              <ReferenceArea
                x1={2026.5}
                x2={2030}
                fill="#3b82f6"
                fillOpacity={0.05}
                stroke="#3b82f6"
                strokeDasharray="4 4"
              />

              {/* 2026 Partial Mark */}
              <ReferenceLine
                x={2026}
                stroke="#f59e0b"
                strokeDasharray="3 3"
                label={{ value: '2026 PARTIAL', position: 'top', fill: '#f59e0b', fontSize: 10 }}
              />

              {/* 95% Interval Lines */}
              {showIntervals && (
                <>
                  <Line
                    type="monotone"
                    dataKey="piUpper"
                    name="95% Prediction Interval Upper Bound"
                    stroke="#06b6d4"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="piLower"
                    name="95% Prediction Interval Lower Bound"
                    stroke="#06b6d4"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    dot={false}
                  />
                </>
              )}

              {/* Primary Linear Forecast Line */}
              <Line
                type="monotone"
                dataKey="linearFit"
                name="Primary Linear Forecast (OLS)"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4, fill: '#10b981' }}
              />

              {/* Historical actual observations */}
              <Line
                type="monotone"
                dataKey="actual"
                name="Historical Actual Y_t (2010–2026)"
                stroke="#38bdf8"
                strokeWidth={3}
                dot={{ r: 5, fill: '#38bdf8' }}
              />

              {/* Alternative models */}
              {showAlternativeModels && (
                <>
                  <Line
                    type="monotone"
                    dataKey="arima"
                    name="ARIMA(0,1,0)+drift (2027–2030)"
                    stroke="#a855f7"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="holt"
                    name="Holt Linear (2027–2030)"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="2 2"
                    dot={false}
                  />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
          <span>• 2026 status: <strong className="text-amber-400">PARTIAL YEAR</strong> (7 models through 2026-09-21)</span>
          <span>• 2030 point estimate: <strong className="text-emerald-400">9.57 × 10²⁶ FLOP</strong> (26.98 log₁₀)</span>
          <span>• 2030 95% PI span: <strong className="text-cyan-400">1.11 × 10²⁵ to 8.24 × 10²⁸ FLOP</strong></span>
        </div>
      </div>

      {/* Deep-dive Explanation of Uncertainty */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ExplanationCard
          title="Why do Prediction Intervals expand over time?"
          type="info"
          badge="Econometric Formula"
        >
          <p>
            The analytical prediction error variance expands with forecast distance <code className="text-cyan-300">(X_h - X̄)²</code>:
          </p>
          <div className="p-2.5 rounded bg-slate-950 font-mono text-cyan-300 text-xs my-1 text-center">
            s_pred = s_e · √[1 + 1/n + (X_h - X̄)² / Σ(X_i - X̄)²]
          </div>
          <p className="text-xs text-slate-300">
            Because 2030 is 12.5 years away from the sample mean year (<code className="text-white">X̄ = 2017.5</code>), uncertainty grows quadratically. By 2030, the 95% interval spans 3.87 orders of magnitude (a 7,400× multiplicative range).
          </p>
        </ExplanationCard>

        <ExplanationCard
          title="Physical Realities: What could slow compute growth?"
          type="warning"
          badge="Real-World Limits"
        >
          <p className="text-xs text-slate-300 leading-relaxed">
            Reaching 10²⁷ FLOP in 2030 would require gigawatt-scale datacenters, multi-billion-dollar energy contracts, and next-generation packaging. Physical bottlenecks include:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 mt-1">
            <li><strong>Electrical Grid Constraints:</strong> Substation transformer backlogs.</li>
            <li><strong>Capital Expenditure Caps:</strong> Cluster training costs exceeding $1B.</li>
            <li><strong>Algorithmic Efficiency Gains:</strong> Distillation and test-time compute.</li>
          </ul>
        </ExplanationCard>
      </div>
    </div>
  );
};

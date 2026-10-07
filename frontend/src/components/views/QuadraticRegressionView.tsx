'use client';

import React from 'react';
import { useActiveDataset } from '@/context/ActiveDatasetContext';
import { StatCard } from '@/components/ui/StatCard';
import { ExplanationCard } from '@/components/ui/ExplanationCard';
import { PredictionMetadataBadge } from '@/components/ui/PredictionMetadataBadge';
import { Badge } from '@/components/ui/Badge';
import {
  TrendingDown,
  AlertOctagon,
  Sparkles,
  Zap,
  Activity,
  History,
  XCircle
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
  ReferenceArea
} from 'recharts';

export const QuadraticRegressionView: React.FC = () => {
  const { projectInfo, yearlyCompute, forecasts, activeDataset, isDefault } = useActiveDataset();
  const { equation, intercept, beta1, beta2, r2, adjR2, rmseBacktest, forecast2030Log10, forecast2030FLOP, reasonRejected } =
    projectInfo.quadraticRegression;

  // Comparison data showing quadratic fit vs linear
  const comparisonData = [
    ...yearlyCompute
      .filter((d) => d.medianLog10 !== null)
      .map((d) => ({
        year: d.year,
        actual: d.medianLog10,
        linear: d.linearFit,
        quadratic: d.quadFit,
        isForecast: false
      })),
    ...forecasts.map((f) => ({
      year: f.year,
      actual: null,
      linear: f.linearLog10,
      quadratic: f.quadLog10,
      isForecast: true
    }))
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-md">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Quadratic Polynomial Regression Analysis ({activeDataset.filename})
          </h2>
          <Badge variant="danger">Evaluated & Rejected for Forecasting</Badge>
          <Badge variant="purple">Module X Syllabus</Badge>
        </div>
        <p className="text-xs sm:text-sm text-slate-300">
          In-sample curvature fitting versus out-of-sample instability and runaway extrapolation risks on {activeDataset.filename}.
        </p>
      </div>

      {/* Critical Active Dataset Label */}
      <PredictionMetadataBadge />

      {/* Model Equation Banner */}
      <div className="p-6 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/30 via-slate-900 to-slate-900 shadow-lg text-center space-y-2">
        <span className="text-xs uppercase font-bold tracking-widest text-purple-400">
          Fitted Quadratic Polynomial Specification
        </span>
        <div className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight font-mono">
          Y_t = 15.9728 + 0.3052·t + 0.018502·t²
        </div>
        <p className="text-xs text-slate-400">
          Where <code className="text-cyan-300 font-mono">t = Year - 2010</code> (centered time index for numeric stability).
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Training R²"
          value="0.9550"
          subtitle="Highest in-sample fit"
          icon={Sparkles}
          badge="In-Sample"
          badgeColor="purple"
        />
        <StatCard
          title="Adjusted R²"
          value="0.9481"
          subtitle="Adjusted for 2 parameters"
          icon={Activity}
          badgeColor="blue"
        />
        <StatCard
          title="Backtest RMSE"
          value="1.2088"
          subtitle="Worst generalization error"
          icon={AlertOctagon}
          badge="High Error"
          badgeColor="red"
        />
        <StatCard
          title="2030 Projection"
          value="3.01 × 10²⁹"
          subtitle="29.48 log₁₀ FLOP (Explosive)"
          icon={Zap}
          badge="Physically Implausible"
          badgeColor="red"
        />
      </div>

      {/* Linear vs Quadratic Comparison Chart (2010–2030) */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-md">
        <div className="mb-4">
          <h3 className="text-base font-bold text-white">
            Linear Trend vs. Quadratic Acceleration (2010–2030)
          </h3>
          <p className="text-xs text-slate-400">
            Notice how the quadratic curve bends upward after 2024, diverging wildly from the linear projection by 2030.
          </p>
        </div>

        <div className="h-80 sm:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={comparisonData} margin={{ top: 15, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis domain={[14, 30]} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                formatter={(val: any, name: any) => {
                  const num = typeof val === 'number' ? val.toFixed(2) : val;
                  if (name === 'actual') return [`${num} log₁₀ FLOP`, 'Historical Actual'];
                  if (name === 'linear') return [`${num} log₁₀ FLOP`, 'Linear Trend (Selected)'];
                  if (name === 'quadratic') return [`${num} log₁₀ FLOP`, 'Quadratic Extrapolation (Explosive)'];
                  return [num, name];
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />

              {/* Shaded Forecast Horizon */}
              <ReferenceArea
                x1={2026}
                x2={2030}
                fill="#8b5cf6"
                fillOpacity={0.06}
                stroke="#8b5cf6"
                strokeDasharray="4 4"
              />

              <Line
                type="monotone"
                dataKey="actual"
                name="Historical Actual Y_t"
                stroke="#38bdf8"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="linear"
                name="Linear Trend (Selected OLS)"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="quadratic"
                name="Quadratic Polynomial Fit"
                stroke="#f43f5e"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
          <span>• 2030 Linear: <strong className="text-emerald-400">26.98 log₁₀</strong> (9.57 × 10²⁶ FLOP)</span>
          <span>• 2030 Quadratic: <strong className="text-rose-400">29.48 log₁₀</strong> (3.01 × 10²⁹ FLOP — 315× higher!)</span>
        </div>
      </div>

      {/* Detailed Technical Justification for Rejection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ExplanationCard
          title="Why Polynomial Fitting Misleads on Small Time Series"
          type="warning"
          badge="Overfitting Risk"
        >
          <p className="text-white font-medium">
            &ldquo;Polynomial regression can fit curvature, but long-range extrapolation can become unstable.&rdquo;
          </p>
          <p className="mt-2 text-xs text-slate-300 leading-relaxed">
            In an N=16 sample, adding a quadratic term <code className="text-purple-300">β₂·t²</code> fits minor recent wiggles in training data. However, out-of-sample backtesting showed that quadratic extrapolation produced the highest prediction errors whenever the growth rate adjusted.
          </p>
        </ExplanationCard>

        <div className="p-5 rounded-2xl border border-rose-500/30 bg-rose-950/20 shadow-md space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <XCircle size={18} />
            <span>Three Decisive Reasons for Rejection</span>
          </div>

          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="font-bold text-rose-400 font-mono">1.</span>
              <span><strong>Worst Backtest RMSE:</strong> 1.2088 vs 0.8900 for Linear (a 35.8% worse generalization performance).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-rose-400 font-mono">2.</span>
              <span><strong>Severe 2026 Snapshot Overshoot:</strong> Overestimated partial 2026 by -0.9577 dex (nearly a 10× overestimation).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-rose-400 font-mono">3.</span>
              <span><strong>Physical Impossibility:</strong> Projecting 3.01 × 10²⁹ FLOP by 2030 would consume terawatts of global power, violating basic thermodynamic and economic constraints.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import { useActiveDataset } from '@/context/ActiveDatasetContext';
import { StatCard } from '@/components/ui/StatCard';
import { ExplanationCard } from '@/components/ui/ExplanationCard';
import { PredictionMetadataBadge } from '@/components/ui/PredictionMetadataBadge';
import { Badge } from '@/components/ui/Badge';
import {
  CalendarRange,
  Layers,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  XCircle
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';

export const MonthlyVsYearlyView: React.FC = () => {
  const { frequencyAnalysis, activeDataset, isDefault } = useActiveDataset();

  // Pie chart data for monthly sparsity
  const monthlyPieData = [
    { name: 'Empty / Sparse Periods', value: frequencyAnalysis.missingPeriods || 1, color: '#f43f5e' },
    { name: 'Observed Periods', value: frequencyAnalysis.observedPeriods || 1, color: '#10b981' }
  ];

  // Frequency Comparison Matrix
  const comparisonMatrix = [
    { metric: 'Total Potential Time Periods', monthly: isDefault ? '915 months (1950–2026)' : 'Higher density monthly grid', yearly: `${frequencyAnalysis.totalPeriods} total observed span periods` },
    { metric: 'Missing / Empty Periods', monthly: isDefault ? '722 months (78.91% missing)' : `${frequencyAnalysis.missingPeriods} sparse intervals`, yearly: 'Unbroken contiguous annual sequence' },
    { metric: 'Median Models per Period', monthly: isDefault ? '2.0 models / observed month' : 'Low intra-period sample size', yearly: `${frequencyAnalysis.medianModelsPerPeriod} models / annual period` },
    { metric: 'Series Continuity', monthly: 'Subject to clustered releases and publication lags', yearly: 'Strictly continuous and equispaced' },
    { metric: 'ARMA / ARIMA Suitability', monthly: 'Irregular gaps compromise lag structure', yearly: 'Well-suited for classical Box-Jenkins differencing' },
    { metric: 'Noise vs Signal Ratio', monthly: 'Substantial monthly disclosure variance', yearly: 'Smooth macro compute scaling trajectory' }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-md">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Time-Series Frequency Evaluation: Monthly vs. Yearly ({activeDataset.filename})
          </h2>
          <Badge variant="success">Core Methodological Decision</Badge>
        </div>
        <p className="text-xs sm:text-sm text-slate-300">
          Comparative empirical audit of sampling intervals to justify the selection of annual aggregation over monthly periodicity on {activeDataset.filename}.
        </p>
      </div>

      {/* Critical Active Dataset Label */}
      <PredictionMetadataBadge />

      {/* Prominent Decision Callout */}
      <div className="p-6 rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-blue-950/40 text-center shadow-lg">
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold block mb-1">
          Audited Methodological Decision
        </span>
        <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          PRIMARY TIME-SERIES FREQUENCY: {activeDataset.primaryFrequency.toUpperCase()}
        </h3>
        <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
          &ldquo;{frequencyAnalysis.reason}&rdquo;
        </p>
      </div>

      {/* Two Comparison Cards Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly Card */}
        <div className="p-5 rounded-2xl border border-rose-500/30 bg-rose-950/10 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
                <XCircle size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">Monthly Frequency</h3>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
              REJECTED FOR MODELING
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400 block">Total Calendar Months:</span>
              <span className="text-white font-mono font-bold text-base">915</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400 block">Observed Months:</span>
              <span className="text-emerald-400 font-mono font-bold text-base">193</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400 block">Empty Months (0 models):</span>
              <span className="text-rose-400 font-mono font-bold text-base">722</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400 block">Missing Periods %:</span>
              <span className="text-rose-400 font-mono font-bold text-base">78.91%</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <strong className="text-rose-300 block mb-1">Why Monthly Fails:</strong>
            With nearly 80% of calendar months completely devoid of notable AI releases, calculating lag autocorrelations (<code className="text-cyan-300">Y_(t-1)</code>) or fitting ARMA models introduces massive interpolation artifacts and artificial volatility.
          </div>
        </div>

        {/* Yearly Card */}
        <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                <CheckCircle size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">Yearly Frequency</h3>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              SELECTED PRIMARY
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400 block">Modeling Window:</span>
              <span className="text-white font-mono font-bold text-base">2010–2025</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400 block">Continuous Observations:</span>
              <span className="text-emerald-400 font-mono font-bold text-base">16 Years</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400 block">Missing Years in Horizon:</span>
              <span className="text-emerald-400 font-mono font-bold text-base">0 (0.0%)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400 block">Median Density per Year:</span>
              <span className="text-cyan-400 font-mono font-bold text-base">52.5 models</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <strong className="text-emerald-300 block mb-1">Why Yearly Succeeds:</strong>
            Annual aggregation produces an unbroken, equispaced sequence with zero missing data from 2010 to 2025. Computing the annual median provides a stable, statistically defensible measure of macro compute expansion.
          </div>
        </div>
      </div>

      {/* Visual Chart & Comparison Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart of Monthly Sparsity */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 shadow-md">
          <h3 className="text-sm font-bold text-white mb-1">
            Monthly Sparsity Distribution (915 Months)
          </h3>
          <p className="text-xs text-slate-400 mb-3">
            78.91% empty calendar months vs 21.09% observed months.
          </p>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={monthlyPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {monthlyPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                Empty Months (0 models)
              </span>
              <strong className="font-mono text-rose-400">722 (78.91%)</strong>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Observed Months (≥1)
              </span>
              <strong className="font-mono text-emerald-400">193 (21.09%)</strong>
            </div>
          </div>
        </div>

        {/* Detailed Comparison Table */}
        <div className="lg:col-span-2 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/90 shadow-md">
          <div className="p-4 border-b border-slate-800 bg-slate-950/60">
            <h3 className="text-sm font-bold text-white">
              Sparsity & Econometric Evaluation Matrix
            </h3>
          </div>
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold uppercase text-[11px]">
                <th className="py-2.5 px-4">Evaluation Criterion</th>
                <th className="py-2.5 px-3 text-rose-300">Monthly Frequency</th>
                <th className="py-2.5 px-3 text-emerald-300">Yearly Frequency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {comparisonMatrix.map((row, i) => (
                <tr key={i} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-4 font-semibold text-white">
                    {row.metric}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">
                    {row.monthly}
                  </td>
                  <td className="py-2.5 px-3 text-emerald-300 font-medium">
                    {row.yearly}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

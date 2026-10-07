'use client';

import React, { useState } from 'react';
import { useActiveDataset } from '@/context/ActiveDatasetContext';
import { StatCard } from '@/components/ui/StatCard';
import { ExplanationCard } from '@/components/ui/ExplanationCard';
import { PredictionMetadataBadge } from '@/components/ui/PredictionMetadataBadge';
import { Badge } from '@/components/ui/Badge';
import {
  GitCompare,
  TrendingUp,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Line,
  ComposedChart
} from 'recharts';

export const CorrelationView: React.FC = () => {
  const { projectInfo, yearlyCompute, activeDataset, isDefault } = useActiveDataset();
  const { pearsonR, pearsonPValue, spearmanRho, spearmanPValue } = projectInfo.correlation;

  // Filter observations for scatter
  const scatterData = yearlyCompute
    .filter((d) => d.medianLog10 !== null)
    .map((d) => ({
      year: d.year,
      actual: d.medianLog10,
      linearFit: d.linearFit
    }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-md">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Correlation Analysis: Pearson & Spearman ({activeDataset.filename})
          </h2>
          <Badge variant="purple">Module IX Syllabus</Badge>
        </div>
        <p className="text-xs sm:text-sm text-slate-300">
          Quantifying the linear and monotonic strength between calendar year (X) and annual median log₁₀ compute (Y) on {activeDataset.filename}.
        </p>
      </div>

      {/* Critical Active Dataset Label */}
      <PredictionMetadataBadge />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Pearson Correlation (r)"
          value={pearsonR.toFixed(4)}
          subtitle="Linear product-moment correlation"
          icon={GitCompare}
          badge="r = 0.9691"
          badgeColor="green"
        />
        <StatCard
          title="Pearson p-value"
          value="6.70 × 10⁻¹⁰"
          subtitle="Statistically indistinguishable from zero chance"
          icon={Sparkles}
          badge="p < 0.001"
          badgeColor="blue"
        />
        <StatCard
          title="Spearman Rank (ρ)"
          value={spearmanRho.toFixed(4)}
          subtitle="Non-parametric monotonic rank correlation"
          icon={TrendingUp}
          badge="ρ = 0.9706"
          badgeColor="purple"
        />
        <StatCard
          title="Spearman p-value"
          value="4.72 × 10⁻¹⁰"
          subtitle="Monotonic rank significance"
          icon={Sparkles}
          badge="p < 0.001"
          badgeColor="blue"
        />
      </div>

      {/* Scatter Plot with Fitted Trend Line */}
      <div className="p-5 sm:p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-md">
        <div className="mb-4">
          <h3 className="text-base sm:text-lg font-bold text-white">
            Scatter Plot with Ordinary Least Squares Trend Line (2010–2025)
          </h3>
          <p className="text-xs text-slate-400">
            X = Calendar Year, Y = Median log₁₀ Training Compute (FLOP). High clustering around the trend illustrates r = 0.9691.
          </p>
        </div>

        <div className="h-80 sm:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={scatterData} margin={{ top: 15, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="year"
                type="number"
                domain={[2009, 2026]}
                ticks={[2010, 2012, 2014, 2016, 2018, 2020, 2022, 2024]}
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
              />
              <YAxis
                domain={[15, 26]}
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                label={{
                  value: 'Median log₁₀(Compute FLOP)',
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#94a3b8',
                  fontSize: 12,
                  offset: 0
                }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                formatter={(val: any, name: any) => {
                  const num = typeof val === 'number' ? val.toFixed(4) : val;
                  if (name === 'actual') return [`${num} log₁₀ FLOP`, 'Observed Y_t'];
                  if (name === 'linearFit') return [`${num} log₁₀ FLOP`, 'OLS Trend Line'];
                  return [num, name];
                }}
                labelFormatter={(label) => `Year: ${label}`}
              />

              {/* OLS fitted line */}
              <Line
                type="monotone"
                dataKey="linearFit"
                name="Fitted Trend (r=0.9691)"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />

              {/* Observed points */}
              <Scatter
                name="Observed Median Y_t"
                dataKey="actual"
                fill="#38bdf8"
                stroke="#0f172a"
                strokeWidth={2}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Formula & Interpretation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Formula breakdown */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-md space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            Pearson Mathematical Formulation
          </span>
          <h4 className="text-lg font-bold text-white">
            Product-Moment Correlation Coefficient
          </h4>
          <div className="p-4 rounded-lg bg-slate-950 text-cyan-300 font-mono text-center text-sm border border-slate-800 overflow-x-auto">
            r = Σ[(x_i - x̄)(y_i - ȳ)] / √[ Σ(x_i - x̄)² · Σ(y_i - ȳ)² ]
          </div>
          <div className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
            <p>
              Pearson&apos;s r represents the sample covariance between calendar year <code className="text-blue-300">x</code> and median compute <code className="text-blue-300">y</code>, normalized by the product of their individual standard deviations.
            </p>
            <p className="font-mono text-emerald-400 pt-1">
              Sample size n = 16 | r = 0.9691 | t = 14.67 | p = 6.70 × 10⁻¹⁰
            </p>
          </div>
        </div>

        {/* How to Interpret r Card */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-md space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
            Interpretation Guide
          </span>
          <h4 className="text-lg font-bold text-white">
            How to Interpret Correlation Coefficient r
          </h4>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <span className="font-mono font-bold text-emerald-400">r ≈ +1.0</span>
              <span className="text-slate-300">Strong positive linear association (Our project: r = 0.9691)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <span className="font-mono font-bold text-slate-400">r ≈ 0.0</span>
              <span className="text-slate-400">Zero or no detectable linear association</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <span className="font-mono font-bold text-rose-400">r ≈ -1.0</span>
              <span className="text-slate-300">Strong negative (inverse) linear association</span>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Causation Caveat */}
      <ExplanationCard
        title="Critical Statistical Rule: Correlation Does Not Prove Causation"
        type="warning"
        badge="Academic Rigor"
      >
        <p className="text-white font-medium">
          &ldquo;Correlation does not prove causation.&rdquo;
        </p>
        <p className="mt-1 text-xs sm:text-sm text-slate-300 leading-relaxed">
          The extremely high correlation of <code className="text-amber-300">r = 0.9691</code> simply verifies that calendar time and median AI training compute grew in lockstep between 2010 and 2025. It does not imply that the passage of calendar years physically causes compute to expand; rather, calendar time serves as a proxy for the simultaneous confluence of massive capital investments, semiconductor innovations (GPU clustering), dataset collection, and algorithmic advances.
        </p>
      </ExplanationCard>
    </div>
  );
};

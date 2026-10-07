'use client';

import React, { useMemo } from 'react';
import { useActiveDataset } from '@/context/ActiveDatasetContext';
import { StatCard } from '@/components/ui/StatCard';
import { ExplanationCard } from '@/components/ui/ExplanationCard';
import { PredictionMetadataBadge } from '@/components/ui/PredictionMetadataBadge';
import { Badge } from '@/components/ui/Badge';
import {
  BarChart3,
  Scale,
  Binary,
  HelpCircle,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line
} from 'recharts';

export const DescriptiveStatsView: React.FC = () => {
  const { projectInfo, yearlyCompute, activeDataset, isDefault, models } = useActiveDataset();
  const { rawCompute, log10Compute } = projectInfo.descriptiveStats;

  // Log10 distribution bin counts dynamically computed from active models
  const logDistBins = useMemo(() => {
    const bins = [
      { bin: '<10 (Early Computing)', min: 0, max: 10, count: 0 },
      { bin: '10–15 (Pre-Deep Learning)', min: 10, max: 15, count: 0 },
      { bin: '15–18 (Early DL)', min: 15, max: 18, count: 0 },
      { bin: '18–21 (AlexNet Era)', min: 18, max: 21, count: 0 },
      { bin: '21–24 (Transformers)', min: 21, max: 24, count: 0 },
      { bin: '24–30 (Frontier Scaling)', min: 24, max: 35, count: 0 }
    ];
    models.forEach((m) => {
      if (m.log10Compute !== null) {
        for (const b of bins) {
          if (m.log10Compute >= b.min && m.log10Compute < b.max) {
            b.count++;
            break;
          }
        }
      }
    });
    return bins;
  }, [models]);

  // Yearly Mean vs Median comparison
  const yearlyMeanMedian = yearlyCompute
    .filter((d) => d.medianLog10 !== null)
    .map((d) => ({
      year: d.year,
      median: d.medianLog10,
      mean: d.meanLog10,
      std: d.stdLog10,
      count: d.validComputeCount
    }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-md">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Descriptive Statistics & Scale Transformation ({activeDataset.filename})
          </h2>
          <Badge variant="purple">Module I Syllabus</Badge>
        </div>
        <p className="text-xs sm:text-sm text-slate-300">
          Measures of central tendency, dispersion, and scale distribution for active dataset {activeDataset.filename}.
        </p>
      </div>

      {/* Critical Active Dataset Label */}
      <PredictionMetadataBadge />

      {/* Raw vs Log10 Comparison Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Raw FLOP Statistics */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Binary size={18} className="text-amber-400" />
              Raw Training Compute (FLOP)
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
              Astronomical Multiplicative Scale
            </span>
          </div>

          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Minimum:</span>
              <span className="font-mono text-white font-semibold">{rawCompute.minStr}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Maximum:</span>
              <span className="font-mono text-emerald-400 font-semibold">{rawCompute.maxStr}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Arithmetic Mean:</span>
              <span className="font-mono text-cyan-300 font-semibold">{rawCompute.meanStr}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Median:</span>
              <span className="font-mono text-purple-300 font-semibold">{rawCompute.medianStr}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Standard Deviation:</span>
              <span className="font-mono text-amber-300 font-semibold">{rawCompute.stdStr}</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 italic">
            Notice that the raw mean is 139,000× larger than the raw median, indicating hyper-extreme positive skewness driven by frontier supercomputers.
          </p>
        </div>

        {/* Transformed log10 FLOP Statistics */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Scale size={18} className="text-blue-400" />
              Transformed log₁₀ Training Compute
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30">
              Symmetric Additive Scale
            </span>
          </div>

          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Minimum:</span>
              <span className="font-mono text-white font-semibold">{log10Compute.min.toFixed(4)} dex</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Maximum:</span>
              <span className="font-mono text-emerald-400 font-semibold">{log10Compute.max.toFixed(4)} dex</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Arithmetic Mean:</span>
              <span className="font-mono text-cyan-300 font-semibold">{log10Compute.mean.toFixed(4)} dex</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Median:</span>
              <span className="font-mono text-purple-300 font-semibold">{log10Compute.median.toFixed(4)} dex</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Standard Deviation:</span>
              <span className="font-mono text-amber-300 font-semibold">{log10Compute.std.toFixed(4)} dex</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 italic">
            In log10 space, the mean (19.38) and median (19.69) are nearly identical, demonstrating strong central symmetry and variance stabilization.
          </p>
        </div>
      </div>

      {/* Visual Histogram of Log10 Compute */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 shadow-md">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white">
              Empirical Distribution of log₁₀ Compute (N = 540)
            </h3>
            <p className="text-xs text-slate-400">
              Histogram of models grouped into 3-dex order-of-magnitude bins.
            </p>
          </div>
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={logDistBins} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="bin"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  formatter={(val: any) => [`${val} AI Models`, 'Frequency']}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Model Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Yearly Mean vs Median */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 shadow-md">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white">
              Annual Mean vs. Median Trajectory (2010–2026)
            </h3>
            <p className="text-xs text-slate-400">
              Annual tracking showing close alignment between mean and median in log space.
            </p>
          </div>
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yearlyMeanMedian} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis domain={[14, 26]} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="median"
                  name="Annual Median log₁₀ (Y_t)"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="mean"
                  name="Annual Mean log₁₀"
                  stroke="#a855f7"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Formula & Classroom Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/90 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
            Formula Card
          </span>
          <h4 className="text-lg font-bold text-white">
            Logarithmic Transformation (Base 10)
          </h4>
          <div className="p-3 rounded-lg bg-slate-950 font-mono text-cyan-300 text-center text-base border border-slate-800">
            Y = log₁₀(Compute in FLOP)
          </div>
          <div className="p-3 rounded-lg bg-slate-950/70 text-xs text-slate-300 space-y-1">
            <strong className="text-amber-300 block">Classroom Calculation Example:</strong>
            <div className="flex items-center gap-2 font-mono text-slate-200">
              <span>10²⁴ FLOP</span>
              <ArrowRight size={14} className="text-slate-500" />
              <span>log₁₀(10²⁴)</span>
              <ArrowRight size={14} className="text-slate-500" />
              <span className="text-emerald-400 font-bold">24.0 dex</span>
            </div>
            <p className="text-slate-400 mt-1">
              An AI model trained using 1.0 × 10²⁴ FLOP is expressed simply as 24.0 in our time-series models.
            </p>
          </div>
        </div>

        <ExplanationCard
          title="Why do we use the Logarithm?"
          type="tip"
          badge="Statistical Justification"
        >
          <p className="text-white font-medium">
            &ldquo;Training compute spans many orders of magnitude, so log₁₀ transformation makes the scale easier to analyze statistically.&rdquo;
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs mt-2">
            <li><strong>Tames extreme right-skew:</strong> Prevents mega-clusters from dominating Ordinary Least Squares.</li>
            <li><strong>Converts exponential compounding into linearity:</strong> An exponential growth curve <code className="text-cyan-300">C_t = C_0 · (1 + g)^t</code> maps to a clean straight line in log coordinates.</li>
            <li><strong>Stabilizes variance:</strong> Homoscedasticity assumption of linear regression is reasonably satisfied.</li>
          </ul>
        </ExplanationCard>
      </div>
    </div>
  );
};

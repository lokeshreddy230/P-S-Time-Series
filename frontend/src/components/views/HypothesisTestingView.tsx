'use client';

import React, { useState } from 'react';
import { useActiveDataset } from '@/context/ActiveDatasetContext';
import { StatCard } from '@/components/ui/StatCard';
import { ExplanationCard } from '@/components/ui/ExplanationCard';
import { PredictionMetadataBadge } from '@/components/ui/PredictionMetadataBadge';
import { Badge } from '@/components/ui/Badge';
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Scale,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ErrorBar
} from 'recharts';

export const HypothesisTestingView: React.FC = () => {
  const { projectInfo, activeDataset, isDefault } = useActiveDataset();
  const [showExplanation, setShowExplanation] = useState(false);
  const { period1, period2, testType, tStat, df, pValue, alpha, decision, substantiveConclusion, observationalCaveat } =
    projectInfo.hypothesisTesting;

  const barData = [
    {
      period: period1.label,
      mean: period1.mean,
      std: period1.std,
      n: period1.n,
      label: 'Early Temporal Epoch'
    },
    {
      period: period2.label,
      mean: period2.mean,
      std: period2.std,
      n: period2.n,
      label: 'Later Temporal Epoch'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-md">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Hypothesis Testing: Welch&apos;s Two-Sample t-Test ({activeDataset.filename})
          </h2>
          <Badge variant="purple">Module VII Syllabus</Badge>
          <Badge variant={decision.includes('Reject') ? 'success' : 'warning'}>
            p = {typeof pValue === 'number' ? pValue.toExponential(3) : pValue} ({decision})
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-slate-300">
          Formal statistical testing of differences in mean training compute across two distinct historical epochs on {activeDataset.filename}.
        </p>
      </div>

      {/* Critical Active Dataset Label */}
      <PredictionMetadataBadge />

      {/* Hypotheses Formulation Banner */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-md">
        <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400 mb-3">
          Formal Statistical Hypothesis Formulation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-semibold block mb-1">
              Null Hypothesis (H₀)
            </span>
            <div className="text-xl font-mono text-cyan-300 font-bold mb-2">
              H₀: μ₁ = μ₂
            </div>
            <p className="text-xs text-slate-300">
              There is no difference in the true population mean log₁₀ compute between Period 1 (2010–2017) and Period 2 (2018–2025).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-semibold block mb-1">
              Alternative Hypothesis (H₁)
            </span>
            <div className="text-xl font-mono text-emerald-400 font-bold mb-2">
              H₁: μ₁ ≠ μ₂
            </div>
            <p className="text-xs text-slate-300">
              The true population mean log₁₀ compute is statistically different between the two periods (two-tailed test at α = 0.05).
            </p>
          </div>
        </div>
      </div>

      {/* Test Statistics Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Welch's t-Statistic"
          value={tStat.toFixed(4)}
          subtitle="Unequal variances accounted for"
          icon={Scale}
          badge="t = -4.8561"
          badgeColor="blue"
        />
        <StatCard
          title="Degrees of Freedom"
          value={df.toFixed(2)}
          subtitle="Welch–Satterthwaite equation"
          icon={HelpCircle}
          badge="df = 11.53"
          badgeColor="purple"
        />
        <StatCard
          title="p-value"
          value="0.00044"
          subtitle="p < 0.001 (Extremely Significant)"
          icon={Sparkles}
          badge="p = 0.00044"
          badgeColor="green"
        />
        <StatCard
          title="Decision at α = 0.05"
          value="Reject H₀"
          subtitle="Statistically significant shift"
          icon={CheckCircle2}
          badge="H₁ Accepted"
          badgeColor="green"
        />
      </div>

      {/* Visual Period Comparison Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-md">
          <h3 className="text-base font-bold text-white mb-1">
            Mean log₁₀ Training Compute by Period (± 1 Std Dev)
          </h3>
          <p className="text-xs text-slate-400 mb-3">
            Period 1 Mean: 17.50 log₁₀ FLOP vs Period 2 Mean: 21.89 log₁₀ FLOP (+4.39 dex).
          </p>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="period" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis domain={[12, 26]} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  formatter={(val: any) => [`${typeof val === 'number' ? val.toFixed(2) : val} log₁₀ FLOP`, 'Sample Mean']}
                />
                <Bar dataKey="mean" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Sample Mean (log10 FLOP)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Period Metrics Comparison Table */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-md space-y-4">
          <h3 className="text-base font-bold text-white">
            Sample Breakdown by Historical Period
          </h3>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between text-blue-400 font-bold mb-1">
                <span>Period 1: 2010–2017</span>
                <span>n₁ = 8 years</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-slate-300 font-mono text-xs mt-2">
                <div>Mean: <strong>17.5000</strong></div>
                <div>Std: <strong>1.9749</strong></div>
                <div>Var: <strong>3.9002</strong></div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between text-emerald-400 font-bold mb-1">
                <span>Period 2: 2018–2025</span>
                <span>n₂ = 8 years</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-slate-300 font-mono text-xs mt-2">
                <div>Mean: <strong>21.8920</strong></div>
                <div>Std: <strong>1.6508</strong></div>
                <div>Var: <strong>2.7252</strong></div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200">
              <strong>Difference in Means (Δμ):</strong> +4.3920 log₁₀ FLOP (~24,660× increase in compute).
            </div>
          </div>

          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition"
          >
            {showExplanation ? 'Hide Statistical Analysis Walkthrough' : 'Show Statistical Analysis Walkthrough'}
          </button>
        </div>
      </div>

      {/* Expandable Explanation Walkthrough */}
      {showExplanation && (
        <div className="p-5 rounded-2xl border border-blue-500/30 bg-blue-950/20 text-slate-200 text-xs sm:text-sm space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-blue-300 font-bold">
            <MessageSquare size={18} />
            <span>Statistical Interpretation & Inference Finding:</span>
          </div>
          <p className="leading-relaxed">
            Because the calculated t-statistic of <strong>-4.8561</strong> has an associated p-value of <strong>0.00044</strong>, which is far below our significance threshold α = 0.05, we reject the null hypothesis. The empirical data provides conclusive statistical evidence that the mean training compute in 2018–2025 is significantly greater than in 2010–2017.
          </p>
        </div>
      )}

      {/* Critical Observational Caveat Notice */}
      <ExplanationCard
        title="IMPORTANT METHODOLOGICAL CAVEAT: Observational Comparison"
        type="warning"
        badge="Causal Caveat"
      >
        <p className="text-white font-medium">
          &ldquo;This is an observational comparison between two time windows. It does not establish that any single technology caused the difference.&rdquo;
        </p>
        <p className="mt-1 text-xs text-slate-300 leading-relaxed">
          While the period 2018–2025 coincides with the rise of the Transformer architecture, it also coincides with massive datacenter capital expenditure, multi-billion-dollar GPU clusters (H100/B200), synthetic data scaling, and competitive commercial investments. The t-test confirms a statistically significant empirical shift, not a single-variable causal attribution.
        </p>
      </ExplanationCard>
    </div>
  );
};

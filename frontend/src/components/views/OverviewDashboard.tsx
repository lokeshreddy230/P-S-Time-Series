'use client';

import React, { useState } from 'react';
import { useActiveDataset } from '@/context/ActiveDatasetContext';
import { StatCard } from '@/components/ui/StatCard';
import { ExplanationCard } from '@/components/ui/ExplanationCard';
import { PredictionMetadataBadge } from '@/components/ui/PredictionMetadataBadge';
import { Badge } from '@/components/ui/Badge';
import {
  Database,
  CheckCircle,
  Cpu,
  Calendar,
  Layers,
  Clock,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Info
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

export const OverviewDashboard: React.FC = () => {
  const { yearlyCompute, projectInfo, activeDataset, isDefault } = useActiveDataset();
  const [showLinear, setShowLinear] = useState(true);
  const [showQuadratic, setShowQuadratic] = useState(false);

  // Filter yearly compute to valid points for primary chart
  const modernData = yearlyCompute
    .filter((d) => d.medianLog10 !== null)
    .map((d) => ({
      year: d.year,
      actualMedian: d.medianLog10,
      linearTrend: d.linearFit,
      quadTrend: d.quadFit,
      isPartial: d.isPartial,
      modelCount: d.validComputeCount,
      totalModels: d.totalModels,
      coveragePct: d.coveragePct
    }));

  return (
    <div className="space-y-6">
      {/* Top Title Banner */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 shadow-lg">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge variant="primary" size="sm">B.Tech Probability & Statistics</Badge>
          <Badge variant="purple" size="sm">Research Defense Portal</Badge>
          <Badge variant={isDefault ? 'warning' : 'success'} size="sm">
            {isDefault ? '2026: Partial Observation' : 'Active Custom Dataset'}
          </Badge>
        </div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
          {projectInfo.title}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-4xl leading-relaxed">
          {isDefault
            ? 'Empirical time-series modeling and rigorous statistical forecasting of aggregate frontier AI model training compute (FLOP) using the real-world Epoch AI repository (1950–2026).'
            : `Empirical time-series modeling and dynamic statistical forecasting calculated strictly on uploaded dataset [${activeDataset.filename}].`}
        </p>
      </div>

      {/* Critical Active Dataset Label */}
      <PredictionMetadataBadge />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total AI Models"
          value={activeDataset.rowsUsed.toLocaleString()}
          subtitle={isDefault ? 'Epoch AI dataset repository' : `Uploaded: ${activeDataset.filename}`}
          icon={Database}
          badge={isDefault ? 'Raw Data' : 'Uploaded'}
          badgeColor="blue"
        />
        <StatCard
          title="Valid Compute Records"
          value={activeDataset.validComputeRecords.toLocaleString()}
          subtitle={`${projectInfo.dataset.coverageComputePct}% empirical disclosure`}
          icon={CheckCircle}
          badge="Used for Y_t"
          badgeColor="green"
        />
        <StatCard
          title="Valid Parameters"
          value={projectInfo.dataset.validParamsCount.toLocaleString()}
          subtitle="Parameter disclosure"
          icon={Cpu}
          badgeColor="purple"
        />
        <StatCard
          title="Date Span"
          value={activeDataset.timeRange}
          subtitle={`${projectInfo.dataset.earliestDate} to ${projectInfo.dataset.latestDate}`}
          icon={Calendar}
          badge="Observed Range"
          badgeColor="blue"
        />
        <StatCard
          title="Primary Frequency"
          value={activeDataset.primaryFrequency}
          subtitle={isDefault ? 'Monthly 78.91% empty periods' : 'Aggregated median series'}
          icon={Layers}
          badge="Aggregation"
          badgeColor="green"
        />
        <StatCard
          title="Modeling Horizon"
          value={projectInfo.dataset.modelingPeriod}
          subtitle={`N = ${projectInfo.dataset.modelingYearsCount} complete observations`}
          icon={Clock}
          badge={`${projectInfo.dataset.modelingYearsCount} Years`}
          badgeColor="blue"
        />
        <StatCard
          title={isDefault ? '2026 Status' : 'Forecast Horizon'}
          value={isDefault ? 'Partial Year' : projectInfo.dataset.forecastPeriod}
          subtitle={isDefault ? '7 models through Sep 21, 2026' : 'Extrapolation target'}
          icon={AlertCircle}
          badge={isDefault ? 'Audit Test Only' : 'Future Horizon'}
          badgeColor="amber"
        />
        <StatCard
          title="Primary Target Y_t"
          value="median(log₁₀)"
          subtitle="Robust against outlier bias"
          icon={TrendingUp}
          badge="Syllabus Target"
          badgeColor="purple"
        />
      </div>

      {/* Main Interactive Chart Section */}
      <div className="p-5 sm:p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                Year vs. Annual Median log₁₀ Training Compute ({activeDataset.timeRange})
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                Primary Series
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Historical observations with fitted Ordinary Least Squares (OLS) linear trend and polynomial comparison.
            </p>
          </div>

          {/* Model Toggle Buttons */}
          <div className="flex items-center gap-2 text-xs bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setShowLinear(!showLinear)}
              className={`px-3 py-1 rounded font-medium transition ${
                showLinear
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Linear OLS (Selected)
            </button>
            <button
              onClick={() => setShowQuadratic(!showQuadratic)}
              className={`px-3 py-1 rounded font-medium transition ${
                showQuadratic
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Quadratic Curve
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="h-80 sm:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={modernData} margin={{ top: 15, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="year"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
              />
              <YAxis
                domain={[14, 26]}
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
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '12px'
                }}
                formatter={(value: any, name: any) => {
                  const val = typeof value === 'number' ? value.toFixed(4) : value;
                  if (name === 'actualMedian') return [`${val} log₁₀ FLOP (10^${val})`, 'Historical Median'];
                  if (name === 'linearTrend') return [`${val} log₁₀ FLOP`, 'Linear Trend Fit'];
                  if (name === 'quadTrend') return [`${val} log₁₀ FLOP`, 'Quadratic Fit'];
                  return [val, name];
                }}
                labelFormatter={(label) => `Year ${label} ${label === 2026 ? '(PARTIAL OBSERVATION)' : ''}`}
              />
              <Legend
                verticalAlign="top"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
              />

              {/* Shaded area for 2026 partial */}
              <ReferenceArea
                x1={2025.5}
                x2={2026}
                fill="#f59e0b"
                fillOpacity={0.08}
                stroke="#f59e0b"
                strokeDasharray="3 3"
              />

              {/* Actual historical observations */}
              <Line
                type="monotone"
                dataKey="actualMedian"
                name="Actual Annual Median (Y_t)"
                stroke="#38bdf8"
                strokeWidth={3}
                dot={{ r: 5, fill: '#38bdf8', strokeWidth: 2, stroke: '#0f172a' }}
                activeDot={{ r: 7 }}
              />

              {/* Linear trend */}
              {showLinear && (
                <Line
                  type="monotone"
                  dataKey="linearTrend"
                  name="Fitted Linear Trend (R²=0.9391)"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              )}

              {/* Quadratic trend */}
              {showQuadratic && (
                <Line
                  type="monotone"
                  dataKey="quadTrend"
                  name="Quadratic Polynomial Fit (R²=0.9550)"
                  stroke="#a855f7"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend notes */}
        <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
          <span>• 2010 median: <strong className="text-white">15.97 log₁₀</strong> (9.39 × 10¹⁵ FLOP)</span>
          <span>• 2025 median: <strong className="text-white">24.60 log₁₀</strong> (4.02 × 10²⁴ FLOP)</span>
          <span>• 2026 partial (Sep 21): <strong className="text-amber-400">24.64 log₁₀</strong> (7 models observed)</span>
        </div>
      </div>

      {/* Critical Academic Clarification Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ExplanationCard
          title="What are we predicting?"
          type="question"
          badge="Scope Definition"
        >
          <p className="font-medium text-white">
            We are predicting the <strong>annual median training compute</strong> of notable AI models in calendar year t (<code className="text-cyan-300">Y_t = median(log₁₀(FLOP))</code>).
          </p>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-amber-300 font-medium mt-2">
            CRITICAL DISTINCTION: We are <strong>NOT</strong> predicting the exact compute of a single future proprietary model (e.g. GPT-5 or Gemini 3). We forecast the macro aggregate historical trend of notable AI training compute.
          </div>
        </ExplanationCard>

        <ExplanationCard
          title="Why was Linear Trend selected over Quadratic & ARIMA?"
          type="tip"
          badge="Model Selection"
        >
          <p>
            Although Quadratic Regression has a slightly higher training R² (0.955 vs 0.939), it severely overfits and collapsed during 7-fold chronological backtesting (RMSE 1.2088 vs 0.8900 for Linear).
          </p>
          <p>
            Crucially, on the partial 2026 snapshot, our <strong>Linear Trend model achieved an error of only -0.0141 dex</strong> (predicted 24.6496 vs actual 24.6355), compared to -0.5856 for ARIMA and -0.9577 for Quadratic.
          </p>
        </ExplanationCard>
      </div>
    </div>
  );
};

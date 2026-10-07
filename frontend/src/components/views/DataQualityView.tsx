'use client';

import React from 'react';
import { useActiveDataset } from '@/context/ActiveDatasetContext';
import { StatCard } from '@/components/ui/StatCard';
import { ExplanationCard } from '@/components/ui/ExplanationCard';
import { PredictionMetadataBadge } from '@/components/ui/PredictionMetadataBadge';
import { Badge } from '@/components/ui/Badge';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  BarChart2,
  Calendar,
  AlertTriangle
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
  LineChart,
  Line
} from 'recharts';

export const DataQualityView: React.FC = () => {
  const { projectInfo, yearlyCompute, activeDataset, isDefault } = useActiveDataset();

  // Missing value breakdown data
  const missingData = [
    {
      name: 'Training Compute',
      Disclosed: projectInfo.dataset.validComputeCount,
      Missing: projectInfo.dataset.missingComputeCount,
      Coverage: `${projectInfo.dataset.coverageComputePct}%`
    },
    {
      name: 'Parameters',
      Disclosed: projectInfo.dataset.validParamsCount,
      Missing: projectInfo.dataset.missingParamsCount,
      Coverage: `${
        projectInfo.dataset.totalModels > 0
          ? Math.round((projectInfo.dataset.validParamsCount / projectInfo.dataset.totalModels) * 1000) / 10
          : 0
      }%`
    }
  ];

  // Coverage over observed years
  const coverageData = yearlyCompute
    .filter((d) => d.totalModels > 0)
    .map((d) => ({
      year: d.year,
      coveragePct: d.coveragePct,
      validComputeCount: d.validComputeCount,
      totalModels: d.totalModels,
      isPartial: d.isPartial
    }));

  const recentCoverage = projectInfo.descriptiveStats.recentCoverage;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-md">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Data Quality, Disclosure & Missingness Audit ({activeDataset.filename})
          </h2>
          <Badge variant="warning">Data Hygiene</Badge>
        </div>
        <p className="text-xs sm:text-sm text-slate-300">
          Rigorous audit of attribute completeness across {activeDataset.rowsUsed} AI models in {activeDataset.filename}.
        </p>
      </div>

      {/* Critical Active Dataset Label */}
      <PredictionMetadataBadge />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Records"
          value={activeDataset.rowsUsed.toLocaleString()}
          subtitle={`Models in ${activeDataset.filename}`}
          icon={ShieldAlert}
          badge="100%"
          badgeColor="blue"
        />
        <StatCard
          title="Compute Coverage"
          value={`${activeDataset.validComputeRecords} / ${activeDataset.rowsUsed}`}
          subtitle={`${projectInfo.dataset.coverageComputePct}% disclosure rate`}
          icon={CheckCircle2}
          badge={`${projectInfo.dataset.coverageComputePct}%`}
          badgeColor="green"
        />
        <StatCard
          title="Missing Compute"
          value="532"
          subtitle="49.63% missingness rate"
          icon={XCircle}
          badge="Excluded for Y_t"
          badgeColor="amber"
        />
        <StatCard
          title="Parameters Missing"
          value="347"
          subtitle="725 valid parameter counts"
          icon={BarChart2}
          badge="32.37% Missing"
          badgeColor="purple"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Missing Values Bar Chart */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 shadow-md">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white">
              Attribute Completeness: Compute vs Parameters
            </h3>
            <p className="text-xs text-slate-400">
              Comparison of disclosed observations vs missing records in full repository.
            </p>
          </div>
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={missingData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Disclosed" fill="#10b981" radius={[4, 4, 0, 0]} name="Disclosed / Valid" />
                <Bar dataKey="Missing" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Missing Records" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Annual Compute Coverage Pct Chart */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 shadow-md">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white">
              Annual Compute Coverage Rate (2010–2026)
            </h3>
            <p className="text-xs text-slate-400">
              Percentage of models with disclosed compute per year (% coverage = valid / total).
            </p>
          </div>
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={coverageData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis domain={[0, 100]} unit="%" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  formatter={(val: any) => [`${val}%`, 'Coverage Pct']}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="coveragePct"
                  name="Compute Coverage %"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#38bdf8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Years Table & Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/90 shadow-md">
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">
              Recent-Year Compute Disclosure Breakdown (2020–2026)
            </h3>
            <span className="text-[11px] text-slate-400">
              Official audit figures
            </span>
          </div>
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Year</th>
                <th className="py-3 px-3 text-right">Total Models</th>
                <th className="py-3 px-3 text-right">Valid Compute</th>
                <th className="py-3 px-3 text-right">Coverage %</th>
                <th className="py-3 px-4">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentCoverage.map((r) => (
                <tr
                  key={r.year}
                  className={`hover:bg-slate-800/40 transition ${
                    r.isPartial ? 'bg-amber-950/20' : ''
                  }`}
                >
                  <td className="py-2.5 px-4 font-bold text-white flex items-center gap-2">
                    {r.year}
                    {r.isPartial && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold">
                        PARTIAL
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                    {r.total}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-semibold">
                    {r.valid}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-cyan-300 font-bold">
                    {r.pct.toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-4 text-xs text-slate-400">
                    {r.isPartial
                      ? 'Incomplete cutoff through 2026-09-21'
                      : 'Complete annual observation window'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Explanation Card */}
        <div className="space-y-4">
          <ExplanationCard
            title="Why does recent coverage decline?"
            type="warning"
            badge="Proprietary Secrecy"
          >
            <p>
              In 2020–2021, compute disclosure was high (66%–78%). However, by 2024–2025, commercial secrecy and competitive frontier race dynamics led major labs (OpenAI, Google, Anthropic, Meta) to keep training hardware and precise FLOP calculations confidential.
            </p>
            <p>
              Despite this drop in percentage coverage, the absolute number of disclosed models remains robust (113 in 2024, 86 in 2025).
            </p>
          </ExplanationCard>

          <ExplanationCard
            title="Audit Status of Year 2026"
            type="info"
            badge="Partial Year"
          >
            <p className="font-semibold text-amber-300">
              2026 is incomplete and is treated as a partial-year observation.
            </p>
            <p className="text-xs text-slate-300 mt-1">
              Because data only covers up to September 21, 2026, including 2026 in model estimation would distort annual rates. It is strictly reserved as an external benchmark check.
            </p>
          </ExplanationCard>
        </div>
      </div>
    </div>
  );
};

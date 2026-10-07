'use client';

import React, { useState, useMemo } from 'react';
import { useActiveDataset } from '@/context/ActiveDatasetContext';
import { AIModel } from '@/data/projectData';
import { PredictionMetadataBadge } from '@/components/ui/PredictionMetadataBadge';
import {
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Cpu,
  Layers,
  Calendar,
  Building,
  Info,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { ExplanationCard } from '@/components/ui/ExplanationCard';

export const DatasetExplorer: React.FC = () => {
  const { models, activeDataset, isDefault } = useActiveDataset();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrg, setSelectedOrg] = useState('ALL');
  const [selectedYearFilter, setSelectedYearFilter] = useState('ALL');
  const [computeFilter, setComputeFilter] = useState<'ALL' | 'WITH_COMPUTE' | 'MISSING_COMPUTE'>('ALL');
  const [frontierFilter, setFrontierFilter] = useState<'ALL' | 'FRONTIER_ONLY'>('ALL');
  const [sortField, setSortField] = useState<'model' | 'publicationDate' | 'trainingComputeFLOP' | 'parameters'>('publicationDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedModelModal, setSelectedModelModal] = useState<AIModel | null>(null);

  const pageSize = 20;

  // Extract unique organizations for filter
  const organizations = useMemo(() => {
    const orgs = new Set<string>();
    models.forEach((m) => {
      if (m.organization && m.organization !== 'Unknown') {
        orgs.add(m.organization);
      }
    });
    return Array.from(orgs).sort();
  }, [models]);

  // Filter and sort models
  const filteredModels = useMemo(() => {
    return models
      .filter((m) => {
        // Search
        const query = searchTerm.toLowerCase();
        const matchesSearch =
          m.model.toLowerCase().includes(query) ||
          m.organization.toLowerCase().includes(query) ||
          m.domain.toLowerCase().includes(query) ||
          m.task.toLowerCase().includes(query);

        if (!matchesSearch) return false;

        // Org filter
        if (selectedOrg !== 'ALL' && m.organization !== selectedOrg) {
          return false;
        }

        // Year filter
        if (selectedYearFilter === 'MODERN' && (!m.year || m.year < 2010)) {
          return false;
        }
        if (selectedYearFilter === 'HISTORICAL' && (!m.year || m.year >= 2010)) {
          return false;
        }
        if (selectedYearFilter === '2026' && m.year !== 2026) {
          return false;
        }

        // Compute filter
        if (computeFilter === 'WITH_COMPUTE' && !m.hasCompute) return false;
        if (computeFilter === 'MISSING_COMPUTE' && m.hasCompute) return false;

        // Frontier filter
        if (frontierFilter === 'FRONTIER_ONLY' && !m.frontierModel) return false;

        return true;
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];

        if (valA === null || valA === undefined) valA = sortDirection === 'asc' ? Infinity : -Infinity;
        if (valB === null || valB === undefined) valB = sortDirection === 'asc' ? Infinity : -Infinity;

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [searchTerm, selectedOrg, selectedYearFilter, computeFilter, frontierFilter, sortField, sortDirection]);

  // Pagination slice
  const totalPages = Math.ceil(filteredModels.length / pageSize) || 1;
  const paginatedModels = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredModels.slice(start, start + pageSize);
  }, [filteredModels, currentPage]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {isDefault ? 'Notable AI Models Dataset Explorer' : `Dataset Explorer: ${activeDataset.filename}`}
            </h2>
            <Badge variant="primary">{activeDataset.rowsUsed.toLocaleString()} Total Records</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-300">
            {isDefault
              ? 'Interactive tabular inspection of the empirical Epoch AI dataset with filtering, sorting, and individual model specifications.'
              : `Tabular inspection of active uploaded dataset [${activeDataset.filename}] with live search, column sorting, and individual model compute inspection.`}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            {activeDataset.validComputeRecords.toLocaleString()} Disclosed Compute
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
            {(activeDataset.rowsUsed - activeDataset.validComputeRecords).toLocaleString()} Missing Compute
          </span>
        </div>
      </div>

      {/* Critical Active Dataset Label */}
      <PredictionMetadataBadge />

      {/* Critical Methodology Notice */}
      <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-950/20 text-xs sm:text-sm text-amber-200 flex items-start gap-2.5">
        <Info size={18} className="text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong>Statistical Notice on Missing Values:</strong> Models without reported training compute are retained in the overall exploratory table for full transparency, but are strictly excluded when computing the annual median log₁₀ compute (<code className="text-white">Y_t</code>).
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search bar */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search model, organization, task..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Org Filter */}
          <div>
            <select
              value={selectedOrg}
              onChange={(e) => {
                setSelectedOrg(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Organizations ({organizations.length})</option>
              {organizations.map((org) => (
                <option key={org} value={org}>
                  {org}
                </option>
              ))}
            </select>
          </div>

          {/* Era / Year Filter */}
          <div>
            <select
              value={selectedYearFilter}
              onChange={(e) => {
                setSelectedYearFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Years (1950–2026)</option>
              <option value="MODERN">Modern Modeling Era (2010+)</option>
              <option value="HISTORICAL">Historical Pre-2010</option>
              <option value="2026">2026 Partial Only</option>
            </select>
          </div>

          {/* Compute Availability */}
          <div>
            <select
              value={computeFilter}
              onChange={(e) => {
                setComputeFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Compute Status</option>
              <option value="WITH_COMPUTE">Valid Compute Only (540)</option>
              <option value="MISSING_COMPUTE">Missing Compute (532)</option>
            </select>
          </div>
        </div>

        {/* Second row filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={frontierFilter === 'FRONTIER_ONLY'}
                onChange={(e) => {
                  setFrontierFilter(e.target.checked ? 'FRONTIER_ONLY' : 'ALL');
                  setCurrentPage(1);
                }}
                className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0"
              />
              <span>Frontier Models Only</span>
            </label>
          </div>

          <div>
            Showing <strong className="text-white">{filteredModels.length}</strong> matching models (Page {currentPage} of {totalPages})
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/90 shadow-md">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
              <th
                onClick={() => handleSort('model')}
                className="py-3 px-4 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Model</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th className="py-3 px-3">Organization</th>
              <th
                onClick={() => handleSort('publicationDate')}
                className="py-3 px-3 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Date</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th
                onClick={() => handleSort('parameters')}
                className="py-3 px-3 text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Parameters</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th
                onClick={() => handleSort('trainingComputeFLOP')}
                className="py-3 px-3 text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Compute (FLOP)</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th className="py-3 px-3 text-right">log₁₀ FLOP</th>
              <th className="py-3 px-3 text-center">Frontier</th>
              <th className="py-3 px-3">Hardware</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {paginatedModels.map((m) => (
              <tr
                key={m.id}
                onClick={() => setSelectedModelModal(m)}
                className="hover:bg-slate-800/50 cursor-pointer transition-colors"
              >
                <td className="py-2.5 px-4 font-semibold text-white">
                  <div className="flex items-center gap-1.5">
                    <span className="hover:text-blue-400">{m.model}</span>
                    {m.year === 2026 && (
                      <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        2026 PARTIAL
                      </span>
                    )}
                  </div>
                </td>

                <td className="py-2.5 px-3 text-slate-300 max-w-[140px] truncate">
                  {m.organization}
                </td>

                <td className="py-2.5 px-3 text-slate-400 font-mono text-xs">
                  {m.publicationDate || (m.year ? `${m.year}` : 'Unknown')}
                </td>

                <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                  {m.parameters ? m.parametersStr : <span className="text-slate-600">—</span>}
                </td>

                <td className="py-2.5 px-3 text-right font-mono">
                  {m.trainingComputeFLOP ? (
                    <span className="text-emerald-400 font-semibold">{m.trainingComputeStr}</span>
                  ) : (
                    <span className="text-slate-600 italic">Not disclosed</span>
                  )}
                </td>

                <td className="py-2.5 px-3 text-right font-mono text-cyan-300">
                  {m.log10Compute !== null ? m.log10Compute.toFixed(2) : <span className="text-slate-600">—</span>}
                </td>

                <td className="py-2.5 px-3 text-center">
                  {m.frontierModel ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                      YES
                    </span>
                  ) : (
                    <span className="text-slate-600 text-xs">—</span>
                  )}
                </td>

                <td className="py-2.5 px-3 text-slate-400 text-xs max-w-[130px] truncate">
                  {m.trainingHardware !== 'Unknown' ? m.trainingHardware : <span className="text-slate-600">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div>
          Showing {paginatedModels.length} of {filteredModels.length} records
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
          >
            <ChevronLeft size={16} />
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Modal / Detail Drawer when a row is clicked */}
      {selectedModelModal && (
        <div
          onClick={() => setSelectedModelModal(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                  Model Specification
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  {selectedModelModal.model}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedModelModal.organization} • {selectedModelModal.publicationDate || 'Unknown Date'}
                </p>
              </div>
              <button
                onClick={() => setSelectedModelModal(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-0.5">Training Compute:</span>
                <span className="font-mono text-emerald-400 font-bold text-sm">
                  {selectedModelModal.trainingComputeStr}
                </span>
                {selectedModelModal.log10Compute && (
                  <span className="text-slate-400 block text-[11px] mt-0.5">
                    ({selectedModelModal.log10Compute.toFixed(3)} log₁₀ FLOP)
                  </span>
                )}
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-0.5">Parameters:</span>
                <span className="font-mono text-blue-400 font-bold text-sm">
                  {selectedModelModal.parametersStr}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-0.5">Frontier Status:</span>
                <span className="font-medium text-white">
                  {selectedModelModal.frontierModel ? 'Yes (Frontier AI Model)' : 'Standard Notable Model'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-0.5">Domain / Task:</span>
                <span className="font-medium text-white">
                  {selectedModelModal.domain} {selectedModelModal.task ? `(${selectedModelModal.task})` : ''}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
              <span className="text-slate-400 block mb-0.5">Training Hardware:</span>
              <span className="text-slate-200">
                {selectedModelModal.trainingHardware}
              </span>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedModelModal(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
              >
                Close Specification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

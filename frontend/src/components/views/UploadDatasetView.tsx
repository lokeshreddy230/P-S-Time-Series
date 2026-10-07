'use client';

import React, { useState, useRef } from 'react';
import { useActiveDataset } from '@/context/ActiveDatasetContext';
import {
  Upload,
  Database,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Play,
  FileText,
  Calendar,
  Layers,
  ArrowRight,
  Info,
  Clock,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { ExplanationCard } from '@/components/ui/ExplanationCard';

interface UploadDatasetViewProps {
  onNavigateToForecast?: () => void;
}

export const UploadDatasetView: React.FC<UploadDatasetViewProps> = ({ onNavigateToForecast }) => {
  const {
    activeDataset,
    isDefault,
    forecastHorizon,
    setForecastHorizon,
    previewRows,
    uploadCSV,
    loadSyntheticSample,
    loadEpochSubsetSample,
    resetToDefault,
    runPrediction
  } = useActiveDataset();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processSelectedFile(file);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processSelectedFile(file);
    }
  };

  const processSelectedFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadError('Please select a valid CSV file (.csv).');
      return;
    }
    setUploadError(null);
    setIsProcessing(true);
    const success = await uploadCSV(file);
    setIsProcessing(false);
    if (!success && activeDataset.errorMessage) {
      setUploadError(activeDataset.errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-md">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge variant="primary">Dataset Upload & Live Prediction Engine</Badge>
          <Badge variant={isDefault ? 'purple' : 'success'}>
            {isDefault ? 'Using Default Dataset' : 'Active: User Uploaded Dataset'}
          </Badge>
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
          True CSV Upload-Based Prediction Engine
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
          Upload any historical or custom AI model dataset to immediately compute a new aggregate time series, run chronological backtests, and extrapolate future training compute. When a custom CSV is uploaded, all default data is isolated and all dashboard predictions recalculate strictly from your file.
        </p>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`relative p-8 sm:p-10 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
          isDragOver
            ? 'border-blue-500 bg-blue-950/20 scale-[1.01]'
            : 'border-slate-700 bg-slate-900/50 hover:border-blue-400 hover:bg-slate-900/80'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="p-4 rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-500/20 mb-4">
          <Upload size={36} className="animate-bounce" />
        </div>

        <h3 className="text-base sm:text-lg font-bold text-white mb-1">
          Drag & Drop your CSV dataset here, or click to browse
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mb-4">
          Flexible column detection automatically identifies publication dates, training compute (FLOPs), model names, and parameter counts.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-500">
          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            Supports: <code>.csv</code>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            Auto-detects scientific notation (e.g. <code>1e24</code>, <code>2.5E+25</code>)
          </span>
          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            100% Client-Side / Edge Safe
          </span>
        </div>
      </div>

      {/* Quick Benchmark Preset Loaders */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sparkles size={14} className="text-amber-400" />
            Quick Benchmark Test CSVs (One-Click Verification)
          </h4>
          <span className="text-[11px] text-slate-500">Assignment Validation Protocols</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Preset 1 */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-white text-xs">
                  Test 1: 6-Row Synthetic Linear Test (2020–2025)
                </span>
                <Badge variant="purple" size="sm">Specification Test</Badge>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                6 test models from <code>Test-A</code> to <code>Test-F</code> ($10^{18}$ to $10^{23}$ FLOP). Produces exact unit slope ($+1.000$ dex/yr) and predictable future projections ($10^{24}$ to $10^{27}$ FLOP).
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                loadSyntheticSample();
              }}
              className="mt-2 w-full py-2 px-3 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Play size={13} />
              <span>Load Synthetic 6-Row CSV</span>
            </button>
          </div>

          {/* Preset 2 */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-white text-xs">
                  Test 2: Modern Frontier LLM Subset (2018–2025)
                </span>
                <Badge variant="warning" size="sm">Subset Test</Badge>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Empirical subset of modern era models. Changes row count, yearly series, and backtest errors relative to the full 1950–2026 repository.
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                loadEpochSubsetSample();
              }}
              className="mt-2 w-full py-2 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Play size={13} />
              <span>Load Modern Subset CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Message Card */}
      {(uploadError || activeDataset.errorMessage) && (
        <div className="p-5 rounded-2xl border-2 border-rose-500/40 bg-rose-950/30 text-rose-300 space-y-2">
          <div className="flex items-center gap-2 font-bold text-rose-400">
            <AlertTriangle size={18} />
            <span>Dataset Validation Error</span>
          </div>
          <div className="text-xs sm:text-sm whitespace-pre-line leading-relaxed font-mono">
            {uploadError || activeDataset.errorMessage}
          </div>
        </div>
      )}

      {/* Active Pipeline Status Banner */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                isDefault
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}
            >
              <Database size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Currently Active:
                </span>
                <span className="text-base sm:text-lg font-bold text-white font-mono">
                  {activeDataset.filename}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Source: <span className="text-white font-medium">{isDefault ? 'Default Epoch AI Repository' : 'User Uploaded CSV'}</span> • Size: {activeDataset.fileSizeStr}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => runPrediction()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition"
            >
              <Play size={14} />
              <span>Run Prediction</span>
            </button>

            {!isDefault && (
              <button
                onClick={resetToDefault}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-500/40 text-xs font-semibold transition"
              >
                <RotateCcw size={14} />
                <span>Reset to Default Dataset</span>
              </button>
            )}

            {onNavigateToForecast && (
              <button
                onClick={onNavigateToForecast}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition"
              >
                <span>View Forecast</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Live Active Dataset KPI Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <StatCard
            title="Total Models Used"
            value={activeDataset.rowsUsed.toLocaleString()}
            subtitle={`Filtered from ${activeDataset.filename}`}
            icon={Database}
            badge={isDefault ? 'Default' : 'Uploaded'}
            badgeColor={isDefault ? 'blue' : 'green'}
          />
          <StatCard
            title="Valid Compute Records"
            value={activeDataset.validComputeRecords.toLocaleString()}
            subtitle="Observations with positive FLOP"
            icon={CheckCircle2}
            badge="Used in Y_t"
            badgeColor="green"
          />
          <StatCard
            title="Chronological Range"
            value={activeDataset.timeRange}
            subtitle="Observed years span"
            icon={Calendar}
            badgeColor="blue"
          />
          <StatCard
            title="Primary Frequency"
            value={activeDataset.primaryFrequency}
            subtitle="Aggregation unit"
            icon={Layers}
            badge="Statistical Rule"
            badgeColor="purple"
          />
        </div>

        {/* Forecast Horizon Selector */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Clock size={14} className="text-blue-400" />
              Forecast Horizon: <strong className="text-emerald-400 font-mono">{forecastHorizon} Years</strong>
            </span>
            <p className="text-[11px] text-slate-400">
              Future projection horizon from latest observed year in active dataset.
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {[2, 3, 4, 5, 8, 10].map((h) => (
              <button
                key={h}
                onClick={() => setForecastHorizon(h)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  forecastHorizon === h
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {h} yrs
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dataset Preview (First 10 rows) */}
      {previewRows.length > 0 && (
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText size={16} className="text-blue-400" />
              Dataset Preview (First {previewRows.length} Rows of {activeDataset.filename})
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Total Rows: {activeDataset.rowsUsed}
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  {Object.keys(previewRows[0]).slice(0, 6).map((col) => (
                    <th key={col} className="py-2.5 px-3 truncate max-w-[150px]">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {previewRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition">
                    <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                    {Object.keys(previewRows[0]).slice(0, 6).map((col) => (
                      <td key={col} className="py-2 px-3 truncate max-w-[150px]">
                        {row[col] || <span className="text-slate-600">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Methodology & Academic Note */}
      <ExplanationCard
        title="Why Live Dataset Isolation Matters for Technical Defense"
        badge="Zero Leakage Protocol"
      >
        <p className="font-mono text-cyan-300 text-xs mb-2">
          ActiveDataset(D) ⟹ Ŷ_t = argmin_β ∑ (Y_i - Ŷ_i)²
        </p>
        <p>
          In rigorous statistical computing and university examination, the forecasting pipeline must be mathematically invariant to file substitution: uploading a new dataset should completely replace all intermediate sums of squares, correlations, and parameter estimates rather than superimposing them onto precomputed constants. This architecture guarantees genuine empirical reproducibility.
        </p>
      </ExplanationCard>
    </div>
  );
};

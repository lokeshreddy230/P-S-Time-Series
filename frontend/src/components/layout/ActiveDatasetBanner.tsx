'use client';

import React, { useState } from 'react';
import { useActiveDataset } from '@/context/ActiveDatasetContext';
import {
  Database,
  Upload,
  RotateCcw,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';

interface ActiveDatasetBannerProps {
  onOpenUpload: () => void;
}

export const ActiveDatasetBanner: React.FC<ActiveDatasetBannerProps> = ({ onOpenUpload }) => {
  const {
    activeDataset,
    isDefault,
    resetToDefault,
    runPrediction,
    loadSyntheticSample,
    loadEpochSubsetSample
  } = useActiveDataset();

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleConfirmReset = () => {
    resetToDefault();
    setIsResetConfirmOpen(false);
  };

  return (
    <>
      <div
        className={`w-full border-b transition-colors ${
          isDefault
            ? 'bg-slate-900/90 border-slate-800'
            : 'bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border-emerald-500/40 shadow-lg'
        } px-4 lg:px-8 py-3`}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Active Dataset Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`p-2 rounded-xl shrink-0 ${
                isDefault
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse'
              }`}
            >
              <Database size={20} />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Active Dataset:
                </span>
                <span className="font-mono text-sm sm:text-base font-bold text-white truncate">
                  {activeDataset.filename}
                </span>

                {/* Source Badge */}
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                    isDefault
                      ? 'bg-slate-800 text-slate-300 border-slate-700'
                      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  {isDefault ? 'Default Epoch AI Repository' : 'User Uploaded Dataset'}
                </span>

                {/* Status Badge */}
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                    activeDataset.status === 'valid'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : activeDataset.status === 'invalid'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {activeDataset.status === 'valid' ? (
                    <>
                      <CheckCircle2 size={12} />
                      <span>Valid Active Pipeline</span>
                    </>
                  ) : activeDataset.status === 'invalid' ? (
                    <>
                      <AlertCircle size={12} />
                      <span>Validation Failed</span>
                    </>
                  ) : (
                    <>
                      <Clock size={12} className="animate-spin" />
                      <span>{activeDataset.statusMessage}</span>
                    </>
                  )}
                </span>
              </div>

              {/* Data Properties Chips */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 mt-1">
                <span>
                  Rows: <strong className="text-white font-mono">{activeDataset.rowsUsed.toLocaleString()}</strong>
                </span>
                <span className="text-slate-600">•</span>
                <span>
                  Valid Compute: <strong className="text-emerald-400 font-mono">{activeDataset.validComputeRecords.toLocaleString()}</strong>
                </span>
                <span className="text-slate-600">•</span>
                <span>
                  Time Range: <strong className="text-cyan-300 font-mono">{activeDataset.timeRange}</strong>
                </span>
                <span className="text-slate-600">•</span>
                <span>
                  Frequency: <strong className="text-purple-300">{activeDataset.primaryFrequency}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Upload Button */}
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition"
            >
              <Upload size={14} />
              <span>Upload CSV</span>
            </button>

            {/* Run Prediction Button */}
            {!isDefault && (
              <button
                onClick={runPrediction}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
                title="Recalculate models strictly on uploaded data"
              >
                <Play size={14} />
                <span>Run Prediction</span>
              </button>
            )}

            {/* Reset to Default Button */}
            {!isDefault && (
              <button
                onClick={() => setIsResetConfirmOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/50 hover:text-rose-300 hover:border-rose-500/40 text-slate-300 border border-slate-700 text-xs font-medium transition"
              >
                <RotateCcw size={14} />
                <span>Reset to Default Dataset</span>
              </button>
            )}

            {/* Quick Lecturer Test Dropdown / Buttons */}
            {isDefault && (
              <div className="hidden xl:flex items-center gap-1.5 pl-2 border-l border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-mono">Quick Tests:</span>
                <button
                  onClick={loadSyntheticSample}
                  className="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700 transition"
                  title="Test 1: 6-row synthetic test CSV from assignment specifications"
                >
                  Test 1: 6-Row CSV
                </button>
                <button
                  onClick={loadEpochSubsetSample}
                  className="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700 transition"
                  title="Test 2: Modern era (2018–2025) subset test"
                >
                  Test 2: Modern Subset
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Reset */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="max-w-md w-full rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <RotateCcw size={24} />
              <h3 className="text-lg font-bold text-white">Reset to Default Dataset?</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              This will clear the uploaded dataset (<code className="text-cyan-300">{activeDataset.filename}</code>), discard custom predictions, and restore the default 1,072-model Epoch AI dataset and historical 2010–2026 baseline models.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white transition shadow-lg"
              >
                Yes, Reset to Default
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

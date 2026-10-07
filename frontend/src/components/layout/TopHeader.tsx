'use client';

import React from 'react';
import { GraduationCap, Sun, Moon, Calendar, Database, Sparkles, Upload } from 'lucide-react';
import { useActiveDataset } from '@/context/ActiveDatasetContext';

interface TopHeaderProps {
  onOpenViva: () => void;
  onOpenUpload?: () => void;
  isLightMode: boolean;
  toggleTheme: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenViva,
  onOpenUpload,
  isLightMode,
  toggleTheme
}) => {
  const { activeDataset, isDefault, projectInfo } = useActiveDataset();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
      {/* Title & Metadata */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`p-2 rounded-xl shrink-0 border ${
            isDefault
              ? 'bg-blue-600/20 text-blue-400 border-blue-500/30'
              : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
          }`}
        >
          <Sparkles size={20} />
        </div>
        <div className="min-w-0">
          <h1 className="text-sm sm:text-base font-bold text-white truncate flex items-center gap-2">
            <span>{isDefault ? projectInfo.shortTitle : `Live Prediction: ${activeDataset.filename}`}</span>
            <span className="hidden sm:inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {isDefault ? 'B.Tech P&S Project' : 'Active Custom Dataset'}
            </span>
          </h1>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Database size={12} className={isDefault ? 'text-blue-400' : 'text-emerald-400'} />
              <span>
                {activeDataset.rowsUsed.toLocaleString()} Models ({activeDataset.validComputeRecords.toLocaleString()} Valid)
              </span>
            </span>
            <span className="hidden md:inline-flex items-center gap-1">
              <Calendar size={12} className="text-amber-400" />
              <span>Range: {activeDataset.timeRange}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Upload Dataset Button */}
        {onOpenUpload && (
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold transition"
            title="Upload custom CSV for live prediction"
          >
            <Upload size={14} />
            <span className="hidden sm:inline">Upload CSV</span>
          </button>
        )}

        {/* Defense Q&A Button */}
        <button
          onClick={onOpenViva}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition"
          title="Open Research Defense Q&A"
        >
          <GraduationCap size={16} />
          <span>Defense Q&A</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition"
          title={isLightMode ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {isLightMode ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </div>
    </header>
  );
};


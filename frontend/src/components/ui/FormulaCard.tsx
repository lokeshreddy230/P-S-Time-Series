'use client';

import React, { useState } from 'react';
import { FormulaItem } from '@/data/projectData';
import { ChevronDown, ChevronUp, Copy, Check, MessageSquare } from 'lucide-react';

interface FormulaCardProps {
  formula: FormulaItem;
  className?: string;
}

export const FormulaCard: React.FC<FormulaCardProps> = ({ formula, className = '' }) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(formula.formula);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categoryColorMap = {
    Descriptive: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Correlation: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    Regression: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Time-Series': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Evaluation: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Transformation: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  };

  return (
    <div className={`p-5 rounded-xl border border-slate-800 bg-slate-900/90 shadow-md transition-all hover:border-slate-700 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${categoryColorMap[formula.category] || 'bg-slate-800 text-slate-300'}`}>
            {formula.category}
          </span>
          <h3 className="text-base sm:text-lg font-bold text-white mt-1">
            {formula.name}
          </h3>
        </div>
        <button
          onClick={handleCopy}
          title="Copy formula notation"
          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
        >
          {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
        </button>
      </div>

      {/* Formula Box */}
      <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800/80 text-center my-3 overflow-x-auto">
        <code className="text-base sm:text-lg text-blue-300 font-mono tracking-wide">
          {formula.formula}
        </code>
      </div>

      {/* Brief explanation */}
      <p className="text-xs sm:text-sm text-slate-300 mb-3 leading-relaxed">
        {formula.explanation}
      </p>

      {/* Toggle Details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full py-2 px-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-xs font-medium text-slate-300 flex items-center justify-between transition"
      >
        <span>{expanded ? 'Hide Formula Breakdown' : 'Show Variables & Numeric Application'}</span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* Expandable Section */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-4 animate-in fade-in duration-200">
          {/* Variables breakdown */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Variable Definitions
            </h4>
            <div className="grid grid-cols-1 gap-1.5">
              {formula.variables.map((v, i) => (
                <div key={i} className="flex items-baseline gap-2 text-xs bg-slate-950/40 px-2.5 py-1.5 rounded border border-slate-800/40">
                  <span className="font-mono text-cyan-400 font-bold shrink-0">{v.name}:</span>
                  <span className="text-slate-300">{v.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Numeric Example */}
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs">
            <span className="font-semibold text-amber-400 block mb-1">
              Project Numeric Application:
            </span>
            <span className="text-slate-200 font-mono">
              {formula.numericExample}
            </span>
          </div>

          {/* Technical Interpretation */}
          <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-800/30 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-blue-300 mb-1">
              <MessageSquare size={14} />
              <span>Statistical & Physical Interpretation:</span>
            </div>
            <p className="text-slate-200 italic leading-relaxed">
              &ldquo;{formula.technicalInterpretation}&rdquo;
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

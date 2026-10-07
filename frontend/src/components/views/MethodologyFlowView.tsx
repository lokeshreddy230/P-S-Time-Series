'use client';

import React, { useState } from 'react';
import { METHODOLOGY_STEPS, MethodologyNode } from '@/data/projectData';
import { Badge } from '@/components/ui/Badge';
import {
  GitFork,
  CheckCircle2,
  ArrowDown,
  Layers,
  Sparkles,
  Info,
  ChevronRight
} from 'lucide-react';

export const MethodologyFlowView: React.FC = () => {
  const [selectedStepId, setSelectedStepId] = useState<string>('step1');

  const selectedStep =
    METHODOLOGY_STEPS.find((s) => s.id === selectedStepId) || METHODOLOGY_STEPS[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-md">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            End-to-End Methodological Architecture Pipeline
          </h2>
          <Badge variant="purple">Sequential Workflow</Badge>
          <Badge variant="primary">10 Step Pipeline</Badge>
        </div>
        <p className="text-xs sm:text-sm text-slate-300">
          Interactive execution diagram tracing data ingestion, temporal aggregation, statistical modeling, out-of-sample backtesting, and final forecast interval derivation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Step Pipeline */}
        <div className="lg:col-span-6 space-y-2">
          {METHODOLOGY_STEPS.map((step, idx) => {
            const isSelected = selectedStep.id === step.id;
            return (
              <div key={step.id} className="relative">
                <button
                  onClick={() => setSelectedStepId(step.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-950/30 shadow-md'
                      : 'border-slate-800 bg-slate-900/70 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div className="min-w-0">
                      <div className={`text-xs sm:text-sm font-bold truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {step.title.replace(/^\d+\.\s*/, '')}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {step.category}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <ChevronRight size={16} className={isSelected ? 'text-blue-400' : 'text-slate-600'} />
                  </div>
                </button>

                {/* Downward connecting line */}
                {idx < METHODOLOGY_STEPS.length - 1 && (
                  <div className="w-0.5 h-2 bg-slate-800 mx-auto my-0.5" />
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column: Deep-Dive Detail Card for Selected Step */}
        <div className="lg:col-span-6">
          <div className="sticky top-20 p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400">
                Phase {selectedStep.id.replace('step', '')} • {selectedStep.category}
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                {selectedStep.title}
              </h3>
            </div>

            {/* What We Did */}
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                1. What We Did:
              </span>
              <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                {selectedStep.whatWeDid}
              </p>
            </div>

            {/* Why We Did It */}
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                2. Why We Did It (Statistical Rationale):
              </span>
              <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                {selectedStep.whyWeDidIt}
              </p>
            </div>

            {/* Mathematical Formula if present */}
            {selectedStep.formula && (
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block">
                  3. Mathematical Formulation:
                </span>
                <div className="p-3 rounded-xl bg-slate-950 font-mono text-cyan-300 text-center text-sm border border-slate-800 overflow-x-auto">
                  {selectedStep.formula}
                </div>
              </div>
            )}

            {/* Empirical Result */}
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
                4. Empirical Project Result:
              </span>
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs sm:text-sm text-emerald-200 font-medium">
                {selectedStep.result}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import { LIMITATIONS_LIST } from '@/data/projectData';
import { Badge } from '@/components/ui/Badge';
import { AlertTriangle, ShieldAlert, Scale, HelpCircle } from 'lucide-react';

export const LimitationsView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-md">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Academic Limitations & Methodological Caveats
          </h2>
          <Badge variant="warning">Critical Research Self-Appraisal</Badge>
        </div>
        <p className="text-xs sm:text-sm text-slate-300">
          Transparent scientific evaluation of data constraints, sample size limits, reporting biases, and physical boundaries on compute extrapolation.
        </p>
      </div>

      {/* Limitations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {LIMITATIONS_LIST.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-md space-y-2.5 hover:border-slate-700 transition"
          >
            <div className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {item.id}
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                {item.title}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-8">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      {/* Epistemological Summary Banner */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/80 text-xs sm:text-sm text-slate-300 space-y-2">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Scale size={18} className="text-blue-400" />
          <span>Epistemological Standards for Viva Defense</span>
        </div>
        <p className="leading-relaxed">
          In university examination and peer-reviewed defense, acknowledging limitations is a mark of statistical maturity. We emphasize that our models capture the <strong>empirical aggregate macro-trend</strong> of known notable systems over 2010–2025. They are not physical or economic determinisms, and should always be viewed through the lens of their wide analytical prediction intervals.
        </p>
      </div>
    </div>
  );
};

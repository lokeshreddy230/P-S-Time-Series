'use client';

import React from 'react';
import { Info, AlertTriangle, CheckCircle, Lightbulb, HelpCircle } from 'lucide-react';

interface ExplanationCardProps {
  title: string;
  children: React.ReactNode;
  type?: 'info' | 'warning' | 'tip' | 'success' | 'question';
  badge?: string;
  className?: string;
}

export const ExplanationCard: React.FC<ExplanationCardProps> = ({
  title,
  children,
  type = 'info',
  badge,
  className = ''
}) => {
  const typeConfig = {
    info: {
      border: 'border-blue-500/30',
      bg: 'bg-blue-950/20',
      icon: Info,
      iconColor: 'text-blue-400',
      titleColor: 'text-blue-300'
    },
    warning: {
      border: 'border-amber-500/30',
      bg: 'bg-amber-950/20',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      titleColor: 'text-amber-300'
    },
    tip: {
      border: 'border-purple-500/30',
      bg: 'bg-purple-950/20',
      icon: Lightbulb,
      iconColor: 'text-purple-400',
      titleColor: 'text-purple-300'
    },
    success: {
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-950/20',
      icon: CheckCircle,
      iconColor: 'text-emerald-400',
      titleColor: 'text-emerald-300'
    },
    question: {
      border: 'border-cyan-500/30',
      bg: 'bg-cyan-950/20',
      icon: HelpCircle,
      iconColor: 'text-cyan-400',
      titleColor: 'text-cyan-300'
    }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className={`p-4 sm:p-5 rounded-xl border ${config.border} ${config.bg} backdrop-blur-sm shadow-sm ${className}`}>
      <div className="flex items-start gap-3">
        <div className={`p-1.5 rounded-lg bg-slate-900/60 ${config.iconColor} shrink-0 mt-0.5`}>
          <Icon size={18} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h4 className={`text-sm sm:text-base font-semibold ${config.titleColor}`}>
              {title}
            </h4>
            {badge && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {badge}
              </span>
            )}
          </div>
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: string;
  badgeColor?: 'blue' | 'green' | 'amber' | 'purple' | 'red';
  trend?: {
    text: string;
    positive?: boolean;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeColor = 'blue',
  trend,
  className = ''
}) => {
  const badgeColorMap = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    red: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  };

  return (
    <div className={`p-5 rounded-xl border border-slate-800 bg-slate-900/80 shadow-md hover:border-slate-700 transition-all flex flex-col justify-between ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className="p-2 rounded-lg bg-slate-800/80 text-blue-400 shrink-0">
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="my-1">
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-baseline gap-2">
          {value}
          {badge && (
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${badgeColorMap[badgeColor]}`}>
              {badge}
            </span>
          )}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
          {subtitle && <span>{subtitle}</span>}
          {trend && (
            <span className={`font-medium ${trend.positive ? 'text-emerald-400' : 'text-amber-400'}`}>
              {trend.text}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

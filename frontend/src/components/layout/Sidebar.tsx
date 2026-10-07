'use client';

import React from 'react';
import {
  LayoutDashboard,
  Database,
  ShieldCheck,
  CalendarRange,
  BarChart3,
  GitCompare,
  TrendingUp,
  Activity,
  History,
  CheckCircle,
  HelpCircle,
  TrendingDown,
  Atom,
  GraduationCap,
  GitFork,
  AlertTriangle,
  Info,
  Upload
} from 'lucide-react';

export type NavigationPage =
  | 'overview'
  | 'upload'
  | 'dataset'
  | 'quality'
  | 'timeseries'
  | 'descriptive'
  | 'correlation'
  | 'regression'
  | 'quadratic'
  | 'tsmodels'
  | 'backtesting'
  | 'actual_predicted'
  | 'hypothesis'
  | 'forecast'
  | 'formula_lab'
  | 'viva'
  | 'methodology'
  | 'limitations'
  | 'about';

interface SidebarProps {
  currentPage: NavigationPage;
  onSelectPage: (page: NavigationPage) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: NavigationPage;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  isOpenMobile,
  onCloseMobile
}) => {
  const navGroups: NavGroup[] = [
    {
      group: 'DATASET & UPLOAD',
      items: [
        { id: 'overview', label: '1. Overview Dashboard', icon: LayoutDashboard },
        { id: 'upload', label: 'Upload Dataset (Predict)', icon: Upload, badge: 'Live CSV' },
        { id: 'dataset', label: '2. Dataset Explorer', icon: Database },
        { id: 'quality', label: '3. Data Quality & Gaps', icon: ShieldCheck },
        { id: 'timeseries', label: '4. Monthly vs Yearly', icon: CalendarRange, badge: 'Decision' }
      ]
    },
    {
      group: 'EXPLORATORY STATISTICS',
      items: [
        { id: 'descriptive', label: '5. Descriptive Stats', icon: BarChart3 },
        { id: 'correlation', label: '6. Correlation (Pearson/Spearman)', icon: GitCompare },
        { id: 'hypothesis', label: '12. Hypothesis Testing', icon: HelpCircle, badge: 'Welch t' }
      ]
    },
    {
      group: 'STATISTICAL MODELING',
      items: [
        { id: 'regression', label: '7. Linear Regression', icon: TrendingUp, badge: 'Selected' },
        { id: 'quadratic', label: '8. Quadratic Regression', icon: TrendingDown },
        { id: 'tsmodels', label: '9. Time-Series Models', icon: Activity, badge: 'ARIMA/Holt' },
        { id: 'backtesting', label: '10. Rolling Backtest', icon: History, badge: '7 Folds' },
        { id: 'actual_predicted', label: '11. Actual vs Predicted', icon: CheckCircle }
      ]
    },
    {
      group: 'PROJECTIONS & UNCERTAINTY',
      items: [
        { id: 'forecast', label: '13. Final Forecast 2027–2030', icon: TrendingUp, badge: '95% PI' }
      ]
    },
    {
      group: 'RESEARCH DEFENSE & FORMULAS',
      items: [
        { id: 'formula_lab', label: '14. Statistical Formula Lab', icon: Atom, badge: '14 Cards' },
        { id: 'viva', label: '15. Technical Defense Q&A', icon: GraduationCap, badge: 'Briefing' },
        { id: 'methodology', label: '16. Methodology Flow', icon: GitFork }
      ]
    },
    {
      group: 'PROJECT CONTEXT',
      items: [
        { id: 'limitations', label: '17. Academic Limitations', icon: AlertTriangle },
        { id: 'about', label: '18. About & Curriculum', icon: Info }
      ]
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 border-r border-slate-800 bg-slate-950 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Title Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow">
              AG
            </div>
            <div>
              <div className="font-bold text-sm text-white tracking-tight">AI Compute Project</div>
              <div className="text-[11px] text-slate-400">Time-Series & Statistics</div>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          {navGroups.map((grp) => (
            <div key={grp.group}>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1.5">
                {grp.group}
              </div>
              <div className="space-y-0.5">
                {grp.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectPage(item.id);
                        onCloseMobile();
                      }}
                      className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold'
                          : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon size={16} className={isActive ? 'text-blue-400' : 'text-slate-400'} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            isActive
                              ? 'bg-blue-500/30 text-blue-200'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/90 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Target: <code className="text-blue-300">Y_t = median(log10)</code></span>
          <span className="font-mono text-emerald-400">2010–2025</span>
        </div>
      </aside>
    </>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar, NavigationPage } from '@/components/layout/Sidebar';
import { TopHeader } from '@/components/layout/TopHeader';
import { ActiveDatasetBanner } from '@/components/layout/ActiveDatasetBanner';
import { ActiveDatasetProvider } from '@/context/ActiveDatasetContext';

// Import all views including UploadDatasetView
import { OverviewDashboard } from '@/components/views/OverviewDashboard';
import { UploadDatasetView } from '@/components/views/UploadDatasetView';
import { DatasetExplorer } from '@/components/views/DatasetExplorer';
import { DataQualityView } from '@/components/views/DataQualityView';
import { MonthlyVsYearlyView } from '@/components/views/MonthlyVsYearlyView';
import { DescriptiveStatsView } from '@/components/views/DescriptiveStatsView';
import { CorrelationView } from '@/components/views/CorrelationView';
import { LinearRegressionView } from '@/components/views/LinearRegressionView';
import { QuadraticRegressionView } from '@/components/views/QuadraticRegressionView';
import { TimeSeriesModelsView } from '@/components/views/TimeSeriesModelsView';
import { BacktestingView } from '@/components/views/BacktestingView';
import { ActualVsPredictedView } from '@/components/views/ActualVsPredictedView';
import { HypothesisTestingView } from '@/components/views/HypothesisTestingView';
import { FinalForecastView } from '@/components/views/FinalForecastView';
import { FormulaLabView } from '@/components/views/FormulaLabView';
import { VivaLectureModeView } from '@/components/views/VivaLectureModeView';
import { MethodologyFlowView } from '@/components/views/MethodologyFlowView';
import { LimitationsView } from '@/components/views/LimitationsView';
import { AboutProjectView } from '@/components/views/AboutProjectView';

import { Menu } from 'lucide-react';

function DashboardContent() {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);

  // Toggle theme class on body
  useEffect(() => {
    if (isLightMode) {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  }, [isLightMode]);

  const toggleTheme = () => {
    setIsLightMode(!isLightMode);
  };

  const handleOpenViva = () => {
    setCurrentPage('viva');
  };

  const handleOpenUpload = () => {
    setCurrentPage('upload');
  };

  const renderCurrentView = () => {
    switch (currentPage) {
      case 'overview':
        return <OverviewDashboard />;
      case 'upload':
        return <UploadDatasetView onNavigateToForecast={() => setCurrentPage('forecast')} />;
      case 'dataset':
        return <DatasetExplorer />;
      case 'quality':
        return <DataQualityView />;
      case 'timeseries':
        return <MonthlyVsYearlyView />;
      case 'descriptive':
        return <DescriptiveStatsView />;
      case 'correlation':
        return <CorrelationView />;
      case 'regression':
        return <LinearRegressionView />;
      case 'quadratic':
        return <QuadraticRegressionView />;
      case 'tsmodels':
        return <TimeSeriesModelsView />;
      case 'backtesting':
        return <BacktestingView />;
      case 'actual_predicted':
        return <ActualVsPredictedView />;
      case 'hypothesis':
        return <HypothesisTestingView />;
      case 'forecast':
        return <FinalForecastView />;
      case 'formula_lab':
        return <FormulaLabView />;
      case 'viva':
        return <VivaLectureModeView />;
      case 'methodology':
        return <MethodologyFlowView />;
      case 'limitations':
        return <LimitationsView />;
      case 'about':
        return <AboutProjectView />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Main Layout */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onSelectPage={(page) => setCurrentPage(page)}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Content Wrapper */}
        <div className="flex-1 flex flex-col lg:pl-72 min-w-0">
          {/* Top Header */}
          <TopHeader
            onOpenViva={handleOpenViva}
            onOpenUpload={handleOpenUpload}
            isLightMode={isLightMode}
            toggleTheme={toggleTheme}
          />

          {/* Persistent Active Dataset Banner */}
          <ActiveDatasetBanner onOpenUpload={handleOpenUpload} />

          {/* Mobile Menu Trigger Bar */}
          <div className="lg:hidden px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white"
            >
              <Menu size={18} className="text-blue-400" />
              <span>Menu / Table of Contents</span>
            </button>
            <span className="text-[11px] font-mono text-cyan-400">
              {currentPage.toUpperCase()}
            </span>
          </div>

          {/* Main Viewport */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {renderCurrentView()}
          </main>

          {/* Academic Footer */}
          <footer className="mt-auto border-t border-slate-900 py-6 px-4 lg:px-8 text-center text-xs text-slate-400 space-y-1">
            <div>
              B.Tech Probability & Statistics Project • &ldquo;Time-Series Analysis and Forecasting of AI Model Training Compute Using Real-World Data&rdquo;
            </div>
            <div className="text-[11px] text-slate-400">
              Active Dataset Pipeline • All empirical results dynamically rendered from the validated dataset source.
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <ActiveDatasetProvider>
      <DashboardContent />
    </ActiveDatasetProvider>
  );
}


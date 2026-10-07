'use client';

import React, { useState } from 'react';
import { useActiveDataset } from '@/context/ActiveDatasetContext';
import { VIVA_QUESTIONS, VivaQuestion } from '@/data/projectData';
import { PredictionMetadataBadge } from '@/components/ui/PredictionMetadataBadge';
import { Badge } from '@/components/ui/Badge';
import {
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  CheckCircle,
  HelpCircle,
  Sparkles,
  BookOpen,
  ListFilter,
  Layers,
  Database,
  ShieldCheck
} from 'lucide-react';

export const VivaLectureModeView: React.FC = () => {
  const { activeDataset, isDefault } = useActiveDataset();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'focused' | 'all'>('focused');

  const categories = [
    'ALL',
    'Basics',
    'Dataset',
    'Statistics',
    'Correlation',
    'Regression',
    'Time Series',
    'Model Evaluation',
    'Forecasting'
  ];

  const filteredQuestions = VIVA_QUESTIONS.filter((q) =>
    selectedCategory === 'ALL' ? true : q.category === selectedCategory
  );

  const activeQuestion = filteredQuestions[currentIndex % filteredQuestions.length] || VIVA_QUESTIONS[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredQuestions.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredQuestions.length) % filteredQuestions.length);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Research Defense & Technical Inquiries Briefing
              </h2>
              <Badge variant="purple">Oral Project Defense</Badge>
              <Badge variant="primary">14 Key Research Topics</Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              Formal analytical responses and theoretical justifications for statistical, econometric, and methodological inquiries concerning AI compute time series.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs self-start sm:self-auto">
            <button
              onClick={() => setViewMode('focused')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                viewMode === 'focused' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Focus View
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                viewMode === 'all' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Inquiries ({filteredQuestions.length})
            </button>
          </div>
        </div>
      </div>

      {/* Critical Active Dataset Label */}
      <PredictionMetadataBadge />

      {/* Active Dataset Defense Questions (Specified in Requirements) */}
      <div className="p-5 sm:p-6 rounded-2xl border-2 border-emerald-500/40 bg-slate-900/90 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm sm:text-base">
          <ShieldCheck size={20} />
          <span>Active Dataset Oral Defense Briefing</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="font-semibold text-amber-300">
              Q: &ldquo;What dataset are you predicting?&rdquo;
            </div>
            <div className="text-slate-200 font-mono">
              Currently predicting: <strong className="text-cyan-300">{activeDataset.filename}</strong>
            </div>
            <p className="text-slate-400 text-[11px]">
              Active records: {activeDataset.rowsUsed} total, {activeDataset.validComputeRecords} with disclosed compute, spanning {activeDataset.timeRange}.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="font-semibold text-amber-300">
              Q: &ldquo;Did you use your default dataset?&rdquo;
            </div>
            <div className="text-slate-200">
              {isDefault ? (
                <strong className="text-white">Currently evaluating the default Epoch AI baseline dataset.</strong>
              ) : (
                <strong className="text-emerald-400">
                  No. The prediction engine uses the currently active uploaded dataset ({activeDataset.filename}).
                </strong>
              )}
            </div>
            <p className="text-slate-400 text-[11px]">
              All downstream regression, rolling backtests, and future forecasts isolate the active uploaded CSV with zero leakage.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="font-semibold text-amber-300">
              Q: &ldquo;What happens if I upload another CSV?&rdquo;
            </div>
            <div className="text-slate-200">
              <strong className="text-white">
                The uploaded CSV becomes the active dataset and the complete analysis and forecast are recalculated from it.
              </strong>
            </div>
            <p className="text-slate-400 text-[11px]">
              The pipeline detects columns, cleans dates/FLOPs, aggregates median time series, fits OLS/quadratic/Holt/ARIMA, runs backtests, and produces fresh prediction intervals.
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-xl border border-slate-800 bg-slate-900/60">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setCurrentIndex(0);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* VIEW MODE: FOCUSED SINGLE INQUIRY */}
      {viewMode === 'focused' && (
        <div className="p-6 sm:p-8 rounded-3xl border border-blue-500/30 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -z-10" />

          {/* Card Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Topic: {activeQuestion.category}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Inquiry {currentIndex + 1} of {filteredQuestions.length}
              </span>
            </div>

            {/* Quick jump dropdown */}
            <select
              value={activeQuestion.id}
              onChange={(e) => {
                const targetId = parseInt(e.target.value);
                const idx = filteredQuestions.findIndex((q) => q.id === targetId);
                if (idx !== -1) setCurrentIndex(idx);
              }}
              className="py-1 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-medium focus:outline-none focus:border-blue-500"
            >
              {filteredQuestions.map((q, i) => (
                <option key={q.id} value={q.id}>
                  {i + 1}. {q.question.slice(0, 45)}...
                </option>
              ))}
            </select>
          </div>

          {/* Question Heading */}
          <div className="py-1">
            <span className="text-xs uppercase font-extrabold text-blue-400 tracking-wider block mb-1">
              Research Examination Inquiry:
            </span>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight leading-snug">
              {activeQuestion.question}
            </h3>
          </div>

          {/* Key Metric Badge if present */}
          {activeQuestion.keyMetric && (
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 inline-flex items-center gap-2 text-xs">
              <Sparkles size={14} className="text-cyan-400" />
              <span className="text-slate-400 font-medium">Empirical Result:</span>
              <span className="text-cyan-300 font-mono font-bold">{activeQuestion.keyMetric}</span>
            </div>
          )}

          {/* Direct Formal Analytical Answer (Always Visible) */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 shadow-inner">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <CheckCircle size={16} />
              <span>Formal Analytical Finding & Explanation</span>
            </div>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans">
              {activeQuestion.answer}
            </p>

            {activeQuestion.formula && (
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center font-mono text-cyan-300 text-sm mt-2 overflow-x-auto">
                {activeQuestion.formula}
              </div>
            )}
          </div>

          {/* Methodological Context Box */}
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/30 text-xs text-purple-200 flex items-start gap-2.5">
            <Lightbulb size={18} className="text-purple-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-purple-300 font-semibold mb-0.5">
                Methodological & Theoretical Context:
              </strong>
              {activeQuestion.methodologicalNote}
            </div>
          </div>

          {/* Bottom Navigation Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <button
              onClick={handlePrev}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
            >
              <ChevronLeft size={16} />
              <span>Previous Inquiry</span>
            </button>

            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              Inquiry {currentIndex + 1} of {filteredQuestions.length}
            </span>

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition"
            >
              <span>Next Inquiry</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* VIEW MODE: ALL INQUIRIES LIST VIEW */}
      {viewMode === 'all' && (
        <div className="space-y-4">
          {filteredQuestions.map((q, i) => (
            <div
              key={q.id}
              className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-md space-y-3"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                  {q.category}
                </span>
                <span className="text-slate-500 font-mono">Inquiry #{i + 1}</span>
              </div>

              <h3 className="text-lg font-bold text-white leading-snug">
                {q.question}
              </h3>

              {q.keyMetric && (
                <div className="p-2 rounded bg-slate-950 border border-slate-800 inline-flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-medium">Result:</span>
                  <span className="text-cyan-300 font-mono font-bold">{q.keyMetric}</span>
                </div>
              )}

              <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                {q.answer}
              </p>

              {q.formula && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center font-mono text-cyan-300 text-xs overflow-x-auto">
                  {q.formula}
                </div>
              )}

              <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-800/30 text-xs text-purple-200">
                <strong className="text-purple-300">Methodological Context: </strong>
                {q.methodologicalNote}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { FORMULA_CARDS, FormulaItem } from '@/data/projectData';
import { FormulaCard } from '@/components/ui/FormulaCard';
import { PredictionMetadataBadge } from '@/components/ui/PredictionMetadataBadge';
import { Badge } from '@/components/ui/Badge';
import { Atom, Search, Filter, BookOpen } from 'lucide-react';

export const FormulaLabView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['ALL', 'Descriptive', 'Correlation', 'Regression', 'Time-Series', 'Evaluation', 'Transformation'];

  const filteredFormulas = FORMULA_CARDS.filter((f) => {
    if (selectedCategory !== 'ALL' && f.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        f.name.toLowerCase().includes(q) ||
        f.formula.toLowerCase().includes(q) ||
        f.explanation.toLowerCase().includes(q) ||
        f.technicalInterpretation.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-md">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Mathematical Derivations & Statistical Formula Lab
          </h2>
          <Badge variant="purple">14 Core Formulations</Badge>
          <Badge variant="primary">Syllabus Modules I, VII, IX, X</Badge>
        </div>
        <p className="text-xs sm:text-sm text-slate-300">
          Formal mathematical equations, variable definitions, real empirical calculations, and technical interpretations for all statistical methods used in this project.
        </p>
      </div>

      {/* Critical Active Dataset Label */}
      <PredictionMetadataBadge />

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search formulas, variables, metrics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
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
      </div>

      {/* Formula Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredFormulas.map((f) => (
          <FormulaCard key={f.id} formula={f} />
        ))}
      </div>

      {filteredFormulas.length === 0 && (
        <div className="p-8 text-center rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 text-sm">
          No formulas matching your search query &ldquo;{searchQuery}&rdquo;.
        </div>
      )}
    </div>
  );
};

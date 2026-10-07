'use client';

import React from 'react';
import { PROJECT_INFO } from '@/data/projectData';
import { Badge } from '@/components/ui/Badge';
import {
  GraduationCap,
  BookOpen,
  Database,
  Users,
  ExternalLink,
  Award,
  Sparkles
} from 'lucide-react';

export const AboutProjectView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 shadow-lg space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="primary">B.Tech Degree Project</Badge>
          <Badge variant="purple">Academic Year 2025–2026</Badge>
        </div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
          {PROJECT_INFO.title}
        </h1>
        <p className="text-sm text-slate-300">
          Course: <strong className="text-white">{PROJECT_INFO.course}</strong>
        </p>
      </div>

      {/* Curriculum Syllabus Modules Mapping */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-md space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-blue-400" />
          <h2 className="text-base sm:text-lg font-bold text-white">
            Curriculum Syllabus Topics Covered
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROJECT_INFO.syllabusModules.map((m) => (
            <div
              key={m.module}
              className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400 font-mono">
                  {m.module}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Applied in Project
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">
                {m.name}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {m.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Dataset & Primary Reference */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-md space-y-3">
        <div className="flex items-center gap-2">
          <Database size={18} className="text-emerald-400" />
          <h2 className="text-base font-bold text-white">
            Primary Empirical Dataset Reference
          </h2>
        </div>
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-300 space-y-2">
          <div className="flex items-center justify-between">
            <strong className="text-white text-base">Epoch AI Notable AI Models Dataset</strong>
            <span className="text-xs text-slate-500 font-mono">CC BY 4.0 License</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Curated repository maintained by Epoch AI tracking landmark AI publications from 1950 to 2026. Contains empirical records of algorithmic tasks, authors, publication dates, model parameter counts, hardware specifications, and floating-point training compute estimates.
          </p>
          <div className="pt-2 text-xs text-blue-400 flex items-center gap-1">
            <span>Data snapshot audited: <strong>1,072 models</strong> through <strong>September 21, 2026</strong>.</span>
          </div>
        </div>
      </div>

      {/* Project Team & Contributors */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-md space-y-4">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-purple-400" />
          <h2 className="text-base font-bold text-white">
            Project Research Team
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-center space-y-1">
            <div className="w-12 h-12 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-base mx-auto">
              L
            </div>
            <div className="text-sm font-bold text-white mt-2">Lokesh & Team</div>
            <div className="text-xs text-slate-400">B.Tech Student Investigator</div>
            <div className="text-[11px] text-slate-500 font-mono">Lead Research & Analysis</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-center space-y-1">
            <div className="w-12 h-12 rounded-full bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-base mx-auto">
              PS
            </div>
            <div className="text-sm font-bold text-white mt-2">Probability & Statistics Faculty</div>
            <div className="text-xs text-slate-400">Course Instructor / Advisor</div>
            <div className="text-[11px] text-slate-500 font-mono">Academic Project Mentor</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-center space-y-1">
            <div className="w-12 h-12 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-base mx-auto">
              AI
            </div>
            <div className="text-sm font-bold text-white mt-2">Computational Statistics Lab</div>
            <div className="text-xs text-slate-400">Department of Computer Science</div>
            <div className="text-[11px] text-slate-500 font-mono">B.Tech Engineering Portal</div>
          </div>
        </div>
      </div>
    </div>
  );
};

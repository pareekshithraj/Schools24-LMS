import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BookOpen, 
  BrainCircuit, 
  Layout, 
  Code2, 
  Database, 
  Cpu, 
  Play, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export const CourseViewer = () => {
  const { curriculum, setActiveTab, setActiveIdeCode, setActiveIdeLanguage } = useApp();
  const [selectedCourse, setSelectedCourse] = useState(curriculum[0]);

  const handleLaunchPractice = () => {
    setActiveIdeLanguage('python');
    setActiveIdeCode(`# Hands-on practice from ${selectedCourse.title}\n\ndef solve():\n    print("Welcome to ${selectedCourse.title}!")\n\nsolve()\n`);
    setActiveTab('codelab');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#222] pb-4">
        <div>
          <h2 className="text-lg font-bold text-[#fafafa]">
            Computer Science Curriculum Framework
          </h2>
          <p className="text-xs text-zinc-500">
            Standardized Grade 6 to 12 syllabus deployed across all 42 trust schools.
          </p>
        </div>

        <button 
          onClick={handleLaunchPractice}
          className="vercel-btn-primary px-3 py-1.5 text-xs flex items-center gap-1.5 shadow-xs"
        >
          <Code2 className="h-3.5 w-3.5" />
          <span>Launch in CodeLab</span>
        </button>
      </div>

      {/* Course Grid (Vercel Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {curriculum.map((c) => {
          const isSelected = selectedCourse.id === c.id;
          return (
            <div
              key={c.id}
              onClick={() => setSelectedCourse(c)}
              className={`vercel-card p-4 space-y-3 cursor-pointer ${
                isSelected ? 'ring-2 ring-black dark:ring-white border-transparent' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#fafafa]">
                  {c.grade}
                </span>
                <span className="text-[10px] font-medium bg-[#1a1a1a] text-zinc-400 px-2 py-0.5 rounded border border-[#222]">
                  {c.level}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#fafafa] leading-snug">
                  {c.title}
                </h3>
                <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                  {c.description}
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-[#222] text-xs">
                <div className="flex justify-between text-zinc-500 text-[11px]">
                  <span>{c.duration}</span>
                  <span className="font-semibold text-[#fafafa]">{c.progress}% Complete</span>
                </div>
                <div className="h-1.5 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div className="h-full bg-black dark:bg-white rounded-full" style={{ width: `${c.progress}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Course Modules Breakdown */}
      {selectedCourse && (
        <div className="vercel-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#222] pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Selected Module Spec</span>
              <h3 className="text-base font-bold text-[#fafafa] mt-0.5">
                {selectedCourse.title} ({selectedCourse.grade})
              </h3>
            </div>
            <span className="text-xs text-zinc-500">{selectedCourse.category}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {selectedCourse.modules.map((mod, idx) => (
              <div key={mod.id} className="p-3 rounded-lg border border-[#222] bg-[#111] hover:bg-[#1a1a1a] transition-colors flex items-center justify-between text-xs cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <div className={`h-6 w-6 rounded flex items-center justify-center font-bold text-[11px] ${
                    mod.completed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-[#222] text-zinc-400'
                  }`}>
                    {mod.completed ? '✓' : idx + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-[#fafafa]">{mod.title}</div>
                    <div className="text-[11px] text-zinc-400">{mod.lessons} Lessons & Exercises</div>
                  </div>
                </div>

                <button onClick={handleLaunchPractice} className="text-zinc-400 hover:text-[#fafafa]">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

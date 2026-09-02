import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CheckSquare, 
  Code2, 
  Clock, 
  Users, 
  Play, 
  CheckCircle2, 
  ChevronRight,
  Database
} from 'lucide-react';

export const AssignmentsManager = () => {
  const { 
    assignments, 
    setActiveIdeCode, 
    setActiveIdeLanguage, 
    setActiveTab 
  } = useApp();

  const [selectedTask, setSelectedTask] = useState(assignments[0]);

  const handleOpenInIde = (task) => {
    setActiveIdeLanguage(task.language);
    setActiveIdeCode(task.starterCode);
    setActiveTab('codelab');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#222] pb-4">
        <div>
          <h2 className="text-lg font-bold text-[#fafafa]">
            CS Coding Assignments & Automated Grading
          </h2>
          <p className="text-xs text-zinc-500">
            Self-evaluating unit test suites. Submissions are saved directly to Neon PostgreSQL.
          </p>
        </div>

        <span className="text-xs font-semibold bg-[#1a1a1a] border border-[#222] px-2.5 py-1 rounded-md text-zinc-300">
          Auto-Evaluator Active
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Task Cards */}
        <div className="lg:col-span-2 space-y-3">
          {assignments.map((task) => {
            const isSelected = selectedTask.id === task.id;
            return (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className={`vercel-card p-4 space-y-3 cursor-pointer ${
                  isSelected ? 'ring-2 ring-black dark:ring-white border-transparent' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-semibold uppercase bg-[#1a1a1a] text-zinc-300 px-1.5 py-0.5 rounded border border-[#222]">
                        {task.difficulty}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono font-bold">
                        {task.grade}
                      </span>
                      <span className="text-[11px] text-zinc-400 font-mono">
                        {task.language.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[#fafafa]">
                      {task.title}
                    </h3>
                  </div>

                  <span className="text-xs font-mono font-bold bg-[#1a1a1a] px-2 py-0.5 rounded text-zinc-300">
                    +{task.points} pts
                  </span>
                </div>

                <p className="text-xs text-zinc-500 line-clamp-2">
                  {task.description}
                </p>

                <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-[#222]">
                  <div className="flex items-center gap-4 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{task.deadline}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{task.submissionsCount} Submissions</span>
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenInIde(task);
                    }}
                    className="vercel-btn-primary px-3 py-1 text-xs"
                  >
                    Solve in IDE
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Col: Task Spec & Assertions */}
        {selectedTask && (
          <div className="vercel-card p-4 space-y-4 h-fit">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Spec Preview</span>
              <h3 className="text-sm font-bold text-[#fafafa] mt-1">
                {selectedTask.title}
              </h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                {selectedTask.description}
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-zinc-300">
                Assertion Suite ({selectedTask.testCases?.length || 4} Cases)
              </div>
              {(selectedTask.testCases || []).map((tc, idx) => (
                <div key={idx} className="p-2.5 rounded bg-[#1a1a1a] border border-[#222] text-xs font-mono space-y-0.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-500">Case #{idx + 1}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Auto-Check Ready</span>
                  </div>
                  <div className="text-zinc-300 text-[11px]">
                    In: {tc.input} | Out: <span className="text-emerald-600 dark:text-emerald-400">{tc.expected}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleOpenInIde(selectedTask)}
              className="w-full vercel-btn-primary py-2 text-xs flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Play className="h-3 w-3 fill-current" />
              <span>Launch Starter Code</span>
            </button>
          </div>
        )}

      </div>

    </div>
  );
};

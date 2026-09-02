import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, Award, TrendingUp, MessageSquare, ExternalLink } from 'lucide-react';

export const ParentView = () => {
  const { parent, student } = useApp();

  const metrics = [
    { label: 'Live Class Attendance', value: '100%',              sub: parent.recentLiveClassAttended, Icon: CheckCircle2, cls: 'metric-card-green' },
    { label: 'Latest Assessment',     value: parent.lastAssignmentScore, sub: 'Auto-graded 100/100', Icon: Award,        cls: 'metric-card-blue' },
    { label: 'Trust-Wide Rank',       value: `#${student.rankInTrust}`, sub: 'Top 1% of 15,420',   Icon: TrendingUp,   cls: 'metric-card-purple' },
  ];

  const recentActivity = [
    { date: 'Today',   type: 'Assignment',  text: 'Fibonacci Memoizer — 100/100',            tag: 'success' },
    { date: 'Aug 30',  type: 'Live Class',  text: 'Python Data Structures — Attended',        tag: 'info' },
    { date: 'Aug 28',  type: 'Assignment',  text: 'LIFO Stack — 95/100',                     tag: 'success' },
    { date: 'Aug 26',  type: 'Assessment',  text: 'Chapter Test: Algorithms — 88/100',       tag: 'info' },
    { date: 'Aug 24',  type: 'Live Class',  text: 'Web Development — Attended',              tag: 'info' },
  ];

  return (
    <div className="space-y-6 pb-10 max-w-screen-xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs text-[#52525b] font-semibold mb-1">Parent & Guardian Portal</div>
          <h1 className="text-2xl font-bold text-[#fafafa]">Student Report: {parent.wardName}</h1>
          <p className="text-sm text-[#52525b] mt-1">
            Roll No: {parent.wardRoll} · {parent.wardSchool} ({parent.wardGrade})
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-sm font-semibold text-emerald-400">Attendance: {parent.overallAttendance}</span>
        </div>
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map(({ label, value, sub, Icon, cls }) => (
          <div key={label} className={cls}>
            <div className="absolute top-4 right-4 bg-white/20 p-2 rounded-xl">
              <Icon className="h-5 w-5 text-white" />
            </div>
            <Icon className="absolute -right-4 -bottom-4 h-24 w-24 text-white/10" />
            <div className="text-sm font-medium text-white/90">{label}</div>
            <div className="text-3xl font-bold text-white mt-2 mb-1">{value}</div>
            <div className="text-xs text-white/70">
              <span className="bg-white/20 px-2 py-0.5 rounded-full">{sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Bottom row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Trainer Feedback */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-4 w-4 text-[#52525b]" />
            <h3 className="text-sm font-semibold text-[#fafafa]">Trainer Feedback & Notes</h3>
          </div>
          <blockquote className="bg-[#0a0a0a] border border-[#27272a] rounded-xl p-4 text-sm text-[#a1a1aa] leading-relaxed italic">
            "Aarav displays remarkable problem-solving ability in Python data structures and algorithmic complexity. He consistently completes all coursework with 100% test case pass rates and actively participates in live masterclasses."
          </blockquote>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-xs">V</div>
            <div>
              <div className="text-xs font-semibold text-[#fafafa]">Prof. Vikram Aditya</div>
              <div className="text-[10px] text-[#52525b]">Lead Master Trainer · Schools24</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-[#27272a]">
            <h3 className="text-sm font-semibold text-[#fafafa]">Recent Activity</h3>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {recentActivity.map((a, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-[#111111] transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full flex-shrink-0 ${a.tag === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                  <div>
                    <div className="text-xs font-medium text-[#fafafa]">{a.text}</div>
                    <div className="text-[10px] text-[#52525b]">{a.type} · {a.date}</div>
                  </div>
                </div>
                <ExternalLink className="h-3 w-3 text-[#3f3f46]" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

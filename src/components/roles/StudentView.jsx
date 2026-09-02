import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar, Clock, BookOpen, HelpCircle, GraduationCap,
  Award, TrendingUp, Target, Trophy, Flame, Video,
  CheckCircle2, BarChart3, Star, ChevronRight, Zap, Terminal
} from 'lucide-react';

/* ─── Circular progress ring ─── */
const Ring = ({ pct, color, size = 64, stroke = 6 }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1f1f22" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
    </svg>
  );
};

const SUBJECTS = [
  { name: 'Computer Science', short: 'CS',   progress: 85, color: '#06b6d4', barColor: 'bg-cyan-500',    icon: '💻', glow: 'glow-border-cyan' },
  { name: 'Mathematics',      short: 'Math', progress: 70, color: '#a855f7', barColor: 'bg-purple-500',  icon: '📐', glow: 'glow-border-purple' },
  { name: 'Physics',          short: 'Phy',  progress: 60, color: '#f97316', barColor: 'bg-orange-500',  icon: '⚛️', glow: 'glow-border-orange' },
  { name: 'English',          short: 'Eng',  progress: 90, color: '#10b981', barColor: 'bg-emerald-500', icon: '📚', glow: 'glow-border-green' },
  { name: 'Hindi',            short: 'Hin',  progress: 55, color: '#a855f7', barColor: 'bg-purple-500',  icon: '📖', glow: 'glow-border-purple' },
  { name: 'Kannada',          short: 'Kan',  progress: 45, color: '#f97316', barColor: 'bg-orange-500',  icon: '🔤', glow: 'glow-border-orange' },
];

const QUICK_ACTIONS = [
  { id: 'playground', label: 'Code Sandbox',  Icon: Terminal,      color: 'text-cyan-400' },
  { id: 'schedule',   label: 'Time Table',    Icon: Calendar,      color: 'text-purple-400' },
  { id: 'homework',   label: 'Homework',      Icon: BookOpen,      color: 'text-amber-400' },
  { id: 'quiz',       label: 'Quiz',          Icon: HelpCircle,    color: 'text-pink-400' },
  { id: 'lessons',    label: 'Lessons',       Icon: GraduationCap, color: 'text-blue-400' },
  { id: 'rewards',    label: 'Rewards',       Icon: Award,         color: 'text-emerald-400' },
];

const RECENT_ACTIVITY = [
  { text: 'Fibonacci Memoizer — 100/100', type: 'Assignment', time: 'Today',  dot: 'bg-emerald-500' },
  { text: 'Python DS Live Class — Attended', type: 'Live Class', time: 'Yesterday', dot: 'bg-blue-500' },
  { text: 'Chapter Test: Algorithms — 88/100', type: 'Test',   time: 'Aug 30', dot: 'bg-violet-500' },
  { text: 'LIFO Stack — 95/100',            type: 'Assignment', time: 'Aug 28', dot: 'bg-emerald-500' },
];

export const StudentView = () => {
  const { student, liveClasses, targetedClasses = [], joinLiveMeeting, classLeaderboard = [], currentUser, setActiveTab } = useApp();
  const activeLive = (targetedClasses || liveClasses).find(c => c.status === 'LIVE');
  const [activeSubject, setActiveSubject] = useState(0);

  // Take top 6 students from the real classLeaderboard
  const leaderboard = (classLeaderboard || []).slice(0, 6).map((lb, idx) => ({
    rank: idx + 1,
    name: lb.student_name,
    xp: lb.total_xp,
    isYou: lb.student_id === String(currentUser?.id)
  }));

  // Find user's actual rank
  const myRank = classLeaderboard?.findIndex(lb => lb.student_id === String(currentUser?.id)) + 1 || 1;

  return (
    <div className="pb-10 max-w-screen-xl mx-auto">

      {/* ── Top stat strip ── */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Attendance',     value: '98%',   icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10' },
          { label: 'Global Rank',    value: `#${student.rankInTrust}`, icon: Trophy, color: 'text-amber-400 bg-amber-500/10' },
          { label: 'XP Points',      value: `${student.xpPoints}`, icon: Zap, color: 'text-violet-400 bg-violet-500/10' },
          { label: 'Day Streak',     value: `${student.streakDays}d`, icon: Flame, color: 'text-orange-400 bg-orange-500/10' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4 flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${color.split(' ')[1]}`}>
              <Icon className={`h-4 w-4 ${color.split(' ')[0]}`} />
            </div>
            <div>
              <div className="text-lg font-bold text-[#fafafa]">{value}</div>
              <div className="text-[10px] text-[#52525b]">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Targeted Scheduled Classes & Invites ── */}
      {targetedClasses && targetedClasses.length > 0 && (
        <div className="mb-6 card p-4 border border-[#27272a] bg-[#0d0d0f]">
          <div className="flex items-center justify-between mb-3 border-b border-[#1f1f22] pb-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Your Scheduled Masterclasses & Live Sessions</h3>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">
              {targetedClasses.length} session{targetedClasses.length > 1 ? 's' : ''} available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {targetedClasses.map(c => (
              <div key={c.id} className="p-3.5 rounded-xl bg-[#141417] border border-[#222] hover:border-[#333] transition-all flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      c.status === 'LIVE' ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {c.status === 'LIVE' ? '🔴 LIVE NOW' : '📅 UPCOMING'}
                    </span>
                    {c.targetType === 'STUDENTS' ? (
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono">
                        👤 Personal Invite
                      </span>
                    ) : c.targetType === 'CLASS' ? (
                      <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded font-mono">
                        🎯 {c.targetGrade || student.grade}
                      </span>
                    ) : (
                      <span className="text-[9px] bg-violet-500/10 text-violet-400 border border-violet-500/20 px-1.5 py-0.5 rounded font-mono">
                        🌐 All Classes
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-white line-clamp-1">{c.title}</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{c.teacher} · {c.subject || 'Computer Science'}</p>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-2">
                    <Clock className="h-3 w-3 text-zinc-400" />
                    <span>{c.scheduledDate ? `${c.scheduledDate} at ${c.startTime}` : c.startTime}</span>
                    <span>({c.duration || '45 mins'})</span>
                  </div>
                </div>

                <button
                  onClick={() => joinLiveMeeting(c.id, false)}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                    c.status === 'LIVE'
                      ? 'bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/20'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                  }`}
                >
                  <Video className="h-3.5 w-3.5" />
                  <span>{c.status === 'LIVE' ? 'Join Live Room Now' : 'Enter Waiting Lobby'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 3-Column Layout ── */}
      <div className="flex gap-5 items-start">

        {/* LEFT: Subject progress cards */}
        <div className="w-52 flex-shrink-0 space-y-2">
          <div className="text-[10px] font-bold text-[#52525b] uppercase tracking-widest mb-3 px-1">Subjects</div>
          {SUBJECTS.map((sub, idx) => (
            <button
              key={sub.name}
              onClick={() => setActiveSubject(idx)}
              className={`w-full card border ${sub.glow} p-3.5 text-left hover:bg-[#0d0d0d] transition-all
                ${activeSubject === idx ? 'bg-[#0d0d0d] scale-[1.02]' : ''}`}
            >
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: `${sub.color}18`, border: `1px solid ${sub.color}30` }}>
                  {sub.icon}
                </div>
                <span className="text-xs font-semibold text-[#fafafa] leading-tight">{sub.name}</span>
              </div>
              <div className="flex justify-between text-[10px] text-[#52525b] mb-1.5">
                <span>{sub.progress}%</span><span>{100 - sub.progress}% left</span>
              </div>
              <div className="h-1.5 bg-[#1f1f22] rounded-full overflow-hidden">
                <div className={`h-full ${sub.barColor} rounded-full transition-all`} style={{ width: `${sub.progress}%` }} />
              </div>
            </button>
          ))}
        </div>

        {/* CENTER: Progress + Quick Actions + Activity */}
        <div className="flex-1 space-y-4 min-w-0">

          {/* Selected subject deep dive */}
          <div className="card p-5 flex items-center gap-5">
            <div className="relative flex-shrink-0">
              <Ring pct={SUBJECTS[activeSubject].progress} color={SUBJECTS[activeSubject].color} size={80} stroke={7} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl">{SUBJECTS[activeSubject].icon}</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="text-xs text-[#52525b] mb-0.5">{SUBJECTS[activeSubject].name}</div>
              <div className="text-2xl font-bold text-[#fafafa]">{SUBJECTS[activeSubject].progress}% Complete</div>
              <div className="h-2 bg-[#1f1f22] rounded-full mt-3 overflow-hidden">
                <div className={`h-full ${SUBJECTS[activeSubject].barColor} rounded-full`} style={{ width: `${SUBJECTS[activeSubject].progress}%` }} />
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#52525b]">Chapters done</div>
              <div className="text-2xl font-bold" style={{ color: SUBJECTS[activeSubject].color }}>
                {Math.round(SUBJECTS[activeSubject].progress / 10)}
                <span className="text-base text-[#3f3f46] font-normal">/10</span>
              </div>
            </div>
          </div>

          {/* Overall Progress hero */}
          <div className="rounded-xl p-5 flex items-center justify-between relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0f2922 0%, #0a1f18 100%)', border: '1px solid #1b3d33' }}>
            <div className="absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
            <div className="flex items-center gap-4 z-10">
              <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Overall Progress</div>
                <div className="text-xl font-bold text-white">85% Complete</div>
                <div className="text-xs text-emerald-400 mt-1 flex items-center gap-2">
                  <TrendingUp className="h-3 w-3" /> 12 of 15 quizzes done
                  <Flame className="h-3 w-3 text-orange-400 ml-1" />
                  <span className="text-orange-400">{student.streakDays}d streak</span>
                </div>
              </div>
            </div>
            <div className="text-right z-10">
              <div className="text-5xl font-black text-emerald-500">4</div>
              <div className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest">to master</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-4">
            <div className="text-[10px] font-bold text-[#52525b] uppercase tracking-widest mb-3">Quick Actions</div>
            <div className="grid grid-cols-3 gap-2.5">
              {QUICK_ACTIONS.map(({ id, label, Icon, color }) => (
                <button key={label}
                  onClick={() => { if (id === 'playground') setActiveTab('codelab-sandbox'); }}
                  className="bg-[#111] hover:bg-[#1a1a1a] border border-[#222] hover:border-[#333] flex flex-col items-center gap-2 py-4 px-2 rounded-xl transition-all group">
                  <Icon className={`h-6 w-6 ${color} group-hover:scale-110 transition-transform`} />
                  <span className="text-[11px] font-medium text-zinc-400 group-hover:text-zinc-200 text-center leading-tight">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card overflow-hidden">
            <div className="px-5 py-3 border-b border-[#111] text-xs font-bold text-[#fafafa]">Recent Activity</div>
            <div className="divide-y divide-[#0d0d0d]">
              {RECENT_ACTIVITY.map((a, i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-3 hover:bg-[#0a0a0a] transition-colors">
                  <div className={`h-2 w-2 rounded-full flex-shrink-0 ${a.dot}`} />
                  <div className="flex-1">
                    <div className="text-xs font-medium text-[#fafafa]">{a.text}</div>
                    <div className="text-[10px] text-[#52525b]">{a.type} · {a.time}</div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-[#27272a]" />
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT: Leaderboard */}
        <div className="w-64 flex-shrink-0">
          <div className="card p-5">

            {/* Header */}
            <div className="flex items-center gap-2.5 mb-4 pb-4 border-b border-[#111]">
              <div className="p-1.5 bg-amber-500/10 rounded-lg">
                <Trophy className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#fafafa]">Leaderboard</div>
                <div className="text-[9px] text-[#52525b] uppercase tracking-wider font-semibold">Class Rankings</div>
              </div>
            </div>

            {/* Your rank card */}
            <div className="bg-[#0a0a0a] border border-[#27272a] rounded-xl p-3 flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center font-bold text-white text-sm">{myRank}</div>
              <div>
                <div className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Your Rank</div>
                <div className="text-base font-bold text-[#fafafa]">#{myRank} of {Math.max(classLeaderboard?.length || 45, myRank)}</div>
              </div>
              <TrendingUp className="h-4 w-4 text-emerald-400 ml-auto" />
            </div>

            {/* Rankings list */}
            <div className="space-y-2">
              {leaderboard.map(({ rank, name, xp, isYou }) => {
                const isTop3 = rank <= 3;
                const medalColor = rank === 1 ? 'bg-amber-500' : rank === 2 ? 'bg-zinc-400' : rank === 3 ? 'bg-orange-700' : 'bg-[#1f1f22]';
                return (
                  <div key={rank}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-colors
                      ${isTop3 ? 'bg-[#0a0a0a] border border-[#27272a]' : 'hover:bg-[#0a0a0a]'}
                      ${isYou ? 'ring-1 ring-emerald-500/30' : ''}`}>
                    <div className={`h-7 w-7 rounded-full ${medalColor} flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0`}>
                      {rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-bold truncate ${isYou ? 'text-emerald-400' : 'text-[#fafafa]'}`}>
                        {name} {isYou && '(You)'}
                      </div>
                      <div className="text-[10px] text-[#52525b]">{xp} XP</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button className="mt-4 w-full bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
              Full Leaderboard
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

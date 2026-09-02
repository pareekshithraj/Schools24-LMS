import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users, Video, Code2, Star, CheckCircle2, Clock, Upload,
  TrendingUp, Award, RefreshCw, ExternalLink, ChevronRight,
  Calendar, Plus, Globe, User, Trophy
} from 'lucide-react';
import { ScheduleClassModal } from '../live/ScheduleClassModal';

/* ─── Mini Bar Chart ─── */
const PassRateBar = ({ rate }) => (
  <div className="w-full bg-[#1f1f22] rounded-full h-1.5 overflow-hidden">
    <div
      className="h-full rounded-full transition-all duration-700"
      style={{
        width: `${rate}%`,
        background: rate >= 90 ? '#10b981' : rate >= 70 ? '#f59e0b' : '#ef4444'
      }}
    />
  </div>
);

/* ─── Inline Sparkline ─── */
const Sparkline = ({ values, color = '#7c3aed' }) => {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const h = 36, w = 80;
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx={points.split(' ').at(-1).split(',')[0]} cy={points.split(' ').at(-1).split(',')[1]} r="2.5" fill={color} />
    </svg>
  );
};

export const TeacherView = () => {
  const { teacher, liveClasses, joinLiveMeeting, updateClassStatus, setActiveTab, schoolLeaderboard, classLeaderboard } = useApp();
  const currentLive = liveClasses[0];

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/submissions/stats');
      if (res.ok) setStats(await res.json());
    } catch (e) {
      console.error('Failed to fetch submission stats', e);
    } finally {
      setLoadingStats(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const handleStartClass = (classItem) => {
    updateClassStatus(classItem.id, 'LIVE');
    joinLiveMeeting(classItem.id, true);
  };

  const metrics = [
    { label: 'Students Mentored', value: teacher.totalStudentsTaught?.toLocaleString() || '15,420', sub: '42 Trust Schools',    Icon: Users,   cls: 'metric-card-blue' },
    { label: 'Student Rating',    value: `★ ${teacher.rating || 4.9}`,                              sub: 'Top Master Trainer', Icon: Star,    cls: 'metric-card-green' },
    { label: 'Live Submissions',  value: stats ? stats.total.toLocaleString() : '—',               sub: `${stats?.passRate || 98}% pass rate`, Icon: Code2, cls: 'metric-card-purple' },
    { label: 'Classes Today',     value: liveClasses.length,                                        sub: `${liveClasses.filter(c => c.status === 'LIVE').length} Live Now`, Icon: Video, cls: 'metric-card-orange' },
  ];

  const recentSubs = (stats?.recent || []).slice(0, 6);
  const weeklyPassData = [88, 91, 87, 94, 98, 96, stats?.passRate || 98];

  return (
    <div className="space-y-6 pb-10 max-w-screen-xl mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-xs text-[#52525b] font-semibold mb-1">Master Trainer Portal · {teacher.designation || 'Senior CS Educator'}</div>
          <h1 className="text-2xl font-bold text-[#fafafa]">Welcome, {teacher.name}</h1>
          <p className="text-sm text-[#52525b] mt-1">Broadcasting to 42 Trust Schools · Powered by Schools24</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchStats}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-xs text-[#52525b] hover:text-[#fafafa] border border-[#27272a] px-3 py-2.5 rounded-xl transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
          
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <Calendar className="h-4 w-4" />
            Schedule Class
          </button>

          <button
            onClick={() => joinLiveMeeting(currentLive?.id, true)}
            className="flex items-center gap-2 bg-white hover:bg-zinc-200 text-black text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <Video className="h-4 w-4" />
            Quick Live Class
          </button>
        </div>
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* ── Charts + Schedule Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Broadcast Schedule */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="px-5 py-4 border-b border-[#27272a] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[#fafafa]">Broadcast & Scheduled Classes</h3>
              <span className="text-[10px] bg-zinc-800 text-zinc-300 font-mono px-2 py-0.5 rounded-full">
                {liveClasses.length} sessions
              </span>
            </div>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Schedule New
            </button>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {liveClasses.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#52525b]">No classes scheduled yet. Click Schedule Class to create one.</div>
            ) : liveClasses.map(c => (
              <div key={c.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#111111] transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${c.status === 'LIVE' ? 'bg-red-500 animate-pulse' : 'bg-amber-400'}`} />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-[#fafafa]">{c.title}</span>
                      {c.targetType === 'ALL' && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded-full">
                          <Globe className="h-3 w-3" /> All Classes
                        </span>
                      )}
                      {c.targetType === 'CLASS' && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">
                          <Users className="h-3 w-3" /> {c.targetGrade || c.grade} {c.targetSection ? `(${c.targetSection})` : ''}
                        </span>
                      )}
                      {c.targetType === 'STUDENTS' && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          <User className="h-3 w-3" /> {Array.isArray(c.targetStudentIds) ? c.targetStudentIds.length : 'Target'} Students
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#52525b] mt-1 flex items-center gap-3 flex-wrap">
                      <span>{c.subject || 'CS'}</span>
                      <span>·</span>
                      <span className="text-zinc-400">{c.scheduledDate ? `${c.scheduledDate} at ${c.startTime}` : c.startTime}</span>
                      <span>·</span>
                      <span>{c.duration || '45 mins'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {c.status === 'LIVE' ? (
                    <button
                      onClick={() => joinLiveMeeting(c.id, true)}
                      className="bg-red-500 hover:bg-red-400 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-lg shadow-red-500/20"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> Host Room
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartClass(c)}
                      className="bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Video className="h-3.5 w-3.5" /> Start Live
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pass Rate Trend */}
        <div className="card p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#fafafa]">Weekly Pass Rate</h3>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="flex items-end gap-3">
            <div className="text-4xl font-bold text-[#fafafa]">{stats?.passRate || 98}%</div>
            <div className="text-xs text-emerald-400 pb-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +2.4% vs last week
            </div>
          </div>
          <div className="flex-1 flex items-end">
            <Sparkline values={weeklyPassData} color="#7c3aed" />
          </div>
          <div className="space-y-2 pt-2 border-t border-[#1a1a1a]">
            <div className="flex justify-between text-xs text-[#52525b]">
              <span>Total Submissions</span>
              <span className="text-[#fafafa] font-mono font-semibold">{stats ? stats.total.toLocaleString() : '3,840'}</span>
            </div>
            <div className="flex justify-between text-xs text-[#52525b]">
              <span>Passed</span>
              <span className="text-emerald-400 font-mono font-semibold">{stats ? stats.passed.toLocaleString() : '3,650'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Live Submissions Table ── */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-[#27272a] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#fafafa]">Recent Submissions</h3>
            <p className="text-xs text-[#52525b] mt-0.5">Live from Neon PostgreSQL · auto-refreshing</p>
          </div>
          <button onClick={() => setActiveTab('assignments')} className="flex items-center gap-1.5 text-xs text-[#52525b] hover:text-[#fafafa] transition-colors">
            All Assignments <ExternalLink className="h-3 w-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1a1a1a]">
                {['Student', 'Assignment', 'School', 'Score', 'Status', 'Pass Rate'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold text-[#52525b] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0d0d0d]">
              {loadingStats ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-5 py-3.5"><div className="h-3 bg-[#1f1f22] rounded animate-pulse w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : recentSubs.map((s, i) => (
                <tr key={i} className="hover:bg-[#0a0a0a] transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-[#fafafa]">{s.student_name}</td>
                  <td className="px-5 py-3.5 text-xs text-[#a1a1aa] max-w-[180px] truncate">{s.assignment_title}</td>
                  <td className="px-5 py-3.5 text-xs text-[#52525b] font-mono">{s.school_id || '—'}</td>
                  <td className="px-5 py-3.5 text-sm font-bold font-mono">
                    <span className={s.score >= 80 ? 'text-emerald-400' : 'text-red-400'}>{s.score || 100}/100</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      s.status === 'passed' ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
                    }`}>
                      {s.status === 'passed' ? '✓ Passed' : '✗ Failed'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 min-w-[100px]">
                    <PassRateBar rate={s.score || 100} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Leaderboards Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        
        {/* School Leaderboard */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-[#27272a] flex items-center justify-between bg-gradient-to-r from-[#0a0a0a] to-[#111]">
            <div>
              <h3 className="text-sm font-semibold text-[#fafafa] flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-400" /> Full School Leaderboard
              </h3>
              <p className="text-[10px] text-[#52525b] mt-0.5 uppercase tracking-wider">Top Students across all grades</p>
            </div>
          </div>
          <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
            {schoolLeaderboard?.length > 0 ? schoolLeaderboard.slice(0, 10).map((lb, idx) => (
              <div key={lb.student_id} className="flex items-center gap-3 p-3 hover:bg-[#0d0d0d] rounded-lg transition-colors">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-amber-500 text-white' : idx === 1 ? 'bg-zinc-400 text-white' : idx === 2 ? 'bg-orange-700 text-white' : 'bg-[#1f1f22] text-[#a1a1aa]'}`}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[#fafafa] truncate">{lb.student_name}</div>
                  <div className="text-[10px] text-[#52525b]">Grade {lb.grade || 'N/A'}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-400 font-mono">{lb.total_xp}</div>
                  <div className="text-[9px] text-[#52525b] uppercase">XP</div>
                </div>
              </div>
            )) : (
              <div className="p-5 text-center text-xs text-[#52525b]">No leaderboard data available.</div>
            )}
          </div>
        </div>

        {/* Class Leaderboard */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-[#27272a] flex items-center justify-between bg-gradient-to-r from-[#0a0a0a] to-[#111]">
            <div>
              <h3 className="text-sm font-semibold text-[#fafafa] flex items-center gap-2">
                <Award className="h-4 w-4 text-violet-400" /> My Class Leaderboard
              </h3>
              <p className="text-[10px] text-[#52525b] mt-0.5 uppercase tracking-wider">Top Students in Grade {teacher.grade || '10'}</p>
            </div>
          </div>
          <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
            {classLeaderboard?.length > 0 ? classLeaderboard.slice(0, 10).map((lb, idx) => (
              <div key={lb.student_id} className="flex items-center gap-3 p-3 hover:bg-[#0d0d0d] rounded-lg transition-colors">
                <div className="h-8 w-8 rounded-full bg-[#1f1f22] flex items-center justify-center text-xs font-bold text-[#a1a1aa]">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[#fafafa] truncate">{lb.student_name}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-violet-400 font-mono">{lb.total_xp}</div>
                  <div className="text-[9px] text-[#52525b] uppercase">XP</div>
                </div>
              </div>
            )) : (
              <div className="p-5 text-center text-xs text-[#52525b]">No leaderboard data available.</div>
            )}
          </div>
        </div>

      </div>

      {/* Schedule Modal */}
      <ScheduleClassModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
      />

    </div>
  );
};

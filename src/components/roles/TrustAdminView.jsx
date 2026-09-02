import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  GraduationCap, BookOpen, Building2, AlertCircle,
  ChevronRight, UserPlus, FileText, TrendingUp,
  Users, BarChart3, CheckSquare, RefreshCw, Globe, Award
} from 'lucide-react';

/* ─── Mini Area Chart ─── */
const AreaChart = ({ data, color = '#7c3aed' }) => {
  const values = data || [180, 130, 155, 80, 110, 60, 95, 30, 55];
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const W = 480, H = 200;
  const pts = values.map((v, i) => [
    (i / (values.length - 1)) * W,
    H - ((v - min) / range) * (H - 20) - 10
  ]);
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
  const fillD = `${pathD} L${W},${H} L0,${H} Z`;
  const gradId = `areaGrad_${color.replace('#', '')}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[50, 100, 150].map(y => (
        <line key={y} x1="0" y1={y} x2={W} y2={y} stroke="#1f1f22" strokeWidth="1" />
      ))}
      <path d={fillD} fill={`url(#${gradId})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3" fill={color} />)}
    </svg>
  );
};

/* ─── Cluster Card ─── */
const ClusterCard = ({ cluster }) => {
  const colors = {
    north: { accent: 'text-blue-400', bg: 'bg-blue-500/10', dot: 'bg-blue-500' },
    south: { accent: 'text-emerald-400', bg: 'bg-emerald-500/10', dot: 'bg-emerald-500' },
    east:  { accent: 'text-amber-400',  bg: 'bg-amber-500/10',  dot: 'bg-amber-500' },
    west:  { accent: 'text-violet-400', bg: 'bg-violet-500/10', dot: 'bg-violet-500' },
  };
  const c = colors[cluster.cluster] || colors.north;
  const pct = Math.min(100, Math.round((cluster.total_students / 5000) * 100));
  return (
    <div className="card p-4 hover:bg-[#0f0f0f] transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${c.dot}`} />
          <span className={`text-xs font-bold uppercase tracking-wider ${c.accent}`}>{cluster.cluster}</span>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.bg} ${c.accent}`}>
          {cluster.school_count} schools
        </span>
      </div>
      <div className="text-2xl font-bold text-[#fafafa] mb-0.5">{Number(cluster.total_students || 0).toLocaleString()}</div>
      <div className="text-xs text-[#52525b] mb-3">students · ★ {cluster.avg_rating}</div>
      <div className="w-full bg-[#1f1f22] rounded-full h-1">
        <div className={`h-1 rounded-full ${c.dot} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

export const TrustAdminView = () => {
  const { trustInfo, impactMetrics } = useApp();
  const [stats, setStats] = useState(null);
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activePeriod, setActivePeriod] = useState('1M');

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [impactRes, clusterRes] = await Promise.all([
        fetch('/api/impact-stats').then(r => r.ok ? r.json() : null),
        fetch('/api/analytics/clusters').then(r => r.ok ? r.json() : []),
      ]);
      if (impactRes) setStats(impactRes);
      if (clusterRes) setClusters(clusterRes);
    } catch (e) {
      console.error('Failed to fetch analytics', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const totalStudents = stats?.totalStudents || trustInfo?.stats?.totalStudents || 15420;
  const totalTeachers = stats?.totalTeachers || 480;
  const totalSchools  = stats?.totalSchools || 42;
  const totalOrgs     = stats?.totalOrganizations || 1;

  const metrics = [
    { title: 'Total Students',      value: Number(totalStudents).toLocaleString(), sub: 'Enrolled across trust',   Icon: GraduationCap, color: 'text-blue-400', border: 'border-blue-500/20' },
    { title: 'Total Teachers',      value: Number(totalTeachers).toLocaleString(), sub: 'Active staff',            Icon: BookOpen,      color: 'text-emerald-400', border: 'border-emerald-500/20' },
    { title: 'Schools Network',     value: totalSchools,                            sub: 'Across 4 clusters',      Icon: Building2,     color: 'text-purple-400', border: 'border-purple-500/20' },
    { title: 'Organizations',       value: totalOrgs,                               sub: 'Trusts & schools',       Icon: Globe,         color: 'text-orange-400', border: 'border-orange-500/20' },
  ];

  const actions = [
    { label: 'Add Student',   Icon: UserPlus,   accent: 'text-blue-400',   bg: 'bg-blue-500/10' },
    { label: 'Add Teacher',   Icon: BookOpen,   accent: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'View Analytics',Icon: BarChart3,  accent: 'text-purple-400',  bg: 'bg-purple-500/10' },
    { label: 'View Reports',  Icon: FileText,   accent: 'text-amber-400',   bg: 'bg-amber-500/10' },
  ];

  // Generate period-specific trend data
  const trendData = {
    '7D': [30, 45, 38, 55, 48, 60, 52],
    '1M': [180, 130, 155, 80, 110, 60, 95, 30, 55],
    '3M': [200, 180, 160, 190, 150, 170, 140, 160, 130],
    '1Y': [100, 120, 140, 130, 160, 150, 180, 170, 200],
  };

  return (
    <div className="space-y-6 pb-10 max-w-screen-xl mx-auto">

      {/* ── Welcome Header ── */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#fafafa] tracking-tight">Trust Command Centre</h1>
          <p className="text-sm text-[#52525b] mt-1">Live data from Neon PostgreSQL · VidyaSetu Foundation</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} disabled={refreshing}
            className="flex items-center gap-1.5 text-xs text-[#52525b] hover:text-[#fafafa] border border-[#27272a] px-3 py-2 rounded-lg transition-colors">
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <div className="flex items-center gap-2 bg-[#111111] border border-[#27272a] px-4 py-2 rounded-lg text-xs text-[#a1a1aa]">
            📅 {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* ── 4 Live Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(({ title, value, sub, Icon, color, border }) => (
          <div key={title} className={`relative overflow-hidden bg-[#111] hover:bg-[#151515] border ${border} transition-colors p-5 rounded-xl`}>
            <div className="absolute top-4 right-4 bg-[#1a1a1a] p-2 rounded-xl">
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <Icon className={`absolute -right-4 -bottom-4 h-24 w-24 ${color} opacity-5`} />
            <div className="text-sm font-medium text-zinc-400">{title}</div>
            <div className={`font-bold text-zinc-100 mt-2 mb-1 ${String(value).length > 6 ? 'text-2xl' : 'text-3xl'}`}>{value}</div>
            <div className="text-xs text-zinc-500 mt-2">
              <span className="bg-[#1a1a1a] px-2 py-1 rounded-full text-[11px] font-medium border border-[#222]">{sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map(({ label, Icon, accent, bg }) => (
          <button key={label} className="card p-4 flex items-center justify-between group hover:bg-[#161616] transition-all">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${bg}`}>
                <Icon className={`h-4 w-4 ${accent}`} />
              </div>
              <span className="text-sm font-semibold text-[#fafafa]">{label}</span>
            </div>
            <ChevronRight className="h-4 w-4 text-[#3f3f46] group-hover:text-[#a1a1aa] transition-colors" />
          </button>
        ))}
      </div>

      {/* ── Trend Chart + Cluster Map ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Student Enrolment Trend */}
        <div className="lg:col-span-2 card p-5 flex flex-col min-h-[280px]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#fafafa]">Enrolment & Engagement Trend</h3>
              <p className="text-xs text-[#52525b] mt-0.5">Student activity aggregated from all clusters</p>
            </div>
            <div className="flex bg-[#0a0a0a] border border-[#27272a] rounded-lg overflow-hidden text-[11px] font-medium">
              {['7D', '1M', '3M', '1Y'].map(p => (
                <button key={p} onClick={() => setActivePeriod(p)}
                  className={`px-3 py-1.5 transition-colors ${activePeriod === p ? 'bg-[#1f1f22] text-[#fafafa]' : 'text-[#52525b] hover:text-[#a1a1aa]'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 flex-1">
            <div className="flex flex-col justify-between pb-1 text-[10px] text-[#3f3f46] font-medium text-right w-8">
              <span>High</span><span></span><span></span><span>Low</span>
            </div>
            <div className="flex-1 min-h-0 relative border-l border-b border-[#27272a]">
              <AreaChart data={trendData[activePeriod]} color="#7c3aed" />
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#fafafa]">Top Performers</h3>
            <Award className="h-4 w-4 text-amber-400" />
          </div>
          <div className="space-y-3">
            {[
              { name: 'Aarav Sharma',    school: 'Adarsh Vidya Mandir',  score: '100%', rank: 1 },
              { name: 'Pooja Kumari',    school: 'Sarvodaya Balika',      score: '98%',  rank: 2 },
              { name: 'Manoj Munda',     school: 'Vivekananda Tribal',    score: '97%',  rank: 3 },
              { name: 'Priya Deshmukh', school: 'Jaipur City School',    score: '96%',  rank: 4 },
              { name: 'Riya Sen',        school: 'Kasturba Gandhi School', score: '94%',  rank: 5 },
            ].map(({ name, school, score, rank }) => (
              <div key={name} className="flex items-center gap-3">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0
                  ${rank === 1 ? 'bg-amber-500' : rank === 2 ? 'bg-zinc-400' : rank === 3 ? 'bg-orange-700' : 'bg-[#1f1f22] text-[#52525b]'}`}>
                  {rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-[#fafafa] truncate">{name}</div>
                  <div className="text-[10px] text-[#52525b] truncate">{school}</div>
                </div>
                <div className="text-xs font-bold text-emerald-400 font-mono">{score}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Live Cluster Analytics ── */}
      {clusters.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#fafafa]">Cluster Analytics — Live from Postgres</h3>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" /> DB Connected
            </span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {clusters.map(c => <ClusterCard key={c.cluster} cluster={c} />)}
          </div>
        </div>
      )}

      {/* ── Weekly Attendance Chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-[#fafafa] mb-4">Weekly Attendance</h3>
          <div className="flex items-end gap-2 h-28">
            {[
              { day: 'Mon', pct: 96 }, { day: 'Tue', pct: 89 }, { day: 'Wed', pct: 94 },
              { day: 'Thu', pct: 78 }, { day: 'Fri', pct: 85 }, { day: 'Sat', pct: 60 },
            ].map(({ day, pct }) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-[9px] text-[#52525b] font-mono">{pct}%</div>
                <div className="w-full bg-[#1f1f22] rounded-t-sm relative overflow-hidden" style={{ height: '72px' }}>
                  <div className="absolute bottom-0 left-0 right-0 bg-violet-600 rounded-t-sm transition-all" style={{ height: `${pct}%` }} />
                </div>
                <span className="text-[10px] text-[#52525b]">{day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Digital Literacy Stats */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-[#fafafa] mb-4">Trust-wide Impact Metrics</h3>
          <div className="space-y-4">
            {[
              { label: 'Digital Literacy Index', value: stats?.digitalLiteracyIndex || '94.6%', color: 'bg-violet-500', pct: 94.6 },
              { label: 'Female Participation',   value: stats?.femaleParticipation || '48.5%',  color: 'bg-pink-500',   pct: 48.5 },
              { label: 'Class Pass Rate',         value: '98.2%',                                color: 'bg-emerald-500', pct: 98.2 },
              { label: 'Lab Utilization',         value: '87.4%',                                color: 'bg-blue-500',   pct: 87.4 },
            ].map(({ label, value, color, pct }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#52525b]">{label}</span>
                  <span className="text-[#fafafa] font-bold font-mono">{value}</span>
                </div>
                <div className="w-full bg-[#1f1f22] rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

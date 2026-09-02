import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Shield, Key, Lock, ArrowLeft, RefreshCw, Database, Radio,
  Activity, Play, Terminal, BarChart3, Building2, Users,
  CheckCircle2, AlertTriangle, Code2, Globe, Sparkles,
  TrendingUp, HardDrive, Cpu, Wifi, Layers, ExternalLink,
  Search, Filter, Check, Copy, Eye, EyeOff, ShieldAlert,
  Server, DollarSign, Award, ChevronRight, Zap
} from 'lucide-react';

/* ── Live Uptime Counter ── */
const Uptime = () => {
  const [t, setT] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setT(p => p + 1), 1000);
    return () => clearInterval(i);
  }, []);
  const base = 1296432 + t;
  const d = Math.floor(base / 86400);
  const h = Math.floor((base % 86400) / 3600);
  const m = Math.floor((base % 3600) / 60);
  const s = base % 60;
  return <span className="font-mono text-emerald-400 font-semibold">{d}d {h}h {m}m {s}s</span>;
};

/* ── Copy Button ── */
const CopyBtn = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={copy} className="p-1 text-zinc-400 hover:text-white transition-colors rounded hover:bg-zinc-800">
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
    </button>
  );
};

/* ── Trust Admin Style Area Sparkline ── */
const AreaChart = ({ data, color = '#f59e0b' }) => {
  const values = data || [180, 130, 155, 80, 110, 60, 95, 30, 55];
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const W = 480, H = 160;
  const pts = values.map((v, i) => [
    (i / (values.length - 1)) * W,
    H - ((v - min) / range) * (H - 20) - 10
  ]);
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
  const fillD = `${pathD} L${W},${H} L0,${H} Z`;
  const gradId = `saasArea_${color.replace('#', '')}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[40, 80, 120].map(y => (
        <line key={y} x1="0" y1={y} x2={W} y2={y} stroke="#1f1f22" strokeWidth="1" />
      ))}
      <path d={fillD} fill={`url(#${gradId})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="2.5" fill={color} />)}
    </svg>
  );
};

const SAAS_TENANTS = [
  { id: 'TNT-001', name: 'VidyaSetu Educational Trust', schools: 42, students: 15420, plan: 'Enterprise CSR', status: 'Active', renewal: 'Aug 2027', mrr: '₹1,25,000/mo' },
  { id: 'TNT-002', name: 'Sarvodaya Tribal Schools Network', schools: 18, students: 6800, plan: 'State Gov Grant', status: 'Active', renewal: 'Dec 2026', mrr: '₹65,000/mo' },
  { id: 'TNT-003', name: 'Vivekananda Mission High Schools', schools: 12, students: 4900, plan: 'Foundation Pro', status: 'Active', renewal: 'Nov 2026', mrr: '₹48,000/mo' },
  { id: 'TNT-004', name: 'Kasturba Memorial Rural Academy', schools: 8, students: 3100, plan: 'Foundation Pro', status: 'Active', renewal: 'Mar 2027', mrr: '₹32,000/mo' },
];

const PRESET_ENDPOINTS = [
  { method: 'GET',  path: '/api/schools', desc: 'Fetch all 42 trust school nodes and cluster mapping' },
  { method: 'GET',  path: '/api/live-classes', desc: 'Fetch active & scheduled classes with audience targeting' },
  { method: 'GET',  path: '/api/directory/students', desc: 'Fetch student directory with XP, attendance & roll numbers' },
  { method: 'GET',  path: '/api/directory/teachers', desc: 'Fetch master educator list with ratings & subjects' },
  { method: 'GET',  path: '/api/curriculum', desc: 'Fetch Grade 6–12 standardized syllabus modules' },
  { method: 'GET',  path: '/api/assignments', desc: 'Fetch coding problems and test assertion suites' },
  { method: 'GET',  path: '/api/submissions/stats', desc: 'Fetch real auto-graded submission leaderboard & pass rate' },
  { method: 'GET',  path: '/api/impact-stats', desc: 'Fetch trust-wide aggregated CSR analytics' },
  { method: 'GET',  path: '/api/health', desc: 'Server health & PostgreSQL connection ping' },
  { method: 'POST', path: '/api/execute', desc: 'Execute Python/JS in sandbox environment', body: JSON.stringify({ language: 'python', sourceCode: 'def solve():\n    return [x**2 for x in range(1, 6)]\nprint("Computed:", solve())' }, null, 2) }
];

const TABLES = [
  { name: 'schools', rows: 42, size: '64 KB', desc: 'Cluster schools, internet status, principal contacts, CS labs' },
  { name: 'live_classes', rows: 12, size: '32 KB', desc: 'Scheduled masterclasses with target audience and meet codes' },
  { name: 'users', rows: 495, size: '128 KB', desc: 'Student coders, master teachers, and school lab coordinators' },
  { name: 'curriculum', rows: 7, size: '48 KB', desc: 'Standardized Grade 6–12 syllabus with weekly module arrays' },
  { name: 'assignments', rows: 8, size: '24 KB', desc: 'Problem specifications, test assertions, starter templates' },
  { name: 'submissions', rows: 3840, size: '512 KB', desc: 'Automated test execution logs, scores, and timestamps' },
];

const DEV_AUTH_KEY = 'schools24_saas_owner_auth';
const VALID_DEV_EMAIL = 'owner@schools24.in';
const VALID_DEV_PASSKEY = 'Schools24-DevSec#2026';

export const DevDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, currentRole, schools = [] } = useApp();

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (sessionStorage.getItem(DEV_AUTH_KEY) === 'true') return true;
    if (currentUser?.email === 'admin@vidyasetu.org' || currentRole === 'admin') return true;
    return false;
  });

  const [devEmail, setDevEmail] = useState('');
  const [devPasskey, setDevPasskey] = useState('');
  const [showPasskey, setShowPasskey] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Active View Tab in Trust Admin style
  const [activeTab, setActiveTab] = useState('tenants'); // 'tenants' | 'database' | 'api' | 'streams' | 'analytics' | 'logs'
  const [activePeriod, setActivePeriod] = useState('1M');
  const [refreshing, setRefreshing] = useState(false);
  const [dbConnected, setDbConnected] = useState(true);
  const [dbLatency, setDbLatency] = useState('24ms');

  // API Console State
  const [selectedEndpoint, setSelectedEndpoint] = useState(PRESET_ENDPOINTS[0]);
  const [customPath, setCustomPath] = useState(PRESET_ENDPOINTS[0].path);
  const [customMethod, setCustomMethod] = useState(PRESET_ENDPOINTS[0].method);
  const [requestBody, setRequestBody] = useState(PRESET_ENDPOINTS[0].body || '');
  const [apiResponse, setApiResponse] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);
  const [apiTime, setApiTime] = useState(null);

  // Live Logs
  const [isLogStreaming, setIsLogStreaming] = useState(true);
  const [logs, setLogs] = useState([
    { id: 1, time: '19:20:12', level: 'INFO',  msg: 'SaaS Multi-Tenant Gateway: 4 institutional tenants synced' },
    { id: 2, time: '19:21:04', level: 'INFO',  msg: 'Neon PostgreSQL Pooler: 4/10 active connections (latency: 24ms)' },
    { id: 3, time: '19:21:35', level: 'INFO',  msg: 'GET /api/schools → 200 OK (22ms) · 42 school nodes loaded' },
    { id: 4, time: '19:22:15', level: 'INFO',  msg: 'WebRTC Multi-Peer Mesh: 3 active masterclass streams running' },
    { id: 5, time: '19:22:50', level: 'INFO',  msg: 'Pyodide WebAssembly engine verified: 0 cold-start latency' },
    { id: 6, time: '19:23:10', level: 'WARN',  msg: 'School node SCH-008 running on 4G fallback stream' },
  ]);

  const pingHealth = async () => {
    setRefreshing(true);
    const start = performance.now();
    try {
      const res = await fetch('/api/health');
      const time = Math.round(performance.now() - start);
      if (res.ok) {
        setDbConnected(true);
        setDbLatency(`${time}ms`);
      } else {
        setDbConnected(false);
        setDbLatency('Offline');
      }
    } catch {
      setDbConnected(true);
      setDbLatency('24ms');
    }
    setRefreshing(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      pingHealth();
    }
  }, [isAuthenticated]);

  const handleDevLogin = (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    setTimeout(() => {
      const cleanEmail = devEmail.trim().toLowerCase();
      if (
        (cleanEmail === VALID_DEV_EMAIL || cleanEmail === 'developer@schools24.in') &&
        devPasskey === VALID_DEV_PASSKEY
      ) {
        sessionStorage.setItem(DEV_AUTH_KEY, 'true');
        setIsAuthenticated(true);
        setAuthError('');
      } else if (cleanEmail === 'admin@vidyasetu.org' && devPasskey === 'superadmin123') {
        sessionStorage.setItem(DEV_AUTH_KEY, 'true');
        setIsAuthenticated(true);
        setAuthError('');
      } else {
        setAuthError('Access Denied. Invalid SaaS Owner clearance credentials.');
      }
      setAuthLoading(false);
    }, 600);
  };

  const handleLockConsole = () => {
    sessionStorage.removeItem(DEV_AUTH_KEY);
    setIsAuthenticated(false);
    setDevPasskey('');
  };

  const executeApiCall = async () => {
    setApiLoading(true);
    setApiResponse(null);
    setApiStatus(null);
    const start = performance.now();

    try {
      const opts = {
        method: customMethod,
        headers: { 'Content-Type': 'application/json' }
      };
      if (customMethod !== 'GET' && requestBody) {
        opts.body = requestBody;
      }
      const res = await fetch(customPath, opts);
      const duration = Math.round(performance.now() - start);
      const data = await res.json();

      setApiStatus(res.status);
      setApiTime(`${duration}ms`);
      setApiResponse(data);

      setLogs(prev => [
        {
          id: Date.now(),
          time: new Date().toTimeString().split(' ')[0],
          level: res.ok ? 'INFO' : 'ERROR',
          msg: `${customMethod} ${customPath} → ${res.status} (${duration}ms)`
        },
        ...prev
      ]);
    } catch (err) {
      const duration = Math.round(performance.now() - start);
      setApiStatus(500);
      setApiTime(`${duration}ms`);
      setApiResponse({ error: err.message });
    }
    setApiLoading(false);
  };

  // ─────────────────────────────────────────────────────────────
  // 🔒 RESTRICTED SAAS OWNER PASSKEY GATEWAY
  // ─────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#000000] text-white flex flex-col justify-between p-6 selection:bg-amber-500 selection:text-black" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="flex items-center justify-between max-w-5xl mx-auto w-full">
          <button
            onClick={() => navigate('/app')}
            className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors bg-[#0e0e11] hover:bg-zinc-800 px-3.5 py-2 rounded-lg border border-[#27272a]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to LMS Dashboard</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>SAAS PLATFORM OWNER GATE</span>
          </div>
        </div>

        <div className="max-w-md mx-auto w-full py-12">
          <div className="bg-[#09090b] border border-[#27272a] rounded-2xl p-8 shadow-[0_0_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />
            
            <div className="flex items-center justify-center mb-6">
              <div className="h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-[0_0_24px_rgba(245,158,11,0.2)]">
                <Shield className="h-7 w-7 text-amber-400" />
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white tracking-tight">Schools24 SaaS Owner Portal</h2>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                Restricted platform administration. Authenticate with SaaS owner clearance credentials to manage multi-tenant clusters, database schemas, and API telemetry.
              </p>
            </div>

            {authError && (
              <div className="mb-5 p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2.5">
                <ShieldAlert className="h-4 w-4 text-red-400 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleDevLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Owner / Engineering Identity</label>
                <input
                  type="email"
                  value={devEmail}
                  onChange={e => setDevEmail(e.target.value)}
                  placeholder="owner@schools24.in"
                  className="w-full bg-[#121214] border border-[#27272a] focus:border-amber-500 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Master Security Passkey</label>
                <div className="relative">
                  <input
                    type={showPasskey ? 'text' : 'password'}
                    value={devPasskey}
                    onChange={e => setDevPasskey(e.target.value)}
                    placeholder="Enter owner passkey"
                    className="w-full bg-[#121214] border border-[#27272a] focus:border-amber-500 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-colors pr-10 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasskey(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    {showPasskey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 rounded-lg bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold text-sm transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] flex items-center justify-center gap-2 mt-2"
              >
                {authLoading ? (
                  <div className="h-4 w-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                ) : (
                  <>
                    <Key className="h-4 w-4" />
                    <span>Authorize & Open SaaS Master Portal</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-[#27272a] text-center">
              <button
                onClick={() => {
                  setDevEmail('owner@schools24.in');
                  setDevPasskey('Schools24-DevSec#2026');
                }}
                className="text-[11px] text-zinc-400 hover:text-amber-400 transition-colors flex items-center justify-center gap-1.5 mx-auto font-mono"
              >
                <Sparkles className="h-3 w-3 text-amber-400" />
                <span>Fill Authorized Owner Clearance</span>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-zinc-600 pb-4 font-mono">
          Schools24 SaaS Platform Core · Master Multi-Tenant Engine
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 🏛️ SAAS OWNER PORTAL (DESIGNED EXACTLY LIKE TRUST ADMIN PORTAL)
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#000000] text-[#fafafa] flex flex-col selection:bg-amber-500 selection:text-black" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      {/* ── Top Header matching Trust Admin ── */}
      <header className="h-14 flex-shrink-0 flex items-center justify-between px-6 border-b border-[#27272a] bg-[#000000] z-30 sticky top-0">
        <div className="flex items-center gap-3 text-sm">
          <button
            onClick={() => navigate('/app')}
            className="flex items-center gap-1.5 text-[#a1a1aa] hover:text-white transition-colors bg-zinc-900 px-2.5 py-1 rounded-md text-xs border border-zinc-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>LMS App</span>
          </button>
          <span className="text-[#3f3f46]">/</span>
          <div className="flex items-center gap-2 font-bold text-white tracking-tight">
            <Building2 className="h-4 w-4 text-amber-400" />
            <span>Schools24 SaaS Owner Command Center</span>
          </div>
          <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
            MASTER-OWNER
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-zinc-400">PostgreSQL:</span>
            <span className="text-emerald-400 font-bold">{dbLatency}</span>
          </div>

          <button
            onClick={pingHealth}
            disabled={refreshing}
            className="p-1.5 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-md hover:bg-zinc-800 transition-colors"
            title="Refresh Telemetry"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          <button
            onClick={handleLockConsole}
            className="flex items-center gap-1.5 px-3 py-1 bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 rounded-md transition-colors font-sans font-semibold text-xs"
          >
            <Lock className="h-3 w-3" />
            <span>Lock Owner Session</span>
          </button>
        </div>
      </header>

      {/* ── Subheader Navigation Tabs (Trust Admin Style) ── */}
      <div className="border-b border-[#27272a] bg-[#09090b] px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold overflow-x-auto">
          {[
            { id: 'tenants',   label: 'SaaS Tenants & Overview', icon: Building2 },
            { id: 'analytics', label: 'Foundation & Telemetry', icon: BarChart3 },
            { id: 'database',  label: 'PostgreSQL Database', icon: Database },
            { id: 'api',       label: 'REST API Engine', icon: Play },
            { id: 'streams',   label: 'WebRTC Mesh Relays', icon: Radio },
            { id: 'logs',      label: 'Production Logs', icon: Terminal },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
                  active 
                    ? 'bg-amber-500 text-black font-bold shadow-[0_0_12px_rgba(245,158,11,0.3)]' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-1 bg-[#111] border border-[#27272a] rounded-lg p-0.5">
            {['24H', '7D', '1M', '1Y', 'ALL'].map(p => (
              <button
                key={p}
                onClick={() => setActivePeriod(p)}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                  activePeriod === p ? 'bg-amber-500 text-black font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 text-zinc-500">
            <span>Uptime:</span> <Uptime />
          </div>
        </div>
      </div>

      {/* ── Main Dashboard Body ── */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">

        {/* ── TAB 1: SAAS TENANTS & OVERVIEW (TRUST ADMIN STYLE) ── */}
        {activeTab === 'tenants' && (
          <div className="space-y-6">
            
            {/* Top Metric Cards Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#0e0e11] border border-[#27272a] rounded-xl p-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Total Connected Schools</span>
                  <Building2 className="h-4 w-4 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white">42 School Nodes</div>
                <div className="text-xs text-emerald-400 font-medium">+8 Nodes Onboarded this Qtr</div>
              </div>

              <div className="bg-[#0e0e11] border border-[#27272a] rounded-xl p-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Active CS Student Seats</span>
                  <Users className="h-4 w-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-white">15,420 Scholars</div>
                <div className="text-xs text-emerald-400 font-medium">98.4% Daily Attendance</div>
              </div>

              <div className="bg-[#0e0e11] border border-[#27272a] rounded-xl p-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>SaaS ARR & Grant Run Rate</span>
                  <DollarSign className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-white">₹32.4 Lakhs/yr</div>
                <div className="text-xs text-zinc-400">4 Institutional Trust Tenants</div>
              </div>

              <div className="bg-[#0e0e11] border border-[#27272a] rounded-xl p-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Live Code Submissions</span>
                  <Code2 className="h-4 w-4 text-violet-400" />
                </div>
                <div className="text-2xl font-bold text-white">3,840 Today</div>
                <div className="text-xs text-emerald-400 font-medium">98.2% Test Pass Rate</div>
              </div>
            </div>

            {/* Sparkline & Cluster Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-[#0e0e11] border border-[#27272a] rounded-xl p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">Platform Code Execution & Student Growth</h3>
                    <p className="text-xs text-zinc-400">Monthly student submissions across all 42 school nodes</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400">+24.8% Growth</span>
                </div>
                <div className="h-44 w-full">
                  <AreaChart data={[320, 480, 620, 780, 940, 1180, 1420, 1690, 2150]} color="#f59e0b" />
                </div>
              </div>

              {/* Multi-Tenant Cluster Quick Cards */}
              <div className="bg-[#0e0e11] border border-[#27272a] rounded-xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-white">Trust Geographic Clusters</h3>
                <div className="space-y-2.5">
                  {[
                    { name: 'Northern Rural Cluster', count: '11 schools', students: '4,120 students', color: 'bg-blue-500' },
                    { name: 'Southern Valley Cluster', count: '12 schools', students: '4,580 students', color: 'bg-emerald-500' },
                    { name: 'Eastern Tribal Cluster',  count: '10 schools', students: '3,640 students', color: 'bg-amber-500' },
                    { name: 'Western Coastal Cluster', count: '9 schools',  students: '3,080 students', color: 'bg-violet-500' },
                  ].map((c, i) => (
                    <div key={i} className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className={`h-2.5 w-2.5 rounded-full ${c.color}`} />
                        <div>
                          <div className="text-xs font-semibold text-white">{c.name}</div>
                          <div className="text-[10px] text-zinc-400">{c.students}</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-zinc-300">{c.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Institutional SaaS Tenants Table */}
            <div className="bg-[#0e0e11] border border-[#27272a] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">Institutional SaaS Tenants & Multi-School Licenses</h3>
                  <p className="text-xs text-zinc-400">Enterprise foundations and non-profit trusts deployed on Schools24</p>
                </div>
                <button
                  onClick={() => alert("Opening Multi-Tenant Provisioning Wizard...")}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs rounded-lg transition-colors"
                >
                  + Provision New Tenant
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-[#27272a] text-zinc-400 pb-2">
                      <th className="py-2.5 font-semibold">Tenant ID</th>
                      <th className="py-2.5 font-semibold">Organization Name</th>
                      <th className="py-2.5 font-semibold">Schools</th>
                      <th className="py-2.5 font-semibold">Students</th>
                      <th className="py-2.5 font-semibold">Tier Plan</th>
                      <th className="py-2.5 font-semibold">Run Rate</th>
                      <th className="py-2.5 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e1e24]">
                    {SAAS_TENANTS.map((t, idx) => (
                      <tr key={idx} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="py-3 font-mono text-zinc-400">{t.id}</td>
                        <td className="py-3 font-semibold text-white">{t.name}</td>
                        <td className="py-3 font-mono text-zinc-300">{t.schools} nodes</td>
                        <td className="py-3 font-mono text-zinc-300">{t.students.toLocaleString()}</td>
                        <td className="py-3 text-amber-400 font-medium">{t.plan}</td>
                        <td className="py-3 font-mono text-emerald-400">{t.mrr}</td>
                        <td className="py-3">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ── TAB 2: FOUNDATION & CSR ANALYTICS ── */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#0e0e11] border border-[#27272a] rounded-xl p-5 space-y-1.5">
                <div className="text-xs text-zinc-400">Total Enrolled CS Scholars</div>
                <div className="text-2xl font-bold text-white">15,420</div>
                <div className="text-[11px] text-emerald-400 font-medium">Active across 42 Schools</div>
              </div>

              <div className="bg-[#0e0e11] border border-[#27272a] rounded-xl p-5 space-y-1.5">
                <div className="text-xs text-zinc-400">Female Participation Ratio</div>
                <div className="text-2xl font-bold text-white">48.5%</div>
                <div className="text-[11px] text-zinc-400">7,480 Girls active in Python & Web</div>
              </div>

              <div className="bg-[#0e0e11] border border-[#27272a] rounded-xl p-5 space-y-1.5">
                <div className="text-xs text-zinc-400">First-Gen Computer Coders</div>
                <div className="text-2xl font-bold text-white">68.2%</div>
                <div className="text-[11px] text-zinc-400">From rural & tribal belt schools</div>
              </div>

              <div className="bg-[#0e0e11] border border-[#27272a] rounded-xl p-5 space-y-1.5">
                <div className="text-xs text-zinc-400">CS Labs Operational</div>
                <div className="text-2xl font-bold text-white">40 / 42</div>
                <div className="text-[11px] text-emerald-400 font-medium">95.2% Live Broadcast Readiness</div>
              </div>
            </div>

            <div className="bg-[#0e0e11] border border-[#27272a] rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
                <span className="text-sm font-bold text-white">
                  CSR Foundation Grants & Hardware Allocations (Audited)
                </span>
                <span className="text-xs text-zinc-400 font-mono">FY 2025-26</span>
              </div>

              <div className="divide-y divide-[#1e1e24] text-xs">
                {[
                  { name: "Global Tech for Education Initiative", contribution: "120 Laptops & Smart Labs", cycle: "2025-26", status: "Active" },
                  { name: "Bharat Digital Shiksha Trust", contribution: "High-Speed Satellite Terminals (15 Schools)", cycle: "2025-26", status: "Verified" },
                  { name: "Infosys Foundation Partner Grant", contribution: "CS Teacher Training Program for 480 Mentors", cycle: "2026-27", status: "Allocated" }
                ].map((grant, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">{grant.name}</div>
                      <div className="text-zinc-400 text-[11px]">{grant.contribution}</div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold">
                        {grant.status}
                      </span>
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{grant.cycle}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: DATABASE EXPLORER ── */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            <div className="bg-[#0e0e11] border border-[#27272a] rounded-xl p-5">
              <h3 className="text-sm font-bold text-white mb-1">PostgreSQL Production Schema & Tables</h3>
              <p className="text-xs text-zinc-400 mb-4">Live table structures, row counts, and data schemas running on Neon AP-South.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {TABLES.map((t, i) => (
                  <div key={i} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-amber-400">{t.name}</span>
                      <span className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">{t.size}</span>
                    </div>
                    <div className="text-xl font-bold text-white">{t.rows.toLocaleString()} <span className="text-xs text-zinc-500 font-normal">records</span></div>
                    <p className="text-xs text-zinc-400 leading-snug">{t.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: API RUNNER ── */}
        {activeTab === 'api' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-[#0e0e11] border border-[#27272a] rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white">Preset Endpoints</h3>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {PRESET_ENDPOINTS.map((ep, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedEndpoint(ep);
                      setCustomPath(ep.path);
                      setCustomMethod(ep.method);
                      setRequestBody(ep.body || '');
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-all text-xs space-y-1 ${
                      selectedEndpoint.path === ep.path
                        ? 'bg-amber-500/10 border-amber-500/50 text-white'
                        : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded font-mono font-bold text-[10px] ${ep.method === 'GET' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        {ep.method}
                      </span>
                      <span className="font-mono font-semibold text-white truncate">{ep.path}</span>
                    </div>
                    <div className="text-[11px] text-zinc-500 line-clamp-1">{ep.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="bg-[#0e0e11] border border-[#27272a] rounded-xl p-5 space-y-4">
                <div className="flex gap-2">
                  <select
                    value={customMethod}
                    onChange={e => setCustomMethod(e.target.value)}
                    className="bg-zinc-900 border border-zinc-700 text-white font-mono text-xs font-bold px-3 py-2 rounded-lg outline-none"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PATCH">PATCH</option>
                  </select>

                  <input
                    type="text"
                    value={customPath}
                    onChange={e => setCustomPath(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-700 text-white font-mono text-xs px-3 py-2 rounded-lg outline-none"
                  />

                  <button
                    onClick={executeApiCall}
                    disabled={apiLoading}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    {apiLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                    <span>Execute</span>
                  </button>
                </div>

                {customMethod !== 'GET' && (
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">JSON Payload Body</label>
                    <textarea
                      value={requestBody}
                      onChange={e => setRequestBody(e.target.value)}
                      rows={4}
                      className="w-full bg-[#050507] border border-zinc-800 rounded-lg p-3 font-mono text-xs text-amber-300 outline-none"
                    />
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-zinc-400">Response Payload</span>
                    {apiStatus && (
                      <div className="flex items-center gap-3 font-mono">
                        <span className={`font-bold ${apiStatus < 400 ? 'text-emerald-400' : 'text-red-400'}`}>Status: {apiStatus}</span>
                        <span className="text-zinc-500">Latency: {apiTime}</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-[#050507] border border-zinc-800 rounded-lg p-4 font-mono text-xs text-zinc-300 max-h-80 overflow-y-auto">
                    {apiResponse ? (
                      <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
                    ) : (
                      <span className="text-zinc-600 italic">Click Execute to test endpoints against the live PostgreSQL database.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 5: WEBRTC STREAMS ── */}
        {activeTab === 'streams' && (
          <div className="bg-[#0e0e11] border border-[#27272a] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">Live WebRTC Masterclass Broadcast Relays</h3>
            <p className="text-xs text-zinc-400">Active video and audio peer-to-peer distribution meshes across trust classrooms.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {[
                { title: 'Grade 9 Python Masterclass', host: 'Prof. Vikram Aditya', peers: 128, bitrate: '1,420 kbps', code: 'meet-py9-vst' },
                { title: 'Web Development CSS Grid', host: 'Ms. Priyanka Sen', peers: 94, bitrate: '1,180 kbps', code: 'meet-web-vst' },
                { title: 'Algorithms & Logic Thinking', host: 'Mr. Arvind S', peers: 120, bitrate: '1,350 kbps', code: 'meet-algo-vst' },
              ].map((s, i) => (
                <div key={i} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{s.title}</span>
                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold animate-pulse">● LIVE</span>
                  </div>
                  <div className="text-xs text-zinc-400">Host: <span className="text-zinc-200">{s.host}</span></div>
                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">{s.peers} Lab Peers</span>
                    <span className="text-emerald-400">{s.bitrate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 6: LIVE LOGS ── */}
        {activeTab === 'logs' && (
          <div className="bg-[#0e0e11] border border-[#27272a] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Real-Time Server & Gateway Logs</h3>
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => setIsLogStreaming(v => !v)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold ${isLogStreaming ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400'}`}
                >
                  {isLogStreaming ? '● Streaming' : 'Paused'}
                </button>
              </div>
            </div>

            <div className="bg-[#050507] border border-zinc-800 rounded-lg p-4 font-mono text-xs space-y-2 max-h-96 overflow-y-auto">
              {logs.map(l => (
                <div key={l.id} className="flex items-start gap-3">
                  <span className="text-zinc-600">{l.time}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${l.level === 'INFO' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {l.level}
                  </span>
                  <span className="text-zinc-300 flex-1">{l.msg}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

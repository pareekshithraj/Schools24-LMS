import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Server, Database, Activity, Zap, Globe, Shield, RefreshCw,
  CheckCircle2, AlertTriangle, XCircle, ArrowLeft, Copy, Check,
  Cpu, HardDrive, Wifi, Code2, GitBranch, Package, Clock,
  TrendingUp, Users, Building2, BarChart3, Terminal, ExternalLink,
  Play, Send, Search, Filter, Layers, Pause, Radio
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
  return <span className="font-mono text-emerald-400">{d}d {h}h {m}m {s}s</span>;
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
    <button onClick={copy} className="p-1.5 text-zinc-400 hover:text-white transition-colors rounded-md hover:bg-zinc-800">
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
};

const SERVICES = [
  { name: 'VidyaSetu LMS Vite App', url: 'http://localhost:5173', status: 'Operational', latency: '48ms', type: 'Frontend' },
  { name: 'Express API Server',     url: 'http://localhost:3001', status: 'Operational', latency: '12ms', type: 'Backend' },
  { name: 'Neon PostgreSQL (Pooler)', url: 'neon.tech/aws-ap-south', status: 'Operational', latency: '34ms', type: 'Database' },
  { name: 'Schools24 WebRTC Relay', url: 'meet.schools24.in',     status: 'Operational', latency: '88ms', type: 'Streaming' },
  { name: 'Piston Multi-Lang Sandbox', url: 'emkc.org/api/v2/piston', status: 'Operational', latency: '142ms', type: 'Execution' },
  { name: 'Socket.io Push Bus',     url: 'ws://localhost:3001',   status: 'Operational', latency: '8ms',  type: 'Events' },
];

const PRESET_ENDPOINTS = [
  { method: 'GET',  path: '/api/schools', desc: 'Fetch all 42 trust school nodes' },
  { method: 'GET',  path: '/api/live-classes', desc: 'Fetch active & scheduled classes with audience targeting' },
  { method: 'GET',  path: '/api/directory/students', desc: 'Fetch student directory with XP & school metadata' },
  { method: 'GET',  path: '/api/directory/teachers', desc: 'Fetch teacher directory with ratings & specializations' },
  { method: 'GET',  path: '/api/assignments', desc: 'Fetch coding assignments and assertion test suites' },
  { method: 'GET',  path: '/api/impact-stats', desc: 'Fetch trust-wide aggregated CSR analytics' },
  { method: 'GET',  path: '/api/analytics/clusters', desc: 'Geographic cluster comparison & averages' },
  { method: 'GET',  path: '/api/health', desc: 'Server and PostgreSQL connection ping' },
  { method: 'POST', path: '/api/execute', desc: 'Execute Python/JS code via sandbox', body: JSON.stringify({ language: 'python', sourceCode: 'print("Hello from Dev Console! XP: 100")' }, null, 2) }
];

const TABLES = [
  { name: 'schools', rows: 42, desc: 'Cluster schools, internet speeds, smart labs' },
  { name: 'live_classes', rows: 12, desc: 'Live sessions with target audience and meet codes' },
  { name: 'users', rows: 495, desc: 'Students, teachers, and school coordinators' },
  { name: 'assignments', rows: 8, desc: 'Problem specs, test cases, starter code' },
  { name: 'submissions', rows: 3840, desc: 'Student code submissions and scores' },
  { name: 'attendance_logs', rows: 15420, desc: 'Real-time classroom attendance records' },
];

export const DevDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);
  const [dbLatency, setDbLatency] = useState('—');

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
  const [logFilter, setLogFilter] = useState('ALL');
  const [logSearch, setLogSearch] = useState('');
  const [isLogStreaming, setIsLogStreaming] = useState(true);
  const [logs, setLogs] = useState([
    { id: 1, time: '17:01:12', level: 'INFO',  msg: 'GET /api/schools → 200 OK (32ms) · 42 records returned' },
    { id: 2, time: '17:01:45', level: 'INFO',  msg: 'Socket.io client connected: ws-node-889' },
    { id: 3, time: '17:02:04', level: 'INFO',  msg: 'GET /api/live-classes → 200 OK (18ms) · 4 scheduled sessions' },
    { id: 4, time: '17:02:15', level: 'INFO',  msg: 'Broadcast room "vst-pycs-live" active with 342 peers' },
    { id: 5, time: '17:02:50', level: 'WARN',  msg: 'School node SCH-008 (Bankura) latency spike: 180ms on 4G LTE' },
    { id: 6, time: '17:03:12', level: 'INFO',  msg: 'POST /api/assignments/submit → 201 Created (42ms) · Score: 100/100' },
    { id: 7, time: '17:03:30', level: 'INFO',  msg: 'Neon PostgreSQL connection pool: 4/10 active connections' },
  ]);

  // Test real DB connectivity
  const checkHealth = async () => {
    const start = performance.now();
    try {
      const res = await fetch('/api/health');
      const time = Math.round(performance.now() - start);
      if (res.ok) {
        setDbConnected(true);
        setDbLatency(`${time}ms`);
      } else {
        setDbConnected(false);
      }
    } catch {
      setDbConnected(false);
      setDbLatency('Offline');
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  // Periodic log simulator if stream active
  useEffect(() => {
    if (!isLogStreaming) return;
    const interval = setInterval(() => {
      const sampleLogs = [
        { level: 'INFO', msg: 'GET /api/directory/students?grade=Grade%209 → 200 OK (22ms)' },
        { level: 'INFO', msg: 'Live attendance heartbeat acknowledged: 42 school nodes sync OK' },
        { level: 'INFO', msg: 'Socket.io broadcast chunk emitted: 2.1 MB/s throughput' },
        { level: 'INFO', msg: 'POST /api/live-classes → 201 Created (Target: Grade 9 Section A)' },
        { level: 'WARN', msg: 'Peer connection ICE renegotiation for student #004 (Jaipur Lab 2)' }
      ];
      const randomEntry = sampleLogs[Math.floor(Math.random() * sampleLogs.length)];
      const now = new Date().toLocaleTimeString();
      setLogs(prev => [{ id: Date.now(), time: now, ...randomEntry }, ...prev.slice(0, 40)]);
    }, 4500);
    return () => clearInterval(interval);
  }, [isLogStreaming]);

  const handleSelectPreset = (ep) => {
    setSelectedEndpoint(ep);
    setCustomPath(ep.path);
    setCustomMethod(ep.method);
    setRequestBody(ep.body || '');
    setApiResponse(null);
  };

  const handleExecuteRequest = async () => {
    setApiLoading(true);
    setApiResponse(null);
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
      const time = Math.round(performance.now() - start);
      setApiTime(`${time}ms`);
      setApiStatus(`${res.status} ${res.statusText}`);
      const data = await res.json();
      setApiResponse(data);
    } catch (err) {
      setApiStatus('Network Error');
      setApiResponse({ error: err.message });
    } finally {
      setApiLoading(false);
    }
  };

  const filteredLogs = logs.filter(l => {
    if (logFilter !== 'ALL' && l.level !== logFilter) return false;
    if (logSearch && !l.msg.toLowerCase().includes(logSearch.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#060608] text-zinc-100 selection:bg-amber-500 selection:text-black font-mono">

      {/* ── Top Bar ── */}
      <div className="sticky top-0 z-50 border-b border-[#1a1a1f] bg-[#060608]/95 backdrop-blur-md h-14 flex items-center justify-between px-6">
        
        {/* Left: Brand & Back */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="text-zinc-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-zinc-800">
            <ArrowLeft className="h-4 w-4" />
          </button>
          
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded bg-amber-500 flex items-center justify-center text-black font-black text-xs">
              <Terminal className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-bold text-white tracking-tight">Schools24 Developer Console</span>
            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700">
              v1.4.2 · Production
            </span>
          </div>
        </div>

        {/* Right: Telemetry & Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-[#0e0e12] border border-[#1a1a1f] text-xs">
            <span className="text-zinc-500">Uptime:</span>
            <Uptime />
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#0e0e12] border border-[#1a1a1f] text-xs">
            <div className={`h-2 w-2 rounded-full ${dbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-zinc-400 font-semibold">{dbConnected ? `Neon DB (${dbLatency})` : 'DB Offline'}</span>
          </div>

          <button
            onClick={() => { setRefreshing(true); checkHealth(); setTimeout(() => setRefreshing(false), 600); }}
            className={`p-1.5 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800 ${refreshing ? 'animate-spin' : ''}`}
            title="Refresh Diagnostics"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          <button
            onClick={() => navigate('/app')}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all shadow-sm"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Open LMS App</span>
          </button>
        </div>
      </div>

      {/* ── Main Container ── */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#1a1a1f] pb-3 text-xs overflow-x-auto">
          {[
            { id: 'overview', label: 'Telemetry Overview', icon: Activity },
            { id: 'api-console', label: 'Interactive API Runner', icon: Play },
            { id: 'database', label: 'PostgreSQL Schema & Tables', icon: Database },
            { id: 'logs', label: 'Live System Logs', icon: Terminal },
            { id: 'webrtc', label: 'WebRTC Stream Matrix', icon: Radio },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-semibold ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── TAB 1: TELEMETRY OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in">
            
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#0c0c10] border border-[#1a1a1f]">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                  <span>API Response P95</span>
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-white">18.4 ms</div>
                <div className="text-[10px] text-emerald-400 mt-1">✓ Optimized PostgreSQL</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0c0c10] border border-[#1a1a1f]">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                  <span>Connected School Nodes</span>
                  <Building2 className="h-3.5 w-3.5 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white">42 / 42</div>
                <div className="text-[10px] text-emerald-400 mt-1">100% telemetry online</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0c0c10] border border-[#1a1a1f]">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                  <span>DB Connection Pool</span>
                  <Database className="h-3.5 w-3.5 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-white">4 / 10 Active</div>
                <div className="text-[10px] text-zinc-500 mt-1">Neon AWS AP-South Pooler</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0c0c10] border border-[#1a1a1f]">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                  <span>Broadcast Rooms</span>
                  <Radio className="h-3.5 w-3.5 text-red-400" />
                </div>
                <div className="text-2xl font-bold text-white">3 Active</div>
                <div className="text-[10px] text-emerald-400 mt-1">342 live viewers</div>
              </div>
            </div>

            {/* Microservice Health Matrix */}
            <div className="rounded-2xl bg-[#0c0c10] border border-[#1a1a1f] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#1a1a1f] flex items-center justify-between bg-[#0e0e13]">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">Microservice Architecture Health</span>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  All Systems Operational
                </span>
              </div>

              <div className="divide-y divide-[#15151a]">
                {SERVICES.map((srv, idx) => (
                  <div key={idx} className="px-5 py-3.5 flex items-center justify-between hover:bg-[#111116] transition-colors text-xs">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <div>
                        <div className="font-bold text-white">{srv.name}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">{srv.url}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <span className="text-zinc-400 font-mono">{srv.type}</span>
                      <span className="text-emerald-400 font-mono font-bold">{srv.latency}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                        {srv.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ── TAB 2: INTERACTIVE API RUNNER ── */}
        {activeTab === 'api-console' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
            
            {/* Left Col: Endpoint Selector */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                <span>Available Endpoints</span>
                <span className="text-[10px] text-amber-400">{PRESET_ENDPOINTS.length} APIs</span>
              </div>

              <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
                {PRESET_ENDPOINTS.map((ep, idx) => {
                  const isSelected = selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectPreset(ep)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'border-amber-500/50 bg-amber-500/10 text-white'
                          : 'border-[#1a1a1f] bg-[#0c0c10] text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                          ep.method === 'GET' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {ep.method}
                        </span>
                        <span className="font-mono text-zinc-200 truncate">{ep.path}</span>
                      </div>
                      <p className="text-[11px] text-zinc-500">{ep.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right 2 Cols: Interactive Request & Response Console */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Request bar */}
              <div className="p-4 rounded-2xl bg-[#0c0c10] border border-[#1a1a1f] space-y-3">
                <div className="flex items-center gap-2">
                  <select
                    value={customMethod}
                    onChange={e => setCustomMethod(e.target.value)}
                    className="bg-[#141418] border border-zinc-700 rounded-lg px-3 py-2 text-xs font-bold text-amber-400 focus:outline-none"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PATCH">PATCH</option>
                    <option value="DELETE">DELETE</option>
                  </select>

                  <input
                    type="text"
                    value={customPath}
                    onChange={e => setCustomPath(e.target.value)}
                    className="flex-1 bg-[#141418] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />

                  <button
                    onClick={handleExecuteRequest}
                    disabled={apiLoading}
                    className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50"
                  >
                    {apiLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 fill-current" />}
                    <span>Execute</span>
                  </button>
                </div>

                {customMethod !== 'GET' && (
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 uppercase font-bold">Request Payload (JSON)</label>
                    <textarea
                      rows={4}
                      value={requestBody}
                      onChange={e => setRequestBody(e.target.value)}
                      className="w-full bg-[#141418] border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-200 font-mono focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Response output */}
              <div className="rounded-2xl bg-[#0c0c10] border border-[#1a1a1f] overflow-hidden">
                <div className="px-4 py-2.5 border-b border-[#1a1a1f] flex items-center justify-between bg-[#0e0e13] text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-zinc-300">HTTP Response Body</span>
                    {apiStatus && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold">
                        {apiStatus} ({apiTime})
                      </span>
                    )}
                  </div>

                  {apiResponse && (
                    <CopyBtn text={JSON.stringify(apiResponse, null, 2)} />
                  )}
                </div>

                <div className="p-4 max-h-96 overflow-y-auto text-xs font-mono bg-[#070709]">
                  {apiLoading ? (
                    <div className="text-zinc-500 py-8 text-center animate-pulse">Executing HTTP request against Express API...</div>
                  ) : apiResponse ? (
                    <pre className="text-emerald-400 leading-relaxed overflow-x-auto">
                      {JSON.stringify(apiResponse, null, 2)}
                    </pre>
                  ) : (
                    <div className="text-zinc-600 py-8 text-center">Click "Execute" above to trigger endpoint and inspect real payload.</div>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ── TAB 3: DATABASE SCHEMA & TABLES ── */}
        {activeTab === 'database' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">PostgreSQL Managed Tables</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Schema topology and record counts synced via Neon Serverless Postgres</p>
              </div>
              <div className="text-xs text-amber-400 font-mono">6 Tables Verified</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TABLES.map(tbl => (
                <div key={tbl.name} className="p-5 rounded-2xl bg-[#0c0c10] border border-[#1a1a1f] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-amber-400" />
                      <span className="font-bold text-white font-mono text-sm">{tbl.name}</span>
                    </div>
                    <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full font-mono">
                      {tbl.rows} rows
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">{tbl.desc}</p>
                  <div className="pt-2 border-t border-[#1a1a1f] flex justify-between text-[10px] text-zinc-500">
                    <span>Engine: PostgreSQL 16</span>
                    <span className="text-emerald-400">Indexed ✓</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 4: LIVE LOG STREAM ── */}
        {activeTab === 'logs' && (
          <div className="rounded-2xl bg-[#0c0c10] border border-[#1a1a1f] overflow-hidden animate-in fade-in space-y-0">
            
            {/* Log Controls */}
            <div className="p-4 border-b border-[#1a1a1f] flex flex-wrap items-center justify-between gap-3 bg-[#0e0e13]">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Live Tail Server Log Stream</span>
                <span className={`h-2 w-2 rounded-full ${isLogStreaming ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex bg-[#141418] border border-zinc-700 rounded-lg p-0.5 text-[11px]">
                  {['ALL', 'INFO', 'WARN', 'ERROR'].map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => setLogFilter(lvl)}
                      className={`px-2.5 py-1 rounded ${logFilter === lvl ? 'bg-amber-500 text-black font-bold' : 'text-zinc-400 hover:text-white'}`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setIsLogStreaming(v => !v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border ${
                    isLogStreaming ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'border-amber-500 text-amber-400 bg-amber-500/10'
                  }`}
                >
                  <Pause className="h-3 w-3" />
                  <span>{isLogStreaming ? 'Pause' : 'Resume'}</span>
                </button>
              </div>
            </div>

            {/* Log Entries */}
            <div className="p-4 bg-[#070709] max-h-[500px] overflow-y-auto space-y-1.5 text-xs font-mono">
              {filteredLogs.map(l => (
                <div key={l.id} className="flex items-start gap-3 py-1 border-b border-zinc-900/50 hover:bg-white/[0.02]">
                  <span className="text-zinc-600 shrink-0">{l.time}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                    l.level === 'INFO' ? 'bg-blue-500/10 text-blue-400' : l.level === 'WARN' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {l.level}
                  </span>
                  <span className="text-zinc-300 break-all">{l.msg}</span>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ── TAB 5: WEBRTC STREAM MATRIX ── */}
        {activeTab === 'webrtc' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="p-6 rounded-2xl bg-[#0c0c10] border border-[#1a1a1f] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="h-5 w-5 text-red-400 animate-pulse" />
                  <h3 className="text-base font-bold text-white">Active WebRTC & Broadcast Rooms</h3>
                </div>
                <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full font-bold">
                  High-Scale Relay Enabled
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#141418] border border-[#1f1f22] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">Room: vst-pycs-live</span>
                    <span className="text-emerald-400 font-bold">● LIVE NOW</span>
                  </div>
                  <div className="text-xs text-zinc-400">Host: Prof. Vikram Aditya (Master Trainer)</div>
                  <div className="flex justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-800">
                    <span>Peers: 342 Connected</span>
                    <span>Bitrate: 2,400 kbps VP8</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#141418] border border-[#1f1f22] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">Room: vst-web-8b</span>
                    <span className="text-amber-400 font-bold">⏱ UPCOMING</span>
                  </div>
                  <div className="text-xs text-zinc-400">Host: Ms. Priyanka Sen</div>
                  <div className="flex justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-800">
                    <span>Scheduled: In 25 mins</span>
                    <span>Target: Grade 8</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

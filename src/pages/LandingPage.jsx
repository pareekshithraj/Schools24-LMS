import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Video, Code2, BookOpen, Trophy, Users, ArrowRight,
  CheckCircle2, Play, Globe, Shield, Zap, BarChart3, Star, ChevronRight,
  GraduationCap, Building2, Wifi, Cpu, Award, TrendingUp, X, Menu,
  Terminal, Sparkles, Calendar, Clock, Check, Layers, Laptop, Radio, Activity
} from 'lucide-react';

/* ── Technology Logos for Marquee ── */
const TECH_STACK = [
  { name: 'WebRTC Mesh', desc: 'Zero-Latency Streaming' },
  { name: 'Neon PostgreSQL', desc: 'Serverless Relational Cloud' },
  { name: 'Pyodide Wasm', desc: 'In-Browser Python Execution' },
  { name: 'Socket.io', desc: 'Real-Time Telemetry & Chat' },
  { name: 'Piston Compiler', desc: 'Multi-Language Sandbox' },
  { name: 'Express API', desc: 'High-Throughput Gateway' },
  { name: 'Tailwind CSS', desc: 'Precision Design System' },
];

/* ── Capabilities Bento Grid Data ── */
const CAPABILITIES = [
  {
    icon: Video,
    tag: 'Real-Time Streaming',
    title: '14,000+ Student Live Masterclasses',
    desc: 'One expert master educator broadcasts simultaneously across 42 trust schools. Every rural student gets front-row CS instruction with zero external API costs.',
    gradient: 'from-amber-500/10 via-orange-500/5 to-transparent',
    border: 'border-amber-500/30',
    iconColor: 'text-amber-400'
  },
  {
    icon: Terminal,
    tag: 'In-Browser Sandbox',
    title: 'Zero-Setup CodeLab & Pyodide IDE',
    desc: 'Full Python, JavaScript, and HTML/CSS runtime with live execution. Unit test assertions auto-evaluate and grade student algorithms instantly.',
    gradient: 'from-blue-500/10 via-cyan-500/5 to-transparent',
    border: 'border-blue-500/30',
    iconColor: 'text-blue-400'
  },
  {
    icon: Calendar,
    tag: 'Precision Delivery',
    title: 'Targeted Class Scheduling Engine',
    desc: 'Teachers schedule classes targeted to All Classes, Specific Grades (6–12), or Individual 1-on-1 Students with instant real-time socket alerts.',
    gradient: 'from-purple-500/10 via-fuchsia-500/5 to-transparent',
    border: 'border-purple-500/30',
    iconColor: 'text-purple-400'
  },
  {
    icon: Shield,
    tag: 'Security & Multi-Tenancy',
    title: 'Strict Institute Data Isolation',
    desc: 'Complete tenant isolation for each school node. Student directories, attendance logs, timetables, and teacher allocations remain private per institute.',
    gradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
    border: 'border-emerald-500/30',
    iconColor: 'text-emerald-400'
  },
  {
    icon: Wifi,
    tag: 'Rural Optimization',
    title: 'Low-Bandwidth 2G/3G Resilience',
    desc: 'Audio-first fallback, chunked WebM buffering, and offline in-browser execution designed specifically for low-connectivity rural school labs.',
    gradient: 'from-pink-500/10 via-rose-500/5 to-transparent',
    border: 'border-pink-500/30',
    iconColor: 'text-pink-400'
  },
  {
    icon: BarChart3,
    tag: 'CSR & Governance',
    title: 'Trust-Wide Impact & Leaderboards',
    desc: 'Real-time telemetry measuring attendance, problem-solving pass rates, system uptime, and gamified XP rankings across the foundation.',
    gradient: 'from-indigo-500/10 via-violet-500/5 to-transparent',
    border: 'border-indigo-500/30',
    iconColor: 'text-indigo-400'
  }
];

/* ── Interactive Dashboard Explorer Data ── */
const DASHBOARD_MODES = [
  {
    id: 'teacher',
    label: 'Teacher Studio',
    icon: '👨‍🏫',
    roleTitle: 'Master CS Educator View',
    subtitle: 'Broadcast masterclasses, schedule targeted sessions, and review auto-graded submissions in real time.',
    stats: [
      { label: 'Students Mentored', value: '15,420', sub: 'Across 42 schools' },
      { label: 'Pass Rate', value: '98.4%', sub: 'Auto-graded tests' },
      { label: 'Active Masterclasses', value: '3 Live Today', sub: 'WebRTC active' },
    ],
    previewAction: 'Schedule Targeted Masterclass'
  },
  {
    id: 'student',
    label: 'Student CodeLab',
    icon: '🎒',
    roleTitle: 'Student Learning & Coding Arena',
    subtitle: 'Join live sessions, solve algorithmic challenges in the Web IDE, and climb the trust-wide XP leaderboard.',
    stats: [
      { label: 'Total XP Points', value: '450 XP', sub: 'Top 2% in trust' },
      { label: 'Attendance', value: '98%', sub: '24/24 classes attended' },
      { label: 'Solved Challenges', value: '14 / 15', sub: 'Python & Flexbox' },
    ],
    previewAction: 'Launch In-Browser CodeLab'
  },
  {
    id: 'principal',
    label: 'School Principal',
    icon: '🏫',
    roleTitle: 'School Node Infrastructure & Attendance',
    subtitle: 'Manage local computer lab hardware, monitor fiber internet status, and review grade-level digital literacy.',
    stats: [
      { label: 'Lab Computers', value: '32 Systems', sub: '100% operational' },
      { label: 'Enrolled Students', value: '480 Students', sub: 'Grade 6 to 12' },
      { label: 'Node Rating', value: '★ 4.9', sub: 'Top performing hub' },
    ],
    previewAction: 'View School Node Status'
  },
  {
    id: 'admin',
    label: 'Trust Super Admin',
    icon: '🛡️',
    roleTitle: 'Foundation Multi-Tenant Governance',
    subtitle: 'Network-wide CSR impact metrics, cluster comparisons, subject allocations, and organization provisioning.',
    stats: [
      { label: 'Trust Schools', value: '42 Connected', sub: '4 geographic clusters' },
      { label: 'Digital Literacy', value: '94.6%', sub: '+18% YoY growth' },
      { label: 'Code Submissions', value: '45,820', sub: 'Saved to PostgreSQL' },
    ],
    previewAction: 'Open Trust Command Center'
  }
];

export const LandingPage = () => {
  const navigate = useNavigate();
  const [activeDashboardTab, setActiveDashboardTab] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef(null);

  // Parallax subtle mouse effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!heroRef.current) return;
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 20;
      const y = (clientY / window.innerHeight - 0.5) * 20;
      heroRef.current.style.setProperty('--mouse-x', `${x}px`);
      heroRef.current.style.setProperty('--mouse-y', `${y}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const currentDb = DASHBOARD_MODES[activeDashboardTab];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#f59e0b] selection:text-black" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* ── Fixed Floating Glass Navbar (Schools24 Style) ── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center shadow-[0_0_16px_rgba(255,255,255,0.2)]">
              <span className="text-black font-black text-lg tracking-tighter">S</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-white tracking-tight">Schools24</span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
                LMS
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#capabilities" className="hover:text-white transition-colors">Platform</a>
            <a href="#explorer" className="hover:text-white transition-colors">Live Studio</a>
            <a href="#pipeline" className="hover:text-white transition-colors">How It Works</a>
            <a href="#trust" className="hover:text-white transition-colors">Trust Network</a>
            <Link to="/dev" className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1">
              <Terminal className="h-3.5 w-3.5" /> Dev Console
            </Link>
          </nav>

          {/* Right Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-semibold text-zinc-300 hover:text-white px-4 py-2 rounded-full hover:bg-white/5 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2 rounded-full bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold text-sm transition-all duration-300 shadow-[0_0_24px_rgba(245,158,11,0.3)] hover:shadow-[0_0_36px_rgba(245,158,11,0.5)] hover:-translate-y-0.5"
            >
              Launch LMS
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(v => !v)}
            className="md:hidden p-2 text-zinc-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/95 border-b border-zinc-800 px-6 py-6 space-y-4 text-sm font-semibold animate-in slide-in-from-top-4">
            <a href="#capabilities" onClick={() => setMobileMenuOpen(false)} className="block text-zinc-400 hover:text-white">Platform</a>
            <a href="#explorer" onClick={() => setMobileMenuOpen(false)} className="block text-zinc-400 hover:text-white">Live Studio</a>
            <a href="#pipeline" onClick={() => setMobileMenuOpen(false)} className="block text-zinc-400 hover:text-white">How It Works</a>
            <a href="#trust" onClick={() => setMobileMenuOpen(false)} className="block text-zinc-400 hover:text-white">Trust Network</a>
            <div className="pt-4 border-t border-zinc-800 flex flex-col gap-3">
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 rounded-xl border border-zinc-700 text-white font-bold"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 rounded-xl bg-amber-500 text-black font-bold"
              >
                Launch LMS
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero Section (Schools24 Dark & Amber Aesthetic) ── */}
      <section
        ref={heroRef}
        className="relative min-h-screen bg-black overflow-hidden flex items-center justify-center pt-32 pb-24"
      >
        {/* Ambient Glows */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.12)_0%,transparent_55%)] pointer-events-none" />
        <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />
        
        <div className="absolute top-1/4 left-1/5 w-64 md:w-96 h-64 md:h-96 bg-amber-500/20 rounded-full blur-[100px] md:blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: '5s' }} />
        <div className="absolute bottom-1/4 right-1/5 w-64 md:w-96 h-64 md:h-96 bg-indigo-600/20 rounded-full blur-[100px] md:blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: '7s' }} />

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(245,158,11,0.1)] cursor-default">
            <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse" />
            <span className="text-white/80 text-xs font-semibold tracking-wide uppercase">
              Powering Schools · Empowering Students
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[100px] font-black tracking-tighter leading-[0.92] text-white mb-6 md:mb-8">
            Run your school With<br />
            <span className="text-[#f59e0b] drop-shadow-[0_0_30px_rgba(245,158,11,0.35)]"> Schools24 LMS.</span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-3xl text-base md:text-xl text-zinc-400 font-medium leading-relaxed mb-10 md:mb-12">
            The all-in-one Computer Science operating system for modern educational trusts. Connect 15,000+ students across 42 schools through live masterclass broadcasts, in-browser code labs, targeted class scheduling, and automated grading.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto z-20">
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-[#f59e0b] hover:bg-[#d97706] text-black rounded-full font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 group shadow-[0_0_32px_rgba(245,158,11,0.3)] hover:shadow-[0_0_48px_rgba(245,158,11,0.5)] hover:-translate-y-0.5"
            >
              <span>Explore Platform Demo</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full font-bold text-lg backdrop-blur-md transition-all duration-300 flex items-center justify-center gap-2 hover:border-white/20"
            >
              <Terminal className="h-5 w-5 text-amber-400" />
              <span>Launch In-Browser CodeLab</span>
            </button>
          </div>

          {/* Floating Metric Badges (Schools24 Style) */}
          <div className="w-full max-w-5xl mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-xl text-left">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Live Attendance
              </div>
              <div className="text-3xl font-black text-white">98.4%</div>
              <div className="text-xs text-zinc-500 mt-1">Daily trust average</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-xl text-left">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                <Video className="h-3.5 w-3.5 text-amber-400" /> Live Broadcasting
              </div>
              <div className="text-3xl font-black text-white">42 Nodes</div>
              <div className="text-xs text-zinc-500 mt-1">Simultaneous streaming</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-xl text-left">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
                <Code2 className="h-3.5 w-3.5 text-blue-400" /> Code Evaluated
              </div>
              <div className="text-3xl font-black text-white">45,820+</div>
              <div className="text-xs text-zinc-500 mt-1">Auto-graded test cases</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-xl text-left">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">
                <GraduationCap className="h-3.5 w-3.5 text-purple-400" /> Active Students
              </div>
              <div className="text-3xl font-black text-white">15,420</div>
              <div className="text-xs text-zinc-500 mt-1">Enrolled in CS track</div>
            </div>

          </div>

        </div>
      </section>

      {/* ── Powered By Architecture Section ── */}
      <section className="relative bg-black py-10 border-y border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">
            Powered By Modern Infrastructure
          </p>
        </div>

        <div className="relative w-full max-w-5xl mx-auto overflow-hidden">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 py-2 px-4">
            {TECH_STACK.map((tech, i) => (
              <div key={i} className="flex items-center gap-2.5 text-zinc-400 hover:text-white transition-colors">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500/80" />
                <span className="text-sm font-bold tracking-tight text-zinc-200">{tech.name}</span>
                <span className="text-[11px] text-zinc-600 hidden sm:inline">({tech.desc})</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Interactive Dashboard Explorer (Live Interactive Simulator) ── */}
      <section id="explorer" className="relative bg-[#050507] py-28 border-b border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">Interactive Studio Explorer</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-3">
              Purpose-built experiences for every stakeholder.
            </h2>
            <p className="text-sm text-zinc-400 mt-3">
              Switch between roles to explore how Schools24 LMS streamlines workflows for educators, learners, administrators, and parents.
            </p>
          </div>

          {/* Role Tab Selector */}
          <div className="flex items-center justify-center gap-2 flex-wrap mb-10">
            {DASHBOARD_MODES.map((dm, idx) => (
              <button
                key={dm.id}
                onClick={() => setActiveDashboardTab(idx)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
                  activeDashboardTab === idx
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 scale-[1.03]'
                    : 'bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10'
                }`}
              >
                <span className="text-base">{dm.icon}</span>
                <span>{dm.label}</span>
              </button>
            ))}
          </div>

          {/* Interactive Screen Preview */}
          <div className="rounded-3xl border border-white/15 bg-[#0b0b0e] p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 pb-8 border-b border-white/10">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                  Active Simulation
                </div>
                <h3 className="text-2xl font-black text-white">{currentDb.roleTitle}</h3>
                <p className="text-sm text-zinc-400 mt-1 max-w-xl">{currentDb.subtitle}</p>
              </div>

              <button
                onClick={() => navigate('/login')}
                className="px-6 py-3 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-colors flex items-center gap-2 shadow-lg"
              >
                <span>Launch {currentDb.label}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Stat Cards in Simulator */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
              {currentDb.stats.map((st, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                  <div className="text-xs text-zinc-400">{st.label}</div>
                  <div className="text-3xl font-black text-white mt-1 mb-1">{st.value}</div>
                  <div className="text-[11px] text-amber-400 font-medium">{st.sub}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── Capabilities Bento Grid ── */}
      <section id="capabilities" className="relative bg-black py-28 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">Platform Features</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-3">
              Engineered for scale, speed, and real rural impact.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CAPABILITIES.map((cap, i) => {
              const Icon = cap.icon;
              return (
                <div
                  key={i}
                  className={`rounded-3xl p-7 bg-gradient-to-b ${cap.gradient} border ${cap.border} backdrop-blur-md flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 group`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="h-12 w-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
                        <Icon className={`h-6 w-6 ${cap.iconColor}`} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full text-zinc-300">
                        {cap.tag}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2.5 leading-snug group-hover:text-amber-400 transition-colors">
                      {cap.title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {cap.desc}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-xs text-zinc-500">
                    <span>Hardware Tested</span>
                    <span className="text-white font-mono font-bold">100% Active</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── How It Works (4-Step Pipeline) ── */}
      <section id="pipeline" className="relative bg-[#050507] py-28 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">Implementation Process</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-3">
              Deploying quality CS education in 4 simple steps.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: '01', title: 'Onboard School Node', desc: 'Plug into the trust registry. School labs connect via lightweight browser terminals.' },
              { num: '02', title: 'Schedule Masterclasses', desc: 'Target classes by entire school, specific grade section, or individual 1-on-1 students.' },
              { num: '03', title: 'Live Interactive Session', desc: 'Broadcasting with synchronized code editor, whiteboard, and in-stream student polls.' },
              { num: '04', title: 'Auto-Evaluate & Rank', desc: 'Instant pass/fail assertion suite, XP leaderboard propagation, and parent reports.' },
            ].map((st, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 relative">
                <div className="text-4xl font-black text-amber-400/30 mb-3 font-mono">{st.num}</div>
                <h4 className="text-base font-bold text-white mb-2">{st.title}</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Trust Impact & Call to Action ── */}
      <section id="trust" className="relative bg-black py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
          
          <div className="max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Foundation Scale</span>
            <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight mt-3">
              Ready to elevate your institution?
            </h2>
            <p className="text-base text-zinc-400 mt-4 leading-relaxed">
              Connect your teachers, students, and administrators on India's most advanced computer science operating system.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-10 py-4 rounded-full bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold text-base transition-all shadow-[0_0_32px_rgba(245,158,11,0.3)] hover:shadow-[0_0_48px_rgba(245,158,11,0.5)]"
            >
              Get Started with Schools24 LMS
            </button>
            <button
              onClick={() => navigate('/dev')}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-base border border-zinc-700 transition-colors flex items-center justify-center gap-2"
            >
              <Terminal className="h-4 w-4 text-amber-400" />
              <span>Developer Dashboard</span>
            </button>
          </div>

        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-black border-t border-white/10 py-12 text-zinc-500 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded bg-white flex items-center justify-center">
              <span className="text-black font-black text-sm">S</span>
            </div>
            <span className="text-white font-bold text-sm">Schools24 LMS</span>
            <span className="text-zinc-600">· VidyaSetu Foundation</span>
          </div>

          <div className="flex items-center gap-6 font-medium text-zinc-400">
            <button onClick={() => navigate('/login')} className="hover:text-white transition-colors">Sign In</button>
            <button onClick={() => navigate('/dev')} className="hover:text-white transition-colors">Dev Dashboard</button>
            <a href="#capabilities" className="hover:text-white transition-colors">Platform</a>
            <a href="#trust" className="hover:text-white transition-colors">Trust Network</a>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-zinc-400">All 42 School Nodes Operational</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

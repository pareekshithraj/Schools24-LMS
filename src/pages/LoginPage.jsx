import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Eye, EyeOff, ArrowLeft, LogIn, AlertCircle } from 'lucide-react';

const ROLE_PRESETS = [
  { role: 'admin',     label: 'Trust Super Admin', email: 'admin@vidyasetu.org',     color: 'from-violet-500 to-fuchsia-600', initials: 'SA', desc: 'Network-wide oversight' },
  { role: 'principal', label: 'School Principal',  email: 'principal@vidyasetu.org', color: 'from-blue-500 to-cyan-500',     initials: 'PR', desc: 'School node management' },
  { role: 'teacher',   label: 'CS Teacher',        email: 'teacher@vidyasetu.org',   color: 'from-emerald-500 to-teal-500', initials: 'TC', desc: 'Live classes & grading' },
  { role: 'student',   label: 'Student',           email: 'student@vidyasetu.org',   color: 'from-amber-400 to-orange-500', initials: 'AS', desc: 'Learn & code' },
  { role: 'parent',    label: 'Parent / Guardian', email: 'parent@vidyasetu.org',    color: 'from-pink-500 to-rose-500',    initials: 'PG', desc: 'Track ward progress' },
];

export const LoginPage = () => {
  const navigate = useNavigate();
  const { setCurrentRole, setCurrentUser, setToken } = useApp();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleClick = (preset) => {
    setSelectedRole(preset.role);
    setEmail(preset.email);
    setPassword('superadmin123'); // Updated for new bcrypt default
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        setToken(data.token);
        setCurrentRole(data.user.role);
        setCurrentUser(data.user);
        navigate(data.user.role.includes('admin') ? '/superadmin' : '/app');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Network error. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] flex" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ── Left Panel: Branding ── */}
      <div className="hidden lg:flex flex-col w-[480px] flex-shrink-0 bg-[#080808] border-r border-[#111111] p-10 relative overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        {/* Gradient glow */}
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-600/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center">
              <span className="text-black font-black text-lg">S</span>
            </div>
            <span className="text-lg font-bold text-[#fafafa]">Schools24</span>
          </div>

          <h2 className="text-3xl font-black text-[#fafafa] tracking-tight leading-tight mb-4">
            Quality CS Education<br />for every school.
          </h2>
          <p className="text-sm text-[#52525b] leading-relaxed mb-10">
            VidyaSetu Foundation's LMS — connecting 15,000 students across 42 schools through live masterclasses, code labs, and real-time analytics.
          </p>

          {/* Stats mini */}
          <div className="space-y-4">
            {[
              { label: 'Trust schools connected', value: '42' },
              { label: 'Active students',          value: '15,420' },
              { label: 'Live classes this month',  value: '186' },
              { label: 'Avg attendance rate',      value: '98.4%' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-[#52525b]">{label}</span>
                <span className="text-[#fafafa] font-bold font-mono">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative mt-auto text-[10px] text-[#27272a]">
          Powered by Schools24 · Neon PostgreSQL · VidyaSetu Foundation
        </div>
      </div>

      {/* ── Right Panel: Login Form ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative">
        
        {/* Back to landing */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 flex items-center gap-2 text-xs text-[#52525b] hover:text-[#fafafa] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to home
        </button>

        <div className="w-full max-w-md">

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#fafafa] tracking-tight">Sign in to VidyaSetu</h1>
            <p className="text-sm text-[#52525b] mt-1">Select a demo role or enter your credentials</p>
          </div>

          {/* Role Quick-Select */}
          <div className="mb-6">
            <div className="text-[10px] font-semibold text-[#52525b] uppercase tracking-widest mb-3">Quick Access (Demo)</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ROLE_PRESETS.map(preset => (
                <button
                  key={preset.role}
                  onClick={() => handleRoleClick(preset)}
                  className={`flex flex-col items-start gap-1.5 p-3 rounded-xl border transition-all text-left
                    ${selectedRole === preset.role
                      ? 'border-[#52525b] bg-[#111111]'
                      : 'border-[#1a1a1a] hover:border-[#27272a] hover:bg-[#0a0a0a]'
                    }`}
                >
                  <div className={`h-7 w-7 rounded-lg bg-gradient-to-br ${preset.color} flex items-center justify-center text-white font-bold text-[10px]`}>
                    {preset.initials}
                  </div>
                  <div className="text-xs font-semibold text-[#fafafa] leading-tight">{preset.label}</div>
                  <div className="text-[10px] text-[#52525b]">{preset.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-[#111111]" />
            <span className="text-[10px] text-[#27272a] font-medium">OR SIGN IN WITH EMAIL</span>
            <div className="h-px flex-1 bg-[#111111]" />
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#a1a1aa]">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@vidyasetu.org"
                className="w-full bg-[#0a0a0a] border border-[#27272a] rounded-xl px-4 py-3 text-sm text-[#fafafa] placeholder-[#3f3f46] focus:outline-none focus:border-[#52525b] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#a1a1aa]">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0a0a0a] border border-[#27272a] rounded-xl px-4 py-3 pr-12 text-sm text-[#fafafa] placeholder-[#3f3f46] focus:outline-none focus:border-[#52525b] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#52525b] hover:text-[#a1a1aa] transition-colors"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-[#52525b] cursor-pointer">
                <input type="checkbox" className="w-3.5 h-3.5 rounded accent-white" />
                Keep me signed in
              </label>
              <button type="button" className="text-[#52525b] hover:text-[#fafafa] transition-colors">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold py-3 rounded-xl text-sm hover:bg-[#e4e4e7] transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <div className="h-4 w-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign In to Dashboard
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-[#3f3f46] mt-8">
            Secure multi-tenant environment · Synced with Neon PostgreSQL.
          </p>
        </div>
      </div>
    </div>
  );
};

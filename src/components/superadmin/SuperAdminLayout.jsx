import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, School, Users, GraduationCap, BookOpen,
  CalendarDays, Clock, Settings, Database, Activity, Shield, ChevronDown,
  Bell, Search, Check, LogOut, ExternalLink, Terminal, X
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
      { id: 'analytics',     label: 'Analytics',     icon: Activity },
    ]
  },
  {
    title: 'Organizations',
    items: [
      { id: 'organizations', label: 'Organizations',  icon: Building2 },
      { id: 'schools',       label: 'Schools',        icon: School },
      { id: 'admins',        label: 'Admins',         icon: Shield },
    ]
  },
  {
    title: 'People',
    items: [
      { id: 'teachers',  label: 'Teachers',  icon: Users },
      { id: 'students',  label: 'Students',  icon: GraduationCap },
    ]
  },
  {
    title: 'Academics',
    items: [
      { id: 'subjects',   label: 'Subjects',          icon: BookOpen },
      { id: 'classes',    label: 'Classes',           icon: CalendarDays },
      { id: 'timetable',  label: 'Timetable',         icon: Clock },
    ]
  },
  {
    title: 'System',
    items: [
      { id: 'system',  label: 'System & DB',   icon: Database },
      { id: 'settings',label: 'Settings',      icon: Settings },
    ]
  },
];

export const SuperAdminSidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  return (
    <aside className="w-60 flex-shrink-0 bg-[#000] border-r border-[#111] flex flex-col h-full py-4">
      {/* Logo */}
      <div className="px-5 mb-6 flex items-center gap-2.5">
        <div className="h-7 w-7 rounded bg-white flex items-center justify-center flex-shrink-0">
          <span className="text-black font-black text-base">S</span>
        </div>
        <div>
          <div className="text-sm font-bold text-[#fafafa] leading-none">Schools24</div>
          <div className="text-[9px] text-[#3f3f46] font-semibold uppercase tracking-widest mt-0.5">Super Admin</div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 px-3 overflow-y-auto space-y-5">
        {NAV_SECTIONS.map(section => (
          <div key={section.title}>
            <div className="px-2 text-[10px] font-semibold text-[#3f3f46] uppercase tracking-widest mb-1.5">{section.title}</div>
            {section.items.map(item => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all mb-0.5
                    ${active ? 'bg-[#111] text-[#fafafa] border border-[#27272a]' : 'text-[#52525b] hover:text-[#fafafa] hover:bg-[#0a0a0a] border border-transparent'}`}
                >
                  <Icon className={`h-4 w-4 flex-shrink-0 ${active ? 'text-[#fafafa]' : 'text-[#3f3f46]'}`} />
                  <span className={active ? 'font-semibold' : ''}>{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-3 pt-4 border-t border-[#111] space-y-1.5">
        <button
          onClick={() => navigate('/app')}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#52525b] hover:text-[#fafafa] hover:bg-[#0a0a0a] transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Open LMS App
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#52525b] hover:text-[#fafafa] hover:bg-[#0a0a0a] transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Back to Home
        </button>
      </div>
    </aside>
  );
};

export const SuperAdminHeader = ({ activeTab }) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const [search, setSearch] = useState('');
  const notifRef = useRef(null);
  useEffect(() => {
    const h = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const PAGE_NAMES = {
    dashboard: 'Dashboard', analytics: 'Analytics', organizations: 'Organizations',
    schools: 'Schools', admins: 'Admins', teachers: 'Teachers', students: 'Students',
    subjects: 'Subjects', classes: 'Classes', timetable: 'Timetable',
    system: 'System & DB', settings: 'Settings',
  };

  return (
    <header className="h-13 flex-shrink-0 border-b border-[#111] bg-[#000] flex items-center px-6 gap-4" style={{ height: '52px' }}>
      <div className="flex items-center gap-2 text-xs text-[#3f3f46]">
        <span>Super Admin</span>
        <span>/</span>
        <span className="text-[#a1a1aa] font-medium">{PAGE_NAMES[activeTab]}</span>
      </div>

      <div className="flex-1" />

      {/* Search */}
      <div className="relative hidden md:block w-56">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#3f3f46]" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-full bg-[#0a0a0a] border border-[#111] rounded-full pl-8 pr-4 py-1.5 text-xs text-[#fafafa] placeholder-[#3f3f46] focus:outline-none focus:border-[#27272a] transition-colors"
        />
      </div>

      {/* Notifications */}
      <div className="relative" ref={notifRef}>
        <button onClick={() => setShowNotifs(v => !v)} className="relative p-2 text-[#3f3f46] hover:text-[#fafafa] transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-red-500 rounded-full" />
        </button>
        {showNotifs && (
          <div className="absolute top-full right-0 mt-1 w-72 rounded-xl border border-[#27272a] bg-[#0a0a0a] shadow-2xl z-50">
            <div className="px-4 py-3 border-b border-[#111] text-xs font-semibold text-[#fafafa]">Notifications</div>
            {[
              { msg: 'New school registration pending approval', time: '5m ago', dot: 'bg-blue-500' },
              { msg: '3 new admin accounts created this week', time: '1h ago', dot: 'bg-emerald-500' },
              { msg: 'DB connection pool at 72%', time: '2h ago', dot: 'bg-amber-500' },
            ].map((n, i) => (
              <div key={i} className="px-4 py-3 border-b border-[#0d0d0d] flex gap-3 hover:bg-[#111] transition-colors">
                <div className={`h-2 w-2 rounded-full ${n.dot} mt-1 flex-shrink-0`} />
                <div>
                  <div className="text-xs text-[#a1a1aa]">{n.msg}</div>
                  <div className="text-[10px] text-[#3f3f46] mt-0.5">{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Avatar */}
      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-xs">
        SA
      </div>
    </header>
  );
};

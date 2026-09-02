import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, Search, ChevronDown, Bell, Command, Check
} from 'lucide-react';

const ROLES = [
  { id: 'admin',     label: 'Trust Super Admin', initials: 'SA', color: 'from-violet-500 to-fuchsia-600' },
  { id: 'principal', label: 'School Principal',  initials: 'PR', color: 'from-blue-500 to-cyan-500' },
  { id: 'teacher',   label: 'CS Teacher',        initials: 'TC', color: 'from-emerald-400 to-teal-500' },
  { id: 'student',   label: 'Student',           initials: 'AS', color: 'from-orange-400 to-amber-500' },
];

export const Header = () => {
  const { 
    currentRole, setCurrentRole,
    selectedSchoolId, setSelectedSchoolId,
    schools,
    globalSearch, setGlobalSearch,
    notifications,
  } = useApp();

  const [showSchoolMenu, setShowSchoolMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const schoolRef = useRef(null);
  const roleRef   = useRef(null);
  const notifRef  = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (schoolRef.current && !schoolRef.current.contains(e.target)) setShowSchoolMenu(false);
      if (roleRef.current   && !roleRef.current.contains(e.target))   setShowRoleMenu(false);
      if (notifRef.current  && !notifRef.current.contains(e.target))  setShowNotifs(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedSchool = schools.find(s => s.id === selectedSchoolId) || schools[0];
  const activeRole = ROLES.find(r => r.id === currentRole) || ROLES[3];

  return (
    <header className="h-14 flex-shrink-0 flex items-center justify-between px-6 border-b border-[#27272a] bg-[#000000] z-30">
      
      {/* ── Left: Workspace breadcrumb + school picker ── */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-[#52525b] font-medium">Workspace</span>
        <span className="text-[#27272a]">/</span>

        <div className="relative" ref={schoolRef}>
          <button
            onClick={() => { setShowSchoolMenu(v => !v); setShowRoleMenu(false); setShowNotifs(false); }}
            className="flex items-center gap-2 text-[#fafafa] hover:bg-[#111111] px-3 py-1.5 rounded-lg transition-colors"
          >
            <Building2 className="h-3.5 w-3.5 text-[#52525b]" />
            <span className="font-medium">
              {selectedSchoolId === 'ALL' ? '42 Trust Schools' : selectedSchool?.name.substring(0, 22)}
            </span>
            <ChevronDown className={`h-3 w-3 text-[#52525b] transition-transform ${showSchoolMenu ? 'rotate-180' : ''}`} />
          </button>

          {showSchoolMenu && (
            <div className="absolute top-full left-0 mt-1 w-72 rounded-xl border border-[#27272a] bg-[#111111] shadow-2xl z-50 overflow-hidden">
              <div className="max-h-72 overflow-y-auto p-1">
                <button
                  onClick={() => { setSelectedSchoolId('ALL'); setShowSchoolMenu(false); }}
                  className="w-full text-left flex items-center justify-between px-3 py-2.5 text-sm rounded-lg hover:bg-[#1a1a1a] text-[#a1a1aa] hover:text-[#fafafa] transition-colors"
                >
                  All 42 Trust Schools
                  {selectedSchoolId === 'ALL' && <Check className="h-3.5 w-3.5 text-emerald-500" />}
                </button>
                {schools.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setSelectedSchoolId(s.id); setShowSchoolMenu(false); }}
                    className="w-full text-left flex items-center justify-between px-3 py-2.5 text-sm rounded-lg hover:bg-[#1a1a1a] text-[#a1a1aa] hover:text-[#fafafa] transition-colors"
                  >
                    <span className="truncate pr-2">{s.name}</span>
                    {selectedSchoolId === s.id && <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Search + Notifications + Role Switcher ── */}
      <div className="flex items-center gap-3">

        {/* Search */}
        <div className="relative hidden md:flex items-center w-60">
          <Search className="absolute left-3 h-3.5 w-3.5 text-[#52525b]" />
          <input
            type="text"
            value={globalSearch}
            onChange={e => setGlobalSearch(e.target.value)}
            placeholder="Search..."
            className="w-full bg-[#111111] border border-[#27272a] rounded-full pl-9 pr-10 py-2 text-sm text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-[#3f3f46] transition-colors"
          />
          <div className="absolute right-3 flex items-center gap-0.5 text-[10px] text-[#52525b]">
            <Command className="h-3 w-3" /> K
          </div>
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotifs(v => !v); setShowRoleMenu(false); setShowSchoolMenu(false); }}
            className="relative p-2 text-[#52525b] hover:text-[#fafafa] hover:bg-[#111111] rounded-lg transition-colors"
          >
            <Bell className="h-4.5 w-4.5" style={{ height: '18px', width: '18px' }} />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-black" />
            )}
          </button>

          {showNotifs && (
            <div className="absolute top-full right-0 mt-1 w-80 rounded-xl border border-[#27272a] bg-[#111111] shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-[#27272a] flex items-center justify-between">
                <span className="text-xs font-semibold text-[#fafafa]">Notifications</span>
                <span className="text-[10px] text-[#52525b]">{notifications.length} unread</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-[#1a1a1a]">
                {notifications.map(n => (
                  <div key={n.id} className="px-4 py-3 hover:bg-[#1a1a1a] transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${n.type === 'live' ? 'bg-red-500' : n.type === 'system' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                      <div>
                        <div className="text-xs font-semibold text-[#fafafa]">{n.title}</div>
                        <div className="text-[11px] text-[#52525b] mt-0.5 leading-relaxed">{n.message}</div>
                        <div className="text-[10px] text-[#3f3f46] mt-1">{n.time}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher (avatar + dropdown) */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => { setShowRoleMenu(v => !v); setShowSchoolMenu(false); setShowNotifs(false); }}
            className="flex items-center gap-2 hover:bg-[#111111] pl-1 pr-2 py-1 rounded-lg transition-colors"
          >
            <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${activeRole.color} flex items-center justify-center text-white font-bold text-xs shadow-lg`}>
              {activeRole.initials}
            </div>
            <ChevronDown className={`h-3 w-3 text-[#52525b] transition-transform ${showRoleMenu ? 'rotate-180' : ''}`} />
          </button>

          {showRoleMenu && (
            <div className="absolute top-full right-0 mt-1 w-56 rounded-xl border border-[#27272a] bg-[#111111] shadow-2xl z-50 overflow-hidden p-1">
              <div className="px-3 py-2 mb-1">
                <div className="text-[10px] font-semibold text-[#52525b] uppercase tracking-widest">Switch Role</div>
              </div>
              {ROLES.map(role => (
                <button
                  key={role.id}
                  onClick={() => { setCurrentRole(role.id); setShowRoleMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#1a1a1a] transition-colors text-left"
                >
                  <div className={`h-7 w-7 rounded-full bg-gradient-to-br ${role.color} flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0`}>
                    {role.initials}
                  </div>
                  <span className={`text-sm font-medium ${currentRole === role.id ? 'text-[#fafafa]' : 'text-[#a1a1aa]'}`}>
                    {role.label}
                  </span>
                  {currentRole === role.id && <Check className="h-3.5 w-3.5 text-emerald-500 ml-auto flex-shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

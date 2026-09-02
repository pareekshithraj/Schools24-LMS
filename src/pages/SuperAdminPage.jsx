import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, School, Users, GraduationCap, Shield, Activity,
  TrendingUp, Plus, Trash2, Pencil, Search, Database,
  CheckCircle2, RefreshCw, ExternalLink, Clock, Wifi, Server
} from 'lucide-react';
import { SuperAdminSidebar, SuperAdminHeader } from '../components/superadmin/SuperAdminLayout.jsx';
import {
  CreateOrgWizard, CreateAdminModal, CreateTeacherModal,
  CreateStudentModal, SubjectsManager, ClassesManager, TimetablePage
} from '../components/superadmin/SuperAdminComponents.jsx';
import { useApp } from '../context/AppContext.jsx';

/* ── Small stat card ── */
const MiniCard = ({ label, value, icon: Icon, color }) => (
  <div className={`rounded-2xl p-5 relative overflow-hidden text-white ${color}`}>
    <div className="absolute top-4 right-4 bg-white/20 p-2 rounded-xl">
      <Icon className="h-4 w-4 text-white" />
    </div>
    <Icon className="absolute -right-4 -bottom-4 h-20 w-20 text-white/10" />
    <div className="text-xs text-white/80 mb-2">{label}</div>
    <div className="text-3xl font-bold">{value}</div>
  </div>
);

/* ── Section header ── */
const SectionHeader = ({ title, desc, action }) => (
  <div className="flex items-end justify-between mb-5">
    <div>
      <h2 className="text-lg font-bold text-[#fafafa]">{title}</h2>
      {desc && <p className="text-xs text-[#52525b] mt-0.5">{desc}</p>}
    </div>
    {action}
  </div>
);

/* ── Generic row table ── */
const DataTable = ({ columns, rows, onDelete }) => (
  <div className="card overflow-hidden">
    <table className="data-table">
      <thead>
        <tr>{columns.map(c => <th key={c}>{c}</th>)}</tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr><td colSpan={columns.length} className="text-center py-8 text-[#3f3f46]">No records yet</td></tr>
        ) : rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j} className={j === 0 ? 'font-semibold text-[#fafafa]' : ''}>{cell}</td>
            ))}
            <td>
              {onDelete && (
                <button onClick={() => onDelete(i)} className="p-1.5 text-[#3f3f46] hover:text-red-400 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ════════════════════════════════════════════
   DASHBOARD TAB
════════════════════════════════════════════ */
const DashboardTab = ({ orgs, admins, teachers, students }) => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-[#fafafa]">Super Admin Dashboard</h1>
      <p className="text-sm text-[#52525b] mt-1">Complete platform overview · VidyaSetu LMS</p>
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <MiniCard label="Organizations" value={orgs.length} icon={Building2} color="bg-gradient-to-br from-violet-600 to-fuchsia-700" />
      <MiniCard label="Admins"        value={admins.length} icon={Shield}    color="bg-gradient-to-br from-blue-600 to-cyan-600" />
      <MiniCard label="Teachers"      value={teachers.length + 480} icon={Users}    color="bg-gradient-to-br from-emerald-600 to-teal-600" />
      <MiniCard label="Students"      value={(students.length + 15420).toLocaleString()} icon={GraduationCap} color="bg-gradient-to-br from-amber-500 to-orange-600" />
    </div>

    {/* Recent activity */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="card p-5">
        <div className="text-xs font-bold text-[#fafafa] uppercase tracking-widest mb-4">Recent Organizations</div>
        <div className="space-y-3">
          {[
            { name: 'VidyaSetu Foundation', type: 'Trust', admin: 'Dr. Rajesh Gupta', status: 'Active' },
            { name: 'ABC Public School', type: 'School', admin: 'Mrs. Sita', status: 'Active' },
            ...orgs.slice(0, 3).map(o => ({ name: o.name, type: o.type, admin: o.adminName, status: 'Active' }))
          ].slice(0,5).map((o, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0
                ${o.type === 'trust' ? 'bg-violet-600' : o.type === 'school' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                {o.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-[#fafafa] truncate">{o.name}</div>
                <div className="text-[10px] text-[#52525b]">{o.type} · {o.admin}</div>
              </div>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">{o.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <div className="text-xs font-bold text-[#fafafa] uppercase tracking-widest mb-4">System Health</div>
        <div className="space-y-3">
          {[
            { label: 'API Server',       status: 'Operational', latency: '12ms',  dot: 'bg-emerald-500' },
            { label: 'Neon PostgreSQL',  status: 'Operational', latency: '34ms',  dot: 'bg-emerald-500' },
            { label: 'Live Streaming',   status: 'Operational', latency: '92ms',  dot: 'bg-emerald-500' },
            { label: 'CDN',              status: 'Degraded',   latency: '210ms', dot: 'bg-amber-500' },
            { label: 'Python Sandbox',   status: 'Operational', latency: '156ms', dot: 'bg-emerald-500' },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`h-2 w-2 rounded-full flex-shrink-0 ${s.dot} ${s.status === 'Operational' ? 'animate-pulse' : ''}`} />
              <span className="text-xs text-[#a1a1aa] flex-1">{s.label}</span>
              <span className="text-[10px] font-mono text-[#52525b]">{s.latency}</span>
              <span className={`text-[10px] font-semibold ${s.status === 'Operational' ? 'text-emerald-400' : 'text-amber-400'}`}>{s.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/* ════════════════════════════════════════════
   ORGANIZATIONS TAB
════════════════════════════════════════════ */
const OrgsTab = ({ orgs, setOrgs }) => {
  const [showWizard, setShowWizard] = useState(false);
  const TYPE_COLOR = { trust: 'bg-violet-500', school: 'bg-blue-500', org: 'bg-emerald-500', Trust: 'bg-violet-500', School: 'bg-blue-500', Organization: 'bg-emerald-500' };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Organizations"
        desc="Manage trusts, schools, and organizations"
        action={
          <button onClick={() => setShowWizard(true)}
            className="flex items-center gap-2 bg-white text-black font-bold px-4 py-2 rounded-xl text-sm hover:bg-[#e4e4e7]">
            <Plus className="h-4 w-4" /> Create Organization
          </button>
        }
      />
      {showWizard && <CreateOrgWizard onClose={() => setShowWizard(false)} onCreated={async (o) => {
        try {
          const res = await fetch('/api/admin/organizations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: o.name, type: o.type, city: o.city, state: o.state, admin_name: o.adminName, admin_email: o.adminEmail })
          });
          if (res.ok) {
            const data = await res.json();
            setOrgs(p => [{ ...data, adminName: data.admin_name, adminEmail: data.admin_email }, ...p]);
          }
        } catch(e) { console.error('Failed to create org', e); }
      }} />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { id: 'vs', name: 'VidyaSetu Foundation', type: 'trust', city: 'Jaipur', state: 'Rajasthan', adminName: 'Dr. Rajesh Gupta', adminEmail: 'admin@vidyasetu.org' },
          ...orgs
        ].map((o, i) => (
          <div key={i} className="card p-5 hover:bg-[#0d0d0d] transition-colors">
            <div className="flex items-start gap-3 mb-4">
              <div className={`h-10 w-10 rounded-xl ${TYPE_COLOR[o.type] || 'bg-[#27272a]'} flex items-center justify-center text-white font-black text-lg flex-shrink-0`}>
                {o.name[0]}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-[#fafafa] truncate">{o.name}</div>
                <div className="text-[10px] font-semibold text-[#52525b] uppercase tracking-wider mt-0.5">{o.type}</div>
              </div>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex gap-2"><span className="text-[#52525b] w-16">Location</span><span className="text-[#a1a1aa]">{o.city}, {o.state}</span></div>
              <div className="flex gap-2"><span className="text-[#52525b] w-16">Admin</span><span className="text-[#a1a1aa]">{o.adminName}</span></div>
              <div className="flex gap-2"><span className="text-[#52525b] w-16">Email</span><span className="text-[#a1a1aa] truncate">{o.adminEmail}</span></div>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 text-xs text-[#52525b] hover:text-[#fafafa] bg-[#0a0a0a] border border-[#27272a] py-1.5 rounded-lg transition-colors">Manage</button>
              <button onClick={() => setOrgs(p => p.filter(x => x.id !== o.id))} className="p-1.5 text-[#3f3f46] hover:text-red-400 transition-colors border border-[#27272a] rounded-lg bg-[#0a0a0a]">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════
   ADMINS TAB
════════════════════════════════════════════ */
const AdminsTab = ({ admins, setAdmins, orgs }) => {
  const [showCreate, setShowCreate] = useState(false);
  const roleColor = { 'trust-admin': 'text-violet-400 bg-violet-500/10', 'school-admin': 'text-blue-400 bg-blue-500/10', 'org-admin': 'text-emerald-400 bg-emerald-500/10', 'principal': 'text-amber-400 bg-amber-500/10' };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Admin Accounts"
        desc="Create and manage platform administrators"
        action={
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-white text-black font-bold px-4 py-2 rounded-xl text-sm hover:bg-[#e4e4e7]">
            <Plus className="h-4 w-4" /> Create Admin
          </button>
        }
      />
      {showCreate && (
        <CreateAdminModal
          onClose={() => setShowCreate(false)}
          onCreated={async (a) => {
            try {
              const res = await fetch('/api/admin/admins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: a.name, email: a.email, role: a.role, org_id: a.orgId, password: a.password })
              });
              if (res.ok) {
                const data = await res.json();
                setAdmins(p => [{ ...data, orgId: data.org_id }, ...p]);
              }
            } catch(e) { console.error('Failed to create admin', e); }
          }}
          orgs={[{ id: 'vs', name: 'VidyaSetu Foundation' }, ...orgs]}
        />
      )}
      <div className="card overflow-hidden">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Organization</th><th></th></tr></thead>
          <tbody>
            {[
              { name: 'Dr. Rajesh Gupta', email: 'admin@vidyasetu.org', role: 'trust-admin', orgId: 'VidyaSetu Foundation' },
              { name: 'Mrs. Sita Devi', email: 'principal@abc.org', role: 'principal', orgId: 'ABC Public School' },
              ...admins
            ].map((a, i) => (
              <tr key={i}>
                <td className="font-semibold text-[#fafafa]">{a.name}</td>
                <td className="font-mono text-xs">{a.email}</td>
                <td><span className={`text-[10px] font-bold px-2 py-1 rounded-full ${roleColor[a.role] || 'text-[#a1a1aa] bg-[#111]'}`}>{a.role}</span></td>
                <td className="text-[#52525b]">{a.orgId || orgs.find(o => o.id === a.orgId)?.name}</td>
                <td><button onClick={() => setAdmins(p => p.filter((_, j) => j !== i - 2))} className="p-1.5 text-[#3f3f46] hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════
   TEACHERS TAB
════════════════════════════════════════════ */
const TeachersTab = ({ teachers, setTeachers, schools }) => {
  const [showCreate, setShowCreate] = useState(false);
  return (
    <div className="space-y-5">
      <SectionHeader title="Teachers" desc="Manage all teachers across the network"
        action={<button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-white text-black font-bold px-4 py-2 rounded-xl text-sm"><Plus className="h-4 w-4" /> Add Teacher</button>} />
      {showCreate && <CreateTeacherModal onClose={() => setShowCreate(false)} onCreated={async (t) => {
        try {
          const res = await fetch('/api/admin/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: t.name, email: t.email, role: 'teacher', school_id: t.schoolId, subject: t.subject })
          });
          if (res.ok) {
            const data = await res.json();
            setTeachers(p => [{ ...data, schoolId: data.school_id }, ...p]);
          }
        } catch(e) { console.error('Failed to add teacher', e); }
      }} schools={schools} />}
      <DataTable columns={['Name', 'Email', 'Subject', 'School', '']}
        rows={teachers.map(t => [t.name, t.email || '—', t.subject || '—', t.schoolId || '—'])}
        onDelete={i => setTeachers(p => p.filter((_, j) => j !== i))} />
    </div>
  );
};

/* ════════════════════════════════════════════
   STUDENTS TAB
════════════════════════════════════════════ */
const StudentsTab = ({ students, setStudents, schools }) => {
  const [showCreate, setShowCreate] = useState(false);
  return (
    <div className="space-y-5">
      <SectionHeader title="Students" desc="Global student directory"
        action={<button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-white text-black font-bold px-4 py-2 rounded-xl text-sm"><Plus className="h-4 w-4" /> Add Student</button>} />
      {showCreate && <CreateStudentModal onClose={() => setShowCreate(false)} onCreated={async (s) => {
        try {
          const res = await fetch('/api/admin/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: s.name, role: 'student', school_id: s.schoolId, grade: s.grade, roll_no: s.rollNo })
          });
          if (res.ok) {
            const data = await res.json();
            setStudents(p => [{ ...data, schoolId: data.school_id, rollNo: data.roll_no }, ...p]);
          }
        } catch(e) { console.error('Failed to add student', e); }
      }} schools={schools} />}
      <DataTable columns={['Name', 'Roll No', 'Grade', 'School', '']}
        rows={students.map(s => [s.name, s.rollNo || '—', `Grade ${s.grade || '—'}`, s.schoolId || '—'])}
        onDelete={i => setStudents(p => p.filter((_, j) => j !== i))} />
    </div>
  );
};

/* ════════════════════════════════════════════
   SYSTEM TAB (simplified from old DevDashboard)
════════════════════════════════════════════ */
const SystemTab = () => {
  const [refreshing, setRefreshing] = useState(false);
  const refresh = async () => { setRefreshing(true); await new Promise(r => setTimeout(r, 600)); setRefreshing(false); };
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#fafafa]">System & Database</h2>
          <p className="text-xs text-[#52525b] mt-0.5">Infrastructure health and DB connection</p>
        </div>
        <button onClick={refresh} className={`p-2 text-[#52525b] hover:text-[#fafafa] transition-colors ${refreshing ? 'animate-spin' : ''}`}><RefreshCw className="h-4 w-4" /></button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'API Uptime', value: '99.98%', color: 'bg-gradient-to-br from-emerald-600 to-teal-700', icon: Server },
          { label: 'DB Queries', value: '8,249', color: 'bg-gradient-to-br from-blue-600 to-cyan-700', icon: Database },
          { label: 'Active Users', value: '487', color: 'bg-gradient-to-br from-violet-600 to-fuchsia-700', icon: Users },
          { label: 'Avg Latency', value: '34ms', color: 'bg-gradient-to-br from-amber-500 to-orange-600', icon: Clock },
        ].map(({ label, value, color, icon: Icon }) => (
          <MiniCard key={label} label={label} value={value} icon={Icon} color={color} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="text-xs font-bold text-[#fafafa] mb-4">Services</div>
          <div className="space-y-3">
            {[
              { name: 'LMS Frontend (Vite)', status: 'Operational', latency: '48ms', type: 'Frontend' },
              { name: 'Express API Server', status: 'Operational', latency: '12ms', type: 'Backend' },
              { name: 'Neon PostgreSQL', status: 'Operational', latency: '34ms', type: 'Database' },
              { name: 'Schools24 Meet (WebRTC)', status: 'Operational', latency: '92ms', type: 'Streaming' },
              { name: 'CDN', status: 'Degraded', latency: '210ms', type: 'CDN' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3 text-xs">
                <div className={`h-2 w-2 rounded-full flex-shrink-0 ${s.status === 'Operational' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span className="text-[#a1a1aa] flex-1">{s.name}</span>
                <span className="font-mono text-[#52525b]">{s.latency}</span>
                <span className={`font-semibold ${s.status === 'Operational' ? 'text-emerald-400' : 'text-amber-400'}`}>{s.status}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <div className="text-xs font-bold text-[#fafafa] mb-4">DB Connection</div>
          <div className="space-y-3 text-xs font-mono">
            {[
              { k: 'Host', v: 'ep-winter-wave-b3a7zel9-pooler.c-4.ap-southeast-1.aws.neon.tech' },
              { k: 'Database', v: 'neondb' },
              { k: 'SSL', v: 'require + channel_binding' },
              { k: 'Pool', v: '3 / 10 connections active' },
              { k: 'Status', v: '✓ Connected' },
            ].map(({ k, v }) => (
              <div key={k} className="flex gap-4">
                <span className="text-[#3f3f46] w-20 flex-shrink-0">{k}</span>
                <span className="text-[#52525b] truncate">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════
   ANALYTICS / PERFORMANCE TAB
════════════════════════════════════════════ */
const AnalyticsTab = () => {
  const { trustAnalytics } = useApp();

  if (!trustAnalytics || trustAnalytics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-[#3f3f46] space-y-2">
        <div className="animate-spin text-2xl">⏳</div>
        <div className="text-sm">Loading performance data...</div>
      </div>
    );
  }

  // Find max XP to calculate progress bars relative to the top school
  const maxXP = Math.max(...trustAnalytics.map(s => Number(s.total_xp) || 0));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#fafafa]">Trust Performance Analytics</h1>
        <p className="text-sm text-[#52525b] mt-1">School vs School Rankings & Engagement Metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MiniCard label="Top Performing School" value={trustAnalytics[0]?.name || 'N/A'} icon={Trophy} color="bg-gradient-to-br from-amber-500 to-orange-600" />
        <MiniCard label="Total Trust XP" value={trustAnalytics.reduce((acc, curr) => acc + (Number(curr.total_xp) || 0), 0).toLocaleString()} icon={Zap} color="bg-gradient-to-br from-violet-600 to-fuchsia-700" />
        <MiniCard label="Trust Avg Pass Rate" value={`${Math.round(trustAnalytics.reduce((acc, curr) => acc + (Number(curr.passed_submissions) / Math.max(Number(curr.total_submissions), 1)), 0) / trustAnalytics.length * 100 || 0)}%`} icon={Target} color="bg-gradient-to-br from-emerald-600 to-teal-700" />
      </div>

      <div className="card p-6">
        <div className="text-sm font-bold text-[#fafafa] uppercase tracking-widest mb-6">School Leaderboard (By XP)</div>
        <div className="space-y-6">
          {trustAnalytics.map((school, index) => {
            const xp = Number(school.total_xp) || 0;
            const pct = maxXP > 0 ? (xp / maxXP) * 100 : 0;
            
            return (
              <div key={school.id} className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${index === 0 ? 'bg-amber-500 text-white' : index === 1 ? 'bg-zinc-400 text-white' : index === 2 ? 'bg-orange-700 text-white' : 'bg-[#1f1f22] text-[#a1a1aa]'}`}>
                      {index + 1}
                    </div>
                    <span className="font-semibold text-[#fafafa]">{school.name}</span>
                    <span className="text-[10px] text-[#52525b] uppercase">{school.city}</span>
                  </div>
                  <div className="font-mono text-emerald-400 font-bold">{xp.toLocaleString()} XP</div>
                </div>
                
                {/* Progress Bar */}
                <div className="h-2 w-full bg-[#111] rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${index === 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-[10px] text-[#52525b]">
                  <span>{school.total_submissions} total submissions</span>
                  <span>{school.passed_submissions} passed</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════
   MAIN SUPER ADMIN PAGE
════════════════════════════════════════════ */
export const SuperAdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { schools } = useApp();

  const [orgs, setOrgs] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [orgsRes, adminsRes, usersRes] = await Promise.all([
          fetch('/api/admin/organizations').then(r => r.ok ? r.json() : []),
          fetch('/api/admin/admins').then(r => r.ok ? r.json() : []),
          fetch('/api/admin/users').then(r => r.ok ? r.json() : [])
        ]);
        
        // Map postgres snake_case to frontend camelCase
        if (orgsRes && Array.isArray(orgsRes)) {
          setOrgs(orgsRes.map(o => ({ ...o, adminName: o.admin_name, adminEmail: o.admin_email })));
        }
        
        if (adminsRes && Array.isArray(adminsRes)) {
          setAdmins(adminsRes.map(a => ({ ...a, orgId: a.org_id })));
        }
        
        if (usersRes && Array.isArray(usersRes)) {
          setTeachers(usersRes.filter(u => u.role === 'teacher').map(u => ({ ...u, schoolId: u.school_id })));
          setStudents(usersRes.filter(u => u.role === 'student').map(u => ({ ...u, schoolId: u.school_id, rollNo: u.roll_no })));
        }
      } catch (e) {
        console.error('Failed to fetch admin data from Postgres', e);
      }
    };
    fetchData();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':    return <DashboardTab orgs={orgs} admins={admins} teachers={teachers} students={students} />;
      case 'organizations':return <OrgsTab orgs={orgs} setOrgs={setOrgs} />;
      case 'schools':      return <OrgsTab orgs={orgs.filter(o => o.type === 'school')} setOrgs={setOrgs} />;
      case 'admins':       return <AdminsTab admins={admins} setAdmins={setAdmins} orgs={orgs} />;
      case 'teachers':     return <TeachersTab teachers={teachers} setTeachers={setTeachers} schools={schools} />;
      case 'students':     return <StudentsTab students={students} setStudents={setStudents} schools={schools} />;
      case 'subjects':     return <SubjectsManager />;
      case 'classes':      return <ClassesManager />;
      case 'timetable':    return <TimetablePage />;
      case 'system':       return <SystemTab />;
      case 'analytics':    return <AnalyticsTab />;
      case 'settings':
        return (
          <div className="flex flex-col items-center justify-center h-48 text-[#3f3f46] space-y-2">
            <div className="text-4xl">🚧</div>
            <div className="text-sm">Coming soon — {activeTab}</div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#000', color: '#fafafa', overflow: 'hidden' }}>
      <SuperAdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <SuperAdminHeader activeTab={activeTab} />
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

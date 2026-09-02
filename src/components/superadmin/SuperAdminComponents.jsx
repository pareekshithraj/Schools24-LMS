import React, { useState } from 'react';
import {
  Building2, School, Users, GraduationCap, BookOpen, Shield, BarChart3,
  TrendingUp, Plus, ChevronRight, Eye, EyeOff, X, Check, AlertCircle,
  Briefcase, Globe, Copy, Trash2, Pencil, Search, Filter
} from 'lucide-react';

/* ══════════════════════════════════════════════════════════════
   SHARED HELPERS
══════════════════════════════════════════════════════════════ */
const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className={`rounded-2xl p-5 relative overflow-hidden text-white ${color}`}
    style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
    <div className="absolute top-4 right-4 bg-white/20 p-2 rounded-xl">
      <Icon className="h-4 w-4 text-white" />
    </div>
    <Icon className="absolute -right-4 -bottom-4 h-20 w-20 text-white/10" />
    <div className="text-xs font-medium text-white/80 mb-2">{label}</div>
    <div className="text-3xl font-bold">{value}</div>
    {sub && <div className="text-xs text-white/60 mt-1">{sub}</div>}
  </div>
);

/* ── Modal Shell ── */
const Modal = ({ title, onClose, children, wide }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
    <div className={`bg-[#0a0a0a] border border-[#27272a] rounded-2xl shadow-2xl w-full ${wide ? 'max-w-2xl' : 'max-w-lg'}`}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#111]">
        <h2 className="text-sm font-bold text-[#fafafa]">{title}</h2>
        <button onClick={onClose} className="text-[#52525b] hover:text-[#fafafa] transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const Input = ({ label, ...props }) => (
  <div>
    <label className="text-xs font-semibold text-[#a1a1aa] block mb-1.5">{label}</label>
    <input
      {...props}
      className="w-full bg-[#000] border border-[#27272a] rounded-xl px-4 py-2.5 text-sm text-[#fafafa] placeholder-[#3f3f46] focus:outline-none focus:border-[#52525b] transition-colors"
    />
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div>
    <label className="text-xs font-semibold text-[#a1a1aa] block mb-1.5">{label}</label>
    <select
      {...props}
      className="w-full bg-[#000] border border-[#27272a] rounded-xl px-4 py-2.5 text-sm text-[#fafafa] focus:outline-none focus:border-[#52525b] transition-colors"
    >
      {children}
    </select>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   ORGANIZATION CREATION WIZARD
══════════════════════════════════════════════════════════════ */
const ORG_TYPES = [
  { id: 'trust',  label: 'Trust / School Network', icon: Globe,    desc: 'A network of multiple schools under one umbrella (e.g. VidyaSetu Foundation)', color: 'border-violet-500/40 bg-violet-500/5' },
  { id: 'school', label: 'School',                  icon: School,   desc: 'A single educational institution (e.g. ABC Public School)', color: 'border-blue-500/40 bg-blue-500/5' },
  { id: 'org',    label: 'Organization',            icon: Briefcase, desc: 'A corporate, NGO, or other organization running education programs', color: 'border-emerald-500/40 bg-emerald-500/5' },
];

const STEP_LABELS = ['Select Type', 'Details', 'Create Admin', 'Review'];

export const CreateOrgWizard = ({ onClose, onCreated }) => {
  const [step, setStep] = useState(0);
  const [orgType, setOrgType] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({
    name: '', city: '', state: '', address: '', country: 'India',
    gradesFrom: '6', gradesTo: '12', schoolCount: '',
    adminName: '', adminEmail: '', adminPassword: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const genPassword = () => {
    const pw = Math.random().toString(36).slice(-8).toUpperCase() + '@1';
    set('adminPassword', pw);
  };

  const canProceedStep0 = orgType !== '';
  const canProceedStep1 = form.name && form.city && form.state;
  const canProceedStep2 = form.adminName && form.adminEmail && form.adminPassword.length >= 6;

  const handleCreate = () => {
    onCreated({
      type: orgType,
      name: form.name,
      city: form.city,
      state: form.state,
      adminName: form.adminName,
      adminEmail: form.adminEmail,
    });
    onClose();
  };

  return (
    <Modal title="Create New Organization" onClose={onClose} wide>
      {/* Step progress */}
      <div className="flex items-center gap-2 mb-6">
        {STEP_LABELS.map((l, i) => (
          <React.Fragment key={l}>
            <div className="flex items-center gap-2">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all
                ${i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-[#fafafa] text-black' : 'bg-[#111] text-[#52525b]'}`}>
                {i < step ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              <span className={`text-[11px] font-semibold ${i === step ? 'text-[#fafafa]' : 'text-[#52525b]'}`}>{l}</span>
            </div>
            {i < STEP_LABELS.length - 1 && <div className="flex-1 h-px bg-[#27272a]" />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 0: Type Selection */}
      {step === 0 && (
        <div className="space-y-3">
          <p className="text-sm text-[#52525b] mb-4">What are you creating?</p>
          {ORG_TYPES.map(t => (
            <button
              key={t.id}
              onClick={() => setOrgType(t.id)}
              className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left
                ${orgType === t.id ? t.color + ' border-opacity-100' : 'border-[#1a1a1a] hover:border-[#27272a]'}`}
            >
              <t.icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${orgType === t.id ? 'text-[#fafafa]' : 'text-[#52525b]'}`} />
              <div>
                <div className="text-sm font-semibold text-[#fafafa]">{t.label}</div>
                <div className="text-xs text-[#52525b] mt-0.5">{t.desc}</div>
              </div>
              {orgType === t.id && <Check className="h-4 w-4 text-emerald-400 ml-auto flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}

      {/* Step 1: Details */}
      {step === 1 && (
        <div className="space-y-4">
          <Input label="Organization Name *" value={form.name} onChange={e => set('name', e.target.value)} placeholder={orgType === 'trust' ? 'VidyaSetu Foundation' : orgType === 'school' ? 'ABC Public School' : 'TechCorp Education'} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="City *" value={form.city} onChange={e => set('city', e.target.value)} placeholder="Jaipur" />
            <Input label="State *" value={form.state} onChange={e => set('state', e.target.value)} placeholder="Rajasthan" />
          </div>
          <Input label="Address" value={form.address} onChange={e => set('address', e.target.value)} placeholder="123, Main Street" />
          <Select label="Country" value={form.country} onChange={e => set('country', e.target.value)}>
            <option>India</option><option>USA</option><option>UK</option><option>Other</option>
          </Select>
          {orgType === 'trust' && (
            <Input label="Number of Schools" type="number" value={form.schoolCount} onChange={e => set('schoolCount', e.target.value)} placeholder="42" />
          )}
          {orgType === 'school' && (
            <div className="grid grid-cols-2 gap-3">
              <Select label="Grade From" value={form.gradesFrom} onChange={e => set('gradesFrom', e.target.value)}>
                {[1,2,3,4,5,6,7,8].map(g => <option key={g}>{g}</option>)}
              </Select>
              <Select label="Grade To" value={form.gradesTo} onChange={e => set('gradesTo', e.target.value)}>
                {[8,9,10,11,12].map(g => <option key={g}>{g}</option>)}
              </Select>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Admin Account */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-[#000] border border-[#27272a] rounded-xl p-3 flex gap-2 items-start">
            <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-[#a1a1aa]">
              This creates the <strong className="text-[#fafafa]">
                {orgType === 'trust' ? 'Trust Admin' : orgType === 'school' ? 'School Admin' : 'Organization Admin'}
              </strong> who will manage {form.name}. Share credentials securely.
            </div>
          </div>
          <Input label="Admin Full Name *" value={form.adminName} onChange={e => set('adminName', e.target.value)} placeholder="Rajesh Gupta" />
          <Input label="Admin Email *" type="email" value={form.adminEmail} onChange={e => set('adminEmail', e.target.value)} placeholder="admin@example.org" />
          <div>
            <label className="text-xs font-semibold text-[#a1a1aa] block mb-1.5">Password *</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={form.adminPassword}
                onChange={e => set('adminPassword', e.target.value)}
                placeholder="Min 6 characters"
                className="w-full bg-[#000] border border-[#27272a] rounded-xl px-4 py-2.5 pr-24 text-sm text-[#fafafa] placeholder-[#3f3f46] focus:outline-none focus:border-[#52525b] transition-colors"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button type="button" onClick={genPassword} className="text-[10px] text-[#52525b] hover:text-[#fafafa] bg-[#111] px-2 py-1 rounded transition-colors">Generate</button>
                <button type="button" onClick={() => setShowPw(v => !v)} className="text-[#52525b] hover:text-[#fafafa] p-1">
                  {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 space-y-3">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">Summary</div>
            {[
              { k: 'Type',      v: ORG_TYPES.find(t => t.id === orgType)?.label },
              { k: 'Name',      v: form.name },
              { k: 'Location',  v: `${form.city}, ${form.state}, ${form.country}` },
              { k: 'Admin',     v: form.adminName },
              { k: 'Email',     v: form.adminEmail },
              { k: 'Password',  v: '••••••••' },
            ].map(({ k, v }) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-[#52525b]">{k}</span>
                <span className="text-[#fafafa] font-medium">{v}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#52525b]">
            Make sure to send credentials to the admin before closing this dialog.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#111]">
        <button
          onClick={() => step > 0 ? setStep(s => s - 1) : onClose()}
          className="text-sm text-[#52525b] hover:text-[#fafafa] transition-colors"
        >
          {step === 0 ? 'Cancel' : '← Back'}
        </button>
        <button
          onClick={() => step < 3 ? setStep(s => s + 1) : handleCreate()}
          disabled={step === 0 ? !canProceedStep0 : step === 1 ? !canProceedStep1 : step === 2 ? !canProceedStep2 : false}
          className="flex items-center gap-2 bg-white text-black font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-[#e4e4e7] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {step === 3 ? <><Check className="h-4 w-4" /> Create Organization</> : <>Next →</>}
        </button>
      </div>
    </Modal>
  );
};

/* ══════════════════════════════════════════════════════════════
   CREATE ADMIN MODAL
══════════════════════════════════════════════════════════════ */
export const CreateAdminModal = ({ onClose, onCreated, orgs }) => {
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'school-admin', orgId: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const genPw = () => set('password', Math.random().toString(36).slice(-8).toUpperCase() + '@1');
  const valid = form.name && form.email && form.password.length >= 6 && form.orgId;

  return (
    <Modal title="Create Admin Account" onClose={onClose}>
      <div className="space-y-4">
        <Input label="Full Name *" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Dr. Sunita Deshmukh" />
        <Input label="Email *" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="admin@school.org" />
        <Select label="Role *" value={form.role} onChange={e => set('role', e.target.value)}>
          <option value="trust-admin">Trust Admin</option>
          <option value="school-admin">School Admin</option>
          <option value="org-admin">Organization Admin</option>
          <option value="principal">Principal</option>
        </Select>
        <Select label="Organization *" value={form.orgId} onChange={e => set('orgId', e.target.value)}>
          <option value="">Select organization...</option>
          {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
        </Select>
        <div>
          <label className="text-xs font-semibold text-[#a1a1aa] block mb-1.5">Password *</label>
          <div className="relative">
            <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)}
              placeholder="Min 6 characters"
              className="w-full bg-[#000] border border-[#27272a] rounded-xl px-4 py-2.5 pr-24 text-sm text-[#fafafa] placeholder-[#3f3f46] focus:outline-none focus:border-[#52525b] transition-colors" />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button type="button" onClick={genPw} className="text-[10px] text-[#52525b] hover:text-[#fafafa] bg-[#111] px-2 py-1 rounded">Generate</button>
              <button type="button" onClick={() => setShowPw(v => !v)} className="p-1 text-[#52525b] hover:text-[#fafafa]">
                {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="text-sm text-[#52525b] hover:text-[#fafafa] px-4 py-2">Cancel</button>
          <button
            disabled={!valid}
            onClick={() => { onCreated({ ...form }); onClose(); }}
            className="flex items-center gap-2 bg-white text-black font-bold px-5 py-2.5 rounded-xl text-sm disabled:opacity-40">
            <Check className="h-4 w-4" /> Create Admin
          </button>
        </div>
      </div>
    </Modal>
  );
};

/* ══════════════════════════════════════════════════════════════
   CREATE TEACHER MODAL
══════════════════════════════════════════════════════════════ */
export const CreateTeacherModal = ({ onClose, onCreated, schools }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', schoolId: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.name && form.email && form.schoolId;
  return (
    <Modal title="Add Teacher" onClose={onClose}>
      <div className="space-y-4">
        <Input label="Full Name *" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Mrs. Priya Sharma" />
        <Input label="Email *" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="teacher@school.org" />
        <Input label="Phone" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
        <Input label="Subject" value={form.subject} onChange={e => set('subject', e.target.value)} placeholder="Computer Science" />
        <Select label="School *" value={form.schoolId} onChange={e => set('schoolId', e.target.value)}>
          <option value="">Select school...</option>
          {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="text-sm text-[#52525b] hover:text-[#fafafa] px-4 py-2">Cancel</button>
          <button disabled={!valid} onClick={() => { onCreated(form); onClose(); }}
            className="flex items-center gap-2 bg-white text-black font-bold px-5 py-2.5 rounded-xl text-sm disabled:opacity-40">
            <Check className="h-4 w-4" /> Add Teacher
          </button>
        </div>
      </div>
    </Modal>
  );
};

/* ══════════════════════════════════════════════════════════════
   CREATE STUDENT MODAL
══════════════════════════════════════════════════════════════ */
export const CreateStudentModal = ({ onClose, onCreated, schools }) => {
  const [form, setForm] = useState({ name: '', rollNo: '', grade: '9', section: 'A', schoolId: '', parentEmail: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.name && form.rollNo && form.schoolId;
  return (
    <Modal title="Add Student" onClose={onClose}>
      <div className="space-y-4">
        <Input label="Full Name *" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Aarav Sharma" />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Roll Number *" value={form.rollNo} onChange={e => set('rollNo', e.target.value)} placeholder="24CS001" />
          <div className="grid grid-cols-2 gap-2">
            <Select label="Grade" value={form.grade} onChange={e => set('grade', e.target.value)}>
              {[6,7,8,9,10,11,12].map(g => <option key={g}>{g}</option>)}
            </Select>
            <Select label="Section" value={form.section} onChange={e => set('section', e.target.value)}>
              {['A','B','C','D'].map(s => <option key={s}>{s}</option>)}
            </Select>
          </div>
        </div>
        <Select label="School *" value={form.schoolId} onChange={e => set('schoolId', e.target.value)}>
          <option value="">Select school...</option>
          {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>
        <Input label="Parent Email" type="email" value={form.parentEmail} onChange={e => set('parentEmail', e.target.value)} placeholder="parent@example.com" />
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="text-sm text-[#52525b] hover:text-[#fafafa] px-4 py-2">Cancel</button>
          <button disabled={!valid} onClick={() => { onCreated(form); onClose(); }}
            className="flex items-center gap-2 bg-white text-black font-bold px-5 py-2.5 rounded-xl text-sm disabled:opacity-40">
            <Check className="h-4 w-4" /> Add Student
          </button>
        </div>
      </div>
    </Modal>
  );
};

/* ══════════════════════════════════════════════════════════════
   SUBJECTS MANAGER
══════════════════════════════════════════════════════════════ */
const INIT_SUBJECTS = [
  { id: 1, name: 'Computer Science', code: 'CS', grades: '6-12', desc: 'Python, HTML, DS, Algorithms' },
  { id: 2, name: 'Mathematics',      code: 'MATH', grades: '6-12', desc: 'Algebra, Geometry, Calculus' },
  { id: 3, name: 'Physics',          code: 'PHY',  grades: '9-12', desc: 'Mechanics, Optics, Modern Physics' },
  { id: 4, name: 'English',          code: 'ENG',  grades: '6-12', desc: 'Grammar, Literature, Writing' },
];

const INIT_CLASSES = [
  { id: 1, name: 'Grade 9 - A', grade: '9', section: 'A', school: 'Adarsh Vidya Mandir', teacher: 'Prof. Vikram', subjects: [1, 2, 3] },
  { id: 2, name: 'Grade 10 - B', grade: '10', section: 'B', school: 'Sarvodaya Balika', teacher: 'Ms. Priya Sen', subjects: [1, 2, 4] },
  { id: 3, name: 'Grade 11 - A', grade: '11', section: 'A', school: 'Vivekananda Tribal', teacher: 'Dr. Sunita', subjects: [1, 3] },
];

export const SubjectsManager = () => {
  const [subjects, setSubjects] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newSub, setNewSub] = useState({ name: '', code: '', grades: '6-12', desc: '' });

  React.useEffect(() => {
    fetch('/api/admin/subjects')
      .then(r => r.ok ? r.json() : [])
      .then(data => setSubjects(data))
      .catch(e => console.error(e));
  }, []);

  const addSubject = async () => {
    if (!newSub.name || !newSub.code) return;
    try {
      const res = await fetch('/api/admin/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSub.name, code: newSub.code, grade_range: newSub.grades, description: newSub.desc })
      });
      if (res.ok) {
        const data = await res.json();
        setSubjects(p => [data, ...p]);
        setNewSub({ name: '', code: '', grades: '6-12', desc: '' });
        setShowAdd(false);
      }
    } catch(e) { console.error('Failed to add subject', e); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#fafafa]">Subjects</h2>
          <p className="text-xs text-[#52525b] mt-0.5">Define subjects available across the trust</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-white text-black font-bold px-4 py-2 rounded-xl text-sm hover:bg-[#e4e4e7]">
          <Plus className="h-4 w-4" /> Add Subject
        </button>
      </div>

      {showAdd && (
        <div className="card p-5 border-indigo-500/20 bg-indigo-500/5">
          <div className="text-xs font-bold text-[#fafafa] mb-4">New Subject</div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Input label="Subject Name *" value={newSub.name} onChange={e => setNewSub(p => ({ ...p, name: e.target.value }))} placeholder="Computer Science" />
            <Input label="Code *" value={newSub.code} onChange={e => setNewSub(p => ({ ...p, code: e.target.value }))} placeholder="CS" />
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Input label="Grade Range" value={newSub.grades} onChange={e => setNewSub(p => ({ ...p, grades: e.target.value }))} placeholder="6-12" />
            <Input label="Description" value={newSub.desc} onChange={e => setNewSub(p => ({ ...p, desc: e.target.value }))} placeholder="Topics covered..." />
          </div>
          <div className="flex gap-3">
            <button onClick={addSubject} className="bg-white text-black font-bold px-4 py-2 rounded-lg text-sm">Add Subject</button>
            <button onClick={() => setShowAdd(false)} className="text-sm text-[#52525b] hover:text-[#fafafa] px-4 py-2">Cancel</button>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Subject</th><th>Code</th><th>Grades</th><th>Description</th><th></th>
            </tr>
          </thead>
          <tbody>
            {subjects.map(s => (
              <tr key={s.id}>
                <td className="font-semibold text-[#fafafa]">{s.name}</td>
                <td><span className="font-mono text-[10px] bg-[#111] border border-[#27272a] px-2 py-0.5 rounded text-[#a1a1aa]">{s.code}</span></td>
                <td>Grade {s.grade_range || s.grades}</td>
                <td className="text-[#52525b]">{s.description || s.desc}</td>
                <td>
                  <button onClick={() => setSubjects(p => p.filter(x => x.id !== s.id))} className="p-1.5 text-[#3f3f46] hover:text-red-400 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   CLASSES MANAGER + SUBJECT MAPPING
══════════════════════════════════════════════════════════════ */
export const ClassesManager = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newClass, setNewClass] = useState({ name: '', grade: '9', section: 'A', school: '', teacher: '' });
  const [selectedClass, setSelectedClass] = useState(null);

  React.useEffect(() => {
    fetch('/api/admin/classes').then(r => r.ok ? r.json() : []).then(data => setClasses(data.map(c => ({...c, subjects: c.mapped_subjects || []}))));
    fetch('/api/admin/subjects').then(r => r.ok ? r.json() : []).then(data => setSubjects(data));
  }, []);

  const addClass = async () => {
    if (!newClass.name || !newClass.school) return;
    try {
      const res = await fetch('/api/admin/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newClass.name, grade: newClass.grade, section: newClass.section, teacher_id: newClass.teacher, mapped_subjects: [] })
      });
      if (res.ok) {
        const data = await res.json();
        setClasses(p => [{ ...data, subjects: [], school: newClass.school, teacher: newClass.teacher }, ...p]);
        setNewClass({ name: '', grade: '9', section: 'A', school: '', teacher: '' });
        setShowAdd(false);
      }
    } catch(e) { console.error('Failed to add class', e); }
  };

  const toggleSubject = (classId, subId) => {
    setClasses(p => p.map(c => c.id === classId
      ? { ...c, subjects: c.subjects.includes(subId) ? c.subjects.filter(s => s !== subId) : [...c.subjects, subId] }
      : c
    ));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#fafafa]">Classes & Subject Mapping</h2>
          <p className="text-xs text-[#52525b] mt-0.5">Create classes, assign teachers, map subjects</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-white text-black font-bold px-4 py-2 rounded-xl text-sm hover:bg-[#e4e4e7]">
          <Plus className="h-4 w-4" /> Add Class
        </button>
      </div>

      {showAdd && (
        <div className="card p-5 border-blue-500/20 bg-blue-500/5">
          <div className="text-xs font-bold text-[#fafafa] mb-4">New Class</div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Input label="Class Name *" value={newClass.name} onChange={e => setNewClass(p => ({ ...p, name: e.target.value }))} placeholder="Grade 9 - A" />
            <Input label="School *" value={newClass.school} onChange={e => setNewClass(p => ({ ...p, school: e.target.value }))} placeholder="Adarsh Vidya Mandir" />
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Select label="Grade" value={newClass.grade} onChange={e => setNewClass(p => ({ ...p, grade: e.target.value }))}>
              {[6,7,8,9,10,11,12].map(g => <option key={g}>{g}</option>)}
            </Select>
            <Select label="Section" value={newClass.section} onChange={e => setNewClass(p => ({ ...p, section: e.target.value }))}>
              {['A','B','C','D'].map(s => <option key={s}>{s}</option>)}
            </Select>
            <Input label="Class Teacher" value={newClass.teacher} onChange={e => setNewClass(p => ({ ...p, teacher: e.target.value }))} placeholder="Prof. Vikram" />
          </div>
          <div className="flex gap-3">
            <button onClick={addClass} className="bg-white text-black font-bold px-4 py-2 rounded-lg text-sm">Add Class</button>
            <button onClick={() => setShowAdd(false)} className="text-sm text-[#52525b] hover:text-[#fafafa] px-4 py-2">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Class List */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-[#111] text-xs font-semibold text-[#fafafa]">Classes</div>
          <div className="divide-y divide-[#0d0d0d]">
            {classes.map(c => (
              <div key={c.id}
                onClick={() => setSelectedClass(c.id === selectedClass ? null : c.id)}
                className={`px-4 py-3.5 cursor-pointer transition-colors hover:bg-[#0a0a0a] ${selectedClass === c.id ? 'bg-[#0f0f0f] border-l-2 border-l-violet-500' : ''}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-[#fafafa]">{c.name}</div>
                    <div className="text-xs text-[#52525b] mt-0.5">{c.school} · {c.teacher}</div>
                  </div>
                  <div className="text-xs text-[#52525b]">{c.subjects.length} subjects</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subject Mapping */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-[#111] text-xs font-semibold text-[#fafafa]">
            {selectedClass ? `Map Subjects → ${classes.find(c => c.id === selectedClass)?.name}` : 'Select a class to map subjects'}
          </div>
          {selectedClass ? (
            <div className="divide-y divide-[#0d0d0d]">
              {subjects.map(s => {
                const cls = classes.find(c => c.id === selectedClass);
                const mapped = cls?.subjects.includes(s.id);
                return (
                  <div key={s.id} className="px-4 py-3 flex items-center justify-between hover:bg-[#0a0a0a] transition-colors">
                    <div>
                      <div className="text-sm font-medium text-[#fafafa]">{s.name}</div>
                      <div className="text-xs text-[#52525b]">{s.code} · Grade {s.grades}</div>
                    </div>
                    <button
                      onClick={() => toggleSubject(selectedClass, s.id)}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all
                        ${mapped ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400' : 'bg-[#111] border border-[#27272a] text-[#52525b] hover:text-[#fafafa]'}`}>
                      {mapped ? <><Check className="h-3.5 w-3.5" /> Mapped</> : <><Plus className="h-3.5 w-3.5" /> Map</>}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-[#3f3f46] text-sm">
              ← Select a class from the list
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   TIMETABLE
══════════════════════════════════════════════════════════════ */
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [
  { label: 'Period 1', time: '8:00 - 8:45' },
  { label: 'Period 2', time: '8:45 - 9:30' },
  { label: 'Break',    time: '9:30 - 9:45', isBreak: true },
  { label: 'Period 3', time: '9:45 - 10:30' },
  { label: 'Period 4', time: '10:30 - 11:15' },
  { label: 'Lunch',    time: '11:15 - 12:00', isBreak: true },
  { label: 'Period 5', time: '12:00 - 12:45' },
  { label: 'Period 6', time: '12:45 - 1:30' },
];

const SUB_COLORS = {
  'Computer Science': 'bg-blue-500/20 text-blue-300 border-blue-500/20',
  'Mathematics':      'bg-violet-500/20 text-violet-300 border-violet-500/20',
  'Physics':          'bg-orange-500/20 text-orange-300 border-orange-500/20',
  'English':          'bg-emerald-500/20 text-emerald-300 border-emerald-500/20',
  'Hindi':            'bg-pink-500/20 text-pink-300 border-pink-500/20',
};

const INIT_TT = {
  'Monday-0': { subject: 'Computer Science', teacher: 'Prof. Vikram' },
  'Monday-3': { subject: 'Mathematics',      teacher: 'Mrs. Lakshmi' },
  'Tuesday-0': { subject: 'Physics',         teacher: 'Dr. Mehta' },
  'Tuesday-3': { subject: 'English',         teacher: 'Ms. Roy' },
  'Wednesday-0': { subject: 'Mathematics',   teacher: 'Mrs. Lakshmi' },
  'Wednesday-3': { subject: 'Computer Science', teacher: 'Prof. Vikram' },
  'Thursday-3': { subject: 'Hindi',          teacher: 'Mr. Sharma' },
  'Friday-0': { subject: 'English',          teacher: 'Ms. Roy' },
  'Friday-3': { subject: 'Physics',          teacher: 'Dr. Mehta' },
};

export const TimetablePage = () => {
  const [selectedClass, setSelectedClass] = useState('Grade 9 - A');
  const [timetable, setTimetable] = useState(INIT_TT);
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState({ subject: '', teacher: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dbSubjects, setDbSubjects] = useState([]);

  // Load timetable from Postgres on mount
  React.useEffect(() => {
    fetch('/api/timetable')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.data) setTimetable(data.data); })
      .catch(() => {});

    fetch('/api/admin/subjects')
      .then(r => r.ok ? r.json() : [])
      .then(data => setDbSubjects(data))
      .catch(() => {});
  }, []);

  const startEdit = (key, current) => {
    setEditing(key);
    setEditVal(current || { subject: '', teacher: '' });
  };

  const saveEdit = () => {
    if (editVal.subject) {
      setTimetable(p => ({ ...p, [editing]: editVal }));
    } else {
      const next = { ...timetable };
      delete next[editing];
      setTimetable(next);
    }
    setEditing(null);
  };

  const saveToDB = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ class_name: selectedClass, data: timetable })
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (e) {
      console.error('Failed to save timetable', e);
    } finally {
      setSaving(false);
    }
  };

  const allSubjects = dbSubjects.length > 0
    ? dbSubjects.map(s => s.name)
    : INIT_SUBJECTS.map(s => s.name);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#fafafa]">Timetable</h2>
          <p className="text-xs text-[#52525b] mt-0.5">Weekly class schedule · click any cell to assign · auto-saves to Postgres</p>
        </div>
        <div className="flex items-center gap-3">
          <Select label="" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
            {INIT_CLASSES.map(c => <option key={c.id}>{c.name}</option>)}
            <option>Grade 9 - A</option>
          </Select>
          <button onClick={saveToDB} disabled={saving}
            className={`flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl transition-all
              ${saved ? 'bg-emerald-500 text-white' : 'bg-white text-black hover:bg-[#e4e4e7]'}`}>
            {saving ? '⏳ Saving…' : saved ? '✓ Saved!' : '💾 Save to DB'}
          </button>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-xs" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '110px' }} />
            {DAYS.map(d => <col key={d} />)}
          </colgroup>
          <thead>
            <tr className="border-b border-[#111]">
              <th className="px-3 py-3 text-left text-[#52525b] font-semibold">Period</th>
              {DAYS.map(d => (
                <th key={d} className="px-2 py-3 text-center text-[#a1a1aa] font-semibold">{d.slice(0, 3)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERIODS.map((period, pIdx) => (
              <tr key={pIdx} className={`border-b border-[#0d0d0d] ${period.isBreak ? 'bg-[#050505]' : 'hover:bg-[#040404]'}`}>
                <td className="px-3 py-2">
                  <div className={`font-semibold ${period.isBreak ? 'text-[#27272a]' : 'text-[#a1a1aa]'}`}>{period.label}</div>
                  <div className="text-[10px] text-[#3f3f46] font-mono">{period.time}</div>
                </td>
                {DAYS.map((day, dIdx) => {
                  const key = `${day}-${pIdx}`;
                  const cell = timetable[key];
                  if (period.isBreak) return (
                    <td key={day} className="px-2 py-2 text-center text-[10px] text-[#27272a] italic">
                      {period.label === 'Break' && dIdx === 0 ? 'Break' : ''}
                    </td>
                  );
                  if (editing === key) return (
                    <td key={day} className="px-1 py-1">
                      <div className="bg-[#0a0a0a] border border-[#52525b] rounded-lg p-2 space-y-1">
                        <select value={editVal.subject} onChange={e => setEditVal(p => ({ ...p, subject: e.target.value }))}
                          className="w-full bg-[#000] border border-[#27272a] rounded px-2 py-1 text-[10px] text-[#fafafa]">
                          <option value="">Empty</option>
                          {allSubjects.map(s => <option key={s}>{s}</option>)}
                        </select>
                        <input value={editVal.teacher} onChange={e => setEditVal(p => ({ ...p, teacher: e.target.value }))}
                          placeholder="Teacher name" className="w-full bg-[#000] border border-[#27272a] rounded px-2 py-1 text-[10px] text-[#fafafa]" />
                        <div className="flex gap-1">
                          <button onClick={saveEdit} className="flex-1 bg-white text-black text-[9px] font-bold py-1 rounded">Save</button>
                          <button onClick={() => setEditing(null)} className="flex-1 text-[#52525b] text-[9px] py-1">×</button>
                        </div>
                      </div>
                    </td>
                  );
                  return (
                    <td key={day} className="px-1.5 py-1.5">
                      <button onClick={() => startEdit(key, cell)}
                        className={`w-full text-left px-2 py-2 rounded-lg border transition-colors
                          ${cell ? `${SUB_COLORS[cell.subject] || 'bg-[#111] text-[#a1a1aa] border-[#27272a]'} border` : 'border border-dashed border-[#1a1a1a] hover:border-[#27272a] text-[#27272a] hover:text-[#52525b]'}`}>
                        {cell ? (
                          <>
                            <div className="font-semibold text-[10px] leading-tight truncate">{cell.subject}</div>
                            <div className="text-[9px] opacity-70 truncate">{cell.teacher}</div>
                          </>
                        ) : (
                          <div className="text-[10px] text-center py-0.5">+ Add</div>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-4 text-[11px]">
        <span className="text-[#3f3f46]">Legend:</span>
        {Object.entries(SUB_COLORS).map(([sub, cls]) => (
          <span key={sub} className={`px-2 py-0.5 rounded border ${cls}`}>{sub}</span>
        ))}
        <span className="ml-auto text-[#27272a] font-mono">Timetable synced to Neon PostgreSQL</span>
      </div>
    </div>
  );
};


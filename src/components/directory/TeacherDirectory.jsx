import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search, Filter, Users, Building2, Star, Video,
  Calendar, Mail, ExternalLink, ChevronRight, Award, Sparkles, BookOpen
} from 'lucide-react';
import { ScheduleClassModal } from '../live/ScheduleClassModal';

export const TeacherDirectory = () => {
  const { schools, selectedSchoolId, currentRole, fetchDirectoryTeachers } = useApp();

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [schoolFilter, setSchoolFilter] = useState(selectedSchoolId || 'ALL');
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  useEffect(() => {
    if (selectedSchoolId && selectedSchoolId !== 'ALL') {
      setSchoolFilter(selectedSchoolId);
    }
  }, [selectedSchoolId]);

  const loadTeachers = async () => {
    setLoading(true);
    const data = await fetchDirectoryTeachers({
      schoolId: schoolFilter !== 'ALL' ? schoolFilter : null,
      subject: subjectFilter !== 'ALL' ? subjectFilter : null,
      search: search.trim() || null
    });

    setTeachers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadTeachers();
  }, [schoolFilter, subjectFilter, search]);

  return (
    <div className="space-y-6 pb-12 max-w-screen-2xl mx-auto">
      
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#222] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Educator Network</span>
            <span className="text-[10px] bg-zinc-800 text-zinc-300 font-mono px-2 py-0.5 rounded-full">
              {teachers.length} Master Trainers
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#fafafa]">Teacher & Educator Directory</h1>
          <p className="text-xs text-[#71717a] mt-1">
            Certified computer science master educators, curriculum heads, and lab instructors broadcasting across trust nodes.
          </p>
        </div>

        {(currentRole === 'teacher' || currentRole === 'admin' || currentRole === 'principal') && (
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/10"
          >
            <Calendar className="h-4 w-4" />
            Schedule Live Masterclass
          </button>
        )}
      </div>

      {/* ── Filter Bar ── */}
      <div className="card p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#0d0d0f] border border-[#27272a]">
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#71717a]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by teacher name, subject..."
            className="w-full bg-[#18181b] border border-[#27272a] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#52525b] focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* School Filter */}
        <div>
          <select
            value={schoolFilter}
            onChange={e => setSchoolFilter(e.target.value)}
            className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All 42 Trust Schools</option>
            {schools.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.city || s.cluster})</option>
            ))}
          </select>
        </div>

        {/* Subject Filter */}
        <div>
          <select
            value={subjectFilter}
            onChange={e => setSubjectFilter(e.target.value)}
            className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Subjects & Specializations</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Python & AI">Python & AI</option>
            <option value="Web Development">Web Development</option>
            <option value="Algorithms & Logic">Algorithms & Logic</option>
            <option value="Data Structures">Data Structures</option>
          </select>
        </div>

      </div>

      {/* ── Teacher Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5 space-y-3 animate-pulse bg-[#111]">
              <div className="h-10 w-10 rounded-full bg-[#222]" />
              <div className="h-4 bg-[#222] rounded w-3/4" />
              <div className="h-3 bg-[#222] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : teachers.length === 0 ? (
        <div className="card p-12 text-center text-[#71717a] space-y-3">
          <Users className="h-10 w-10 mx-auto text-[#3f3f46]" />
          <div className="text-sm font-semibold text-white">No teachers found matching criteria</div>
          <p className="text-xs max-w-sm mx-auto">Try selecting All Trust Schools or clearing search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teachers.map((tc, idx) => (
            <div
              key={tc.id || idx}
              className="card p-5 bg-[#0f0f12] border border-[#222] hover:border-[#333] transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-base">
                      {tc.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {tc.name}
                      </h3>
                      <div className="text-[11px] text-amber-400 font-medium">
                        {tc.designation || 'Master CS Trainer'}
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current text-emerald-400" /> {tc.rating || 4.9}
                  </span>
                </div>

                {/* Subject badge & Institute */}
                <div className="space-y-2 mb-4">
                  <div className="inline-block text-xs bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-lg border border-zinc-700 font-medium">
                    {tc.subject || 'Computer Science'}
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#141418] border border-[#1f1f22] text-xs text-[#a1a1aa] flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    <span className="truncate">{tc.school_name || 'Central Trust Node'}</span>
                  </div>
                </div>

                {/* Telemetry stats */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs mb-4">
                  <div className="p-2 rounded-lg bg-[#18181c] border border-[#222]">
                    <div className="text-[10px] text-[#71717a]">Students Mentored</div>
                    <div className="text-sm font-bold text-white mt-0.5">{Number(tc.students_taught || 12000).toLocaleString()}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#18181c] border border-[#222]">
                    <div className="text-[10px] text-[#71717a]">Active Classes</div>
                    <div className="text-sm font-bold text-amber-400 mt-0.5">{tc.active_classes || 2} Live/Week</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-[#1a1a1a]">
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="flex-1 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Schedule Masterclass</span>
                </button>

                <a
                  href={`mailto:${tc.email || 'teacher@vidyasetu.org'}`}
                  title="Contact Educator"
                  className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors border border-zinc-700"
                >
                  <Mail className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Modal */}
      <ScheduleClassModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
      />

    </div>
  );
};

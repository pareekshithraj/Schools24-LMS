import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search, Filter, GraduationCap, Building2, Trophy,
  Zap, CheckCircle2, Video, Calendar, ArrowUpDown,
  Mail, ExternalLink, Sparkles, X, ChevronRight, BookOpen
} from 'lucide-react';
import { ScheduleClassModal } from '../live/ScheduleClassModal';

export const StudentDirectory = () => {
  const { schools, selectedSchoolId, currentRole, fetchDirectoryStudents } = useApp();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('ALL');
  const [schoolFilter, setSchoolFilter] = useState(selectedSchoolId || 'ALL');
  const [sortBy, setSortBy] = useState('xp'); // 'xp' | 'name' | 'grade'
  
  // Modals & Details
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  useEffect(() => {
    if (selectedSchoolId && selectedSchoolId !== 'ALL') {
      setSchoolFilter(selectedSchoolId);
    }
  }, [selectedSchoolId]);

  const loadStudents = async () => {
    setLoading(true);
    const data = await fetchDirectoryStudents({
      schoolId: schoolFilter !== 'ALL' ? schoolFilter : null,
      grade: gradeFilter !== 'ALL' ? gradeFilter : null,
      search: search.trim() || null
    });

    setStudents(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadStudents();
  }, [schoolFilter, gradeFilter, search]);

  const sortedStudents = [...students].sort((a, b) => {
    if (sortBy === 'xp') return (b.total_xp || 0) - (a.total_xp || 0);
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'grade') return (a.grade || '').localeCompare(b.grade || '');
    return 0;
  });

  return (
    <div className="space-y-6 pb-12 max-w-screen-2xl mx-auto">
      
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#222] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Trust Network Roster</span>
            <span className="text-[10px] bg-zinc-800 text-zinc-300 font-mono px-2 py-0.5 rounded-full">
              {sortedStudents.length} Active Students
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#fafafa]">Student Directory & Telemetry</h1>
          <p className="text-xs text-[#71717a] mt-1">
            Profiles, XP points, automated grading history, and 1-on-1 live classroom invites across all 42 schools.
          </p>
        </div>

        {(currentRole === 'teacher' || currentRole === 'admin' || currentRole === 'principal') && (
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/10"
          >
            <Calendar className="h-4 w-4" />
            Schedule Class for Students
          </button>
        )}
      </div>

      {/* ── Filter Bar ── */}
      <div className="card p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[#0d0d0f] border border-[#27272a]">
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#71717a]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, roll #, email..."
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

        {/* Grade Filter */}
        <div>
          <select
            value={gradeFilter}
            onChange={e => setGradeFilter(e.target.value)}
            className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Grades (6–12)</option>
            <option value="Grade 6">Grade 6</option>
            <option value="Grade 7">Grade 7</option>
            <option value="Grade 8">Grade 8</option>
            <option value="Grade 9">Grade 9</option>
            <option value="Grade 10">Grade 10</option>
            <option value="Grade 11">Grade 11</option>
            <option value="Grade 12">Grade 12</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="xp">Sort by Total XP (Leaderboard)</option>
            <option value="name">Sort by Student Name</option>
            <option value="grade">Sort by Grade</option>
          </select>
        </div>

      </div>

      {/* ── Student Grid ── */}
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
      ) : sortedStudents.length === 0 ? (
        <div className="card p-12 text-center text-[#71717a] space-y-3">
          <GraduationCap className="h-10 w-10 mx-auto text-[#3f3f46]" />
          <div className="text-sm font-semibold text-white">No students matched the criteria</div>
          <p className="text-xs max-w-sm mx-auto">Try clearing search filters or selecting All Trust Schools.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedStudents.map((st, idx) => (
            <div
              key={st.id || idx}
              className="card p-5 bg-[#0f0f12] border border-[#222] hover:border-[#333] transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
                      {st.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                        {st.name}
                      </h3>
                      <div className="text-[11px] text-[#71717a] flex items-center gap-1.5">
                        <span className="font-mono">Roll: #{st.roll_no || `00${idx + 1}`}</span>
                        <span>·</span>
                        <span className="text-zinc-300 font-semibold">{st.grade || 'Grade 9'}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Zap className="h-3 w-3" /> {st.total_xp || 350} XP
                  </span>
                </div>

                {/* Institute */}
                <div className="p-2.5 rounded-lg bg-[#141418] border border-[#1f1f22] text-xs text-[#a1a1aa] mb-4 flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span className="truncate">{st.school_name || 'Adarsh Vidya Mandir #01'}</span>
                </div>

                {/* Performance stats */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs mb-4">
                  <div className="p-2 rounded-lg bg-[#18181c] border border-[#222]">
                    <div className="text-[10px] text-[#71717a]">Attendance</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">{st.attendance || '98%'}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#18181c] border border-[#222]">
                    <div className="text-[10px] text-[#71717a]">Submissions</div>
                    <div className="text-sm font-bold text-white mt-0.5">{st.submissions_count || 5} solved</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-[#1a1a1a]">
                <button
                  onClick={() => setSelectedStudent(st)}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  <span>View Details</span>
                  <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
                </button>

                {(currentRole === 'teacher' || currentRole === 'admin') && (
                  <button
                    onClick={() => setShowScheduleModal(true)}
                    title="Schedule Masterclass"
                    className="p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors"
                  >
                    <Calendar className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Student Profile Drawer / Modal ── */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111114] border border-[#27272a] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-white">
            <div className="px-6 py-4 border-b border-[#27272a] flex items-center justify-between bg-[#141418]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                  {selectedStudent.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedStudent.name}</h3>
                  <p className="text-xs text-[#71717a]">Roll #{selectedStudent.roll_no} · {selectedStudent.grade}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 rounded-lg text-[#71717a] hover:text-white hover:bg-[#222]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="card p-3 bg-[#18181c]">
                  <div className="text-[10px] text-[#71717a]">Total XP</div>
                  <div className="text-lg font-bold text-amber-400 mt-1">{selectedStudent.total_xp || 450}</div>
                </div>
                <div className="card p-3 bg-[#18181c]">
                  <div className="text-[10px] text-[#71717a]">Attendance</div>
                  <div className="text-lg font-bold text-emerald-400 mt-1">{selectedStudent.attendance || '98%'}</div>
                </div>
                <div className="card p-3 bg-[#18181c]">
                  <div className="text-[10px] text-[#71717a]">Rank</div>
                  <div className="text-lg font-bold text-violet-400 mt-1">#4 in Class</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Institute Details</div>
                <div className="p-3.5 rounded-xl bg-[#18181c] border border-[#222] space-y-1.5 text-xs text-zinc-300">
                  <div className="flex justify-between">
                    <span className="text-[#71717a]">Institute:</span>
                    <span className="font-semibold text-white">{selectedStudent.school_name || 'Adarsh Vidya Mandir #01'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#71717a]">Email:</span>
                    <span className="font-mono text-zinc-400">{selectedStudent.email || `${selectedStudent.name.toLowerCase().replace(' ', '.')}@vidyasetu.org`}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Coursework & Skills</div>
                <div className="flex flex-wrap gap-2">
                  {['Python 3', 'Data Structures', 'Web Flexbox', 'Algorithms', 'Algorithmic Complexity'].map(tag => (
                    <span key={tag} className="text-xs bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-lg border border-zinc-700">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#222] flex gap-3">
                <button
                  onClick={() => {
                    setSelectedStudent(null);
                    setShowScheduleModal(true);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Invite to 1-on-1 Class</span>
                </button>
              </div>
            </div>
          </div>
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

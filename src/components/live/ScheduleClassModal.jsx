import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar, Clock, Users, User, Globe, Sparkles,
  X, Check, AlertCircle, Video, BookOpen, Search, Building2
} from 'lucide-react';

export const ScheduleClassModal = ({ isOpen, onClose }) => {
  const { teacher, selectedSchoolId, activeSchools, scheduleClass, fetchDirectoryStudents } = useApp();

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Computer Science');
  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('11:00 AM');
  const [duration, setDuration] = useState('45 mins');
  const [targetType, setTargetType] = useState('ALL'); // 'ALL' | 'CLASS' | 'STUDENTS'
  const [targetGrade, setTargetGrade] = useState('Grade 9');
  const [targetSection, setTargetSection] = useState('All');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  
  // Student selector data
  const [allStudents, setAllStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && targetType === 'STUDENTS') {
      const load = async () => {
        setLoadingStudents(true);
        const data = await fetchDirectoryStudents({
          schoolId: selectedSchoolId !== 'ALL' ? selectedSchoolId : null
        });
        if (data && data.length > 0) {
          setAllStudents(data);
        } else {
          // Fallback sample students
          setAllStudents([
            { id: 'm4', name: 'Aarav Sharma', roll_no: '001', grade: 'Grade 9', school_name: 'Adarsh Vidya Mandir #01' },
            { id: 's2', name: 'Pooja Kumari', roll_no: '002', grade: 'Grade 9', school_name: 'Adarsh Vidya Mandir #01' },
            { id: 's3', name: 'Rohan Verma', roll_no: '003', grade: 'Grade 9', school_name: 'Adarsh Vidya Mandir #01' },
            { id: 's4', name: 'Sneha Patel', roll_no: '004', grade: 'Grade 10', school_name: 'Adarsh Vidya Mandir #01' },
            { id: 's5', name: 'Manoj Munda', roll_no: '005', grade: 'Grade 9', school_name: 'Sarvodaya Balika #04' },
            { id: 's6', name: 'Sunita Yadav', roll_no: '006', grade: 'Grade 8', school_name: 'Sarvodaya Balika #04' }
          ]);
        }
        setLoadingStudents(false);
      };
      load();
    }
  }, [isOpen, targetType, selectedSchoolId]);

  if (!isOpen) return null;

  const toggleStudent = (id) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const filteredStudents = allStudents.filter(s => {
    if (!studentSearch) return true;
    const q = studentSearch.toLowerCase();
    return s.name.toLowerCase().includes(q) ||
           (s.roll_no && s.roll_no.toLowerCase().includes(q)) ||
           (s.grade && s.grade.toLowerCase().includes(q));
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please enter a session title.');
      return;
    }

    if (targetType === 'STUDENTS' && selectedStudentIds.length === 0) {
      setError('Please select at least one student for individual invitation.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title,
        subject,
        grade: targetType === 'CLASS' ? targetGrade : (targetType === 'ALL' ? 'All Classes' : `${selectedStudentIds.length} Selected Students`),
        teacher: teacher?.name || 'Prof. Vikram Aditya',
        teacherRole: teacher?.designation || 'Master CS Trainer',
        startTime,
        duration,
        scheduledDate,
        targetType,
        targetGrade: targetType === 'CLASS' ? targetGrade : null,
        targetSection: targetType === 'CLASS' ? targetSection : null,
        targetStudentIds: targetType === 'STUDENTS' ? selectedStudentIds : [],
        schoolId: selectedSchoolId !== 'ALL' ? selectedSchoolId : null,
        meetCode: `vst-${Math.random().toString(36).substring(2, 7)}`
      };

      await scheduleClass(payload);
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setError('Failed to schedule class. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0f0f11] border border-[#27272a] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl text-white">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#27272a] flex items-center justify-between bg-[#141417]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#fafafa]">Schedule Live Masterclass</h2>
              <p className="text-xs text-[#71717a]">Broadcast to all classes, a specific grade, or 1-on-1 students</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#71717a] hover:text-white hover:bg-[#27272a] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Session Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#a1a1aa] flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-amber-400" />
              <span>Topic / Masterclass Title</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Python Stack Visualizer & Algorithmic Complexity"
              className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#52525b] focus:outline-none focus:border-amber-500 transition-colors"
              required
            />
          </div>

          {/* Subject & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#a1a1aa]">Subject</label>
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Python & AI">Python & AI</option>
                <option value="Web Development">Web Development</option>
                <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#a1a1aa] flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                <span>Duration</span>
              </label>
              <select
                value={duration}
                onChange={e => setDuration(e.target.value)}
                className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="30 mins">30 minutes</option>
                <option value="45 mins">45 minutes (Standard)</option>
                <option value="60 mins">60 minutes (Deep Dive)</option>
                <option value="90 mins">90 minutes (Lab Workshop)</option>
              </select>
            </div>
          </div>

          {/* Date & Start Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#a1a1aa] flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-amber-400" />
                <span>Scheduled Date</span>
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={e => setScheduledDate(e.target.value)}
                className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#a1a1aa]">Start Time</label>
              <input
                type="text"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                placeholder="e.g. 10:30 AM or 04:00 PM"
                className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-2 text-sm text-white placeholder-[#52525b] focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Target Audience Mode */}
          <div className="space-y-2 pt-2 border-t border-[#27272a]">
            <label className="text-xs font-semibold text-[#a1a1aa] flex items-center justify-between">
              <span>Target Audience & Invite Scope</span>
              <span className="text-[10px] text-amber-400 font-mono">
                {targetType === 'ALL' ? '🌐 Broadcast to Everyone' : targetType === 'CLASS' ? `🎯 ${targetGrade}` : `👤 ${selectedStudentIds.length} Selected`}
              </span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTargetType('ALL')}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  targetType === 'ALL'
                    ? 'border-amber-500/50 bg-amber-500/10 text-white shadow-sm'
                    : 'border-[#27272a] bg-[#141417] text-[#71717a] hover:border-[#3f3f46]'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  <Globe className="h-4 w-4 text-amber-400" />
                  <span>All Classes</span>
                </div>
                <div className="text-[10px] text-[#71717a]">Entire school/trust</div>
              </button>

              <button
                type="button"
                onClick={() => setTargetType('CLASS')}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  targetType === 'CLASS'
                    ? 'border-amber-500/50 bg-amber-500/10 text-white shadow-sm'
                    : 'border-[#27272a] bg-[#141417] text-[#71717a] hover:border-[#3f3f46]'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  <Users className="h-4 w-4 text-blue-400" />
                  <span>Specific Class</span>
                </div>
                <div className="text-[10px] text-[#71717a]">Target by grade & section</div>
              </button>

              <button
                type="button"
                onClick={() => setTargetType('STUDENTS')}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  targetType === 'STUDENTS'
                    ? 'border-amber-500/50 bg-amber-500/10 text-white shadow-sm'
                    : 'border-[#27272a] bg-[#141417] text-[#71717a] hover:border-[#3f3f46]'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  <User className="h-4 w-4 text-emerald-400" />
                  <span>Individual Students</span>
                </div>
                <div className="text-[10px] text-[#71717a]">1-on-1 / specific list</div>
              </button>
            </div>
          </div>

          {/* Conditional Sub-View: Specific Class Picker */}
          {targetType === 'CLASS' && (
            <div className="p-4 rounded-xl bg-[#141417] border border-[#27272a] grid grid-cols-2 gap-3 animate-in fade-in">
              <div className="space-y-1">
                <label className="text-xs text-[#a1a1aa]">Select Grade</label>
                <select
                  value={targetGrade}
                  onChange={e => setTargetGrade(e.target.value)}
                  className="w-full bg-[#1c1c20] border border-[#27272a] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Grade 6">Grade 6</option>
                  <option value="Grade 7">Grade 7</option>
                  <option value="Grade 8">Grade 8</option>
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#a1a1aa]">Section</label>
                <select
                  value={targetSection}
                  onChange={e => setTargetSection(e.target.value)}
                  className="w-full bg-[#1c1c20] border border-[#27272a] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="All">All Sections (A, B, C)</option>
                  <option value="Section A">Section A</option>
                  <option value="Section B">Section B</option>
                  <option value="Section C">Section C</option>
                </select>
              </div>
            </div>
          )}

          {/* Conditional Sub-View: Individual Student Picker */}
          {targetType === 'STUDENTS' && (
            <div className="p-4 rounded-xl bg-[#141417] border border-[#27272a] space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Select Students to Invite</span>
                <span className="text-[11px] text-amber-400 font-mono font-bold">
                  {selectedStudentIds.length} Selected
                </span>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#71717a]" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                  placeholder="Search student by name, roll number, or grade..."
                  className="w-full bg-[#1c1c20] border border-[#27272a] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#52525b] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="max-h-48 overflow-y-auto divide-y divide-[#222] border border-[#27272a] rounded-lg bg-[#18181b]">
                {loadingStudents ? (
                  <div className="p-4 text-center text-xs text-[#71717a]">Loading student registry...</div>
                ) : filteredStudents.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#71717a]">No students found.</div>
                ) : (
                  filteredStudents.map(st => {
                    const isChecked = selectedStudentIds.includes(st.id) || selectedStudentIds.includes(st.roll_no);
                    return (
                      <div
                        key={st.id || st.roll_no}
                        onClick={() => toggleStudent(st.id || st.roll_no)}
                        className={`flex items-center justify-between p-2.5 px-3 cursor-pointer text-xs hover:bg-[#222] transition-colors ${
                          isChecked ? 'bg-amber-500/10' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                            isChecked ? 'bg-amber-500 border-amber-500 text-black' : 'border-[#3f3f46]'
                          }`}>
                            {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{st.name}</div>
                            <div className="text-[10px] text-[#71717a]">
                              Roll: #{st.roll_no || '001'} · {st.grade || 'Grade 9'} · {st.school_name || 'VidyaSetu School'}
                            </div>
                          </div>
                        </div>
                        {isChecked && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded-full">
                            Invited
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#27272a] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#a1a1aa] hover:text-white hover:bg-[#1f1f22] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black flex items-center gap-2 transition-all shadow-lg shadow-amber-500/10 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="h-3.5 w-3.5 rounded-full border-2 border-black/30 border-t-black animate-spin" />
              ) : (
                <Calendar className="h-3.5 w-3.5" />
              )}
              <span>Confirm & Schedule Class</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

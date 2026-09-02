import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  GraduationCap, Users, Monitor, Video, CheckCircle2,
  TrendingUp, BarChart3, ChevronRight, Wifi
} from 'lucide-react';

export const PrincipalView = () => {
  const { principal, schools, liveClasses, joinLiveMeeting, selectedSchoolId } = useApp();
  const currentSchool = (selectedSchoolId !== 'ALL' && schools.find(s => s.id === selectedSchoolId)) ||
                        schools.find(s => s.id === principal.schoolId) ||
                        schools[0];
  const activeLive = liveClasses.find(c => c.status === 'LIVE');

  const metrics = [
    { label: 'Enrolled Students',     value: currentSchool.studentsCount,         sub: 'Grades 6–12', Icon: GraduationCap, cls: 'metric-card-blue' },
    { label: "Today's Attendance",    value: principal.todayAttendance,           sub: '465 / 480 present', Icon: CheckCircle2, cls: 'metric-card-green' },
    { label: 'Live Stream Ready',      value: principal.csLiveStreamParticipation, sub: '100 Mbps dedicated', Icon: Wifi, cls: 'metric-card-purple' },
    { label: 'Smart CS Classrooms',   value: `${currentSchool.smartClassrooms} Labs`, sub: 'Audio/Video synced', Icon: Monitor, cls: 'metric-card-orange' },
  ];

  const batches = [
    { grade: 'Grade 6 & 7', count: 140, topic: 'Block Logic & Flowcharts',   mentor: 'Mr. A. Swaminathan',  status: 'Completed' },
    { grade: 'Grade 8',     count: 110, topic: 'HTML5/CSS3 Web Layouts',     mentor: 'Ms. Priyanka Sen',    status: 'Upcoming 11:30 AM' },
    { grade: 'Grade 9 & 10',count: 125, topic: 'Python 3 Problem Solving',   mentor: 'Prof. Vikram Aditya', status: 'Live Now' },
    { grade: 'Grade 11 & 12',count:105, topic: 'Data Structures & SQL',     mentor: 'Dr. Sunita Deshmukh', status: 'Today 3:00 PM' },
  ];

  return (
    <div className="space-y-6 pb-10 max-w-screen-xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs text-[#52525b] font-semibold mb-1">School Node Administration</div>
          <h1 className="text-2xl font-bold text-[#fafafa]">Principal {principal.name}</h1>
          <p className="text-sm text-[#52525b] mt-1">{currentSchool.name} · {currentSchool.city}, {currentSchool.state}</p>
        </div>
        {activeLive && (
          <button
            onClick={() => joinLiveMeeting(activeLive.id, false)}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-400 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            Join Live Class
          </button>
        )}
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(({ label, value, sub, Icon, cls }) => (
          <div key={label} className={cls}>
            <div className="absolute top-4 right-4 bg-white/20 p-2 rounded-xl">
              <Icon className="h-5 w-5 text-white" />
            </div>
            <Icon className="absolute -right-4 -bottom-4 h-24 w-24 text-white/10" />
            <div className="text-sm font-medium text-white/90">{label}</div>
            <div className="text-3xl font-bold text-white mt-2 mb-1">{value}</div>
            <div className="text-xs text-white/70">
              <span className="bg-white/20 px-2 py-0.5 rounded-full">{sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Daily Batches ── */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-[#27272a]">
          <h3 className="text-sm font-semibold text-[#fafafa]">Daily CS Batches & Mentor Allocation</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Grade</th>
              <th>Topic</th>
              <th>Mentor</th>
              <th>Students</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((b, i) => (
              <tr key={i}>
                <td className="font-semibold text-[#fafafa]">{b.grade}</td>
                <td>{b.topic}</td>
                <td>{b.mentor}</td>
                <td className="font-mono">{b.count}</td>
                <td>
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full
                    ${b.status.includes('Live') ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      b.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      'bg-[#1f1f22] text-[#a1a1aa] border border-[#27272a]'}`}>
                    {b.status.includes('Live') && <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />}
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Bottom row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-[#fafafa] mb-4">Lab Infrastructure</h3>
          <div className="space-y-3">
            {[
              { label: 'CS Lab Systems', value: `${currentSchool.csLabSystems} workstations`, pct: 100 },
              { label: 'Internet Speed', value: currentSchool.internetStatus, pct: 95 },
              { label: 'Classroom AV',   value: 'All synced', pct: 100 },
            ].map(({ label, value, pct }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#a1a1aa]">{label}</span>
                  <span className="text-[#fafafa] font-medium">{value}</span>
                </div>
                <div className="h-1.5 progress-bg rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-[#fafafa] mb-4">School Performance vs Trust Average</h3>
          <div className="space-y-4">
            {[
              { label: 'Attendance Rate',  mine: 96, trust: 87, color: 'bg-blue-500' },
              { label: 'Assignment Pass%', mine: 94, trust: 82, color: 'bg-purple-500' },
              { label: 'Live Class Join%', mine: 89, trust: 78, color: 'bg-emerald-500' },
            ].map(({ label, mine, trust, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#a1a1aa]">{label}</span>
                  <span className="text-[#fafafa] font-bold font-mono">{mine}% <span className="text-[#52525b] font-normal">vs {trust}% avg</span></span>
                </div>
                <div className="h-2 progress-bg rounded-full relative overflow-hidden">
                  <div className="h-full bg-[#27272a] rounded-full absolute inset-0" style={{ width: `${trust}%` }} />
                  <div className={`h-full ${color} rounded-full relative`} style={{ width: `${mine}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

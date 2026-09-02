import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const DEFAULT_STUDENT = {
  id: "1",
  name: "Aarav Sharma",
  rollNo: "001",
  schoolId: "SCH-001",
  schoolName: "Adarsh Vidya Mandir #01 (Central)",
  grade: "Grade 9",
  cluster: "Northern Rural Cluster",
  xpPoints: 350,
  streakDays: 14,
  rankInSchool: 2,
  rankInTrust: 18,
  badges: [
    { id: "b1", title: "Python Pioneer", icon: "Code", color: "bg-purple-500/20 text-purple-400 border-purple-500/40" },
    { id: "b2", title: "100% Live Attendance", icon: "Video", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" }
  ],
  completedLessons: 12,
  assignmentsSubmitted: 5,
  averageCodeScore: "95.0%"
};

const DEFAULT_TEACHER = {
  id: "1",
  name: "Prof. Vikram Aditya",
  designation: "Senior CS Master Educator",
  assignedSchools: ["SCH-001"],
  activeLiveMeet: "LIVE-01",
  totalStudentsTaught: 15420,
  rating: 4.95,
  upcomingClasses: 4,
  pendingSubmissionsToReview: 14
};

const DEFAULT_PRINCIPAL = {
  id: "PRIN-SCH-001",
  name: "Dr. Mahendra Pratap",
  schoolId: "SCH-001",
  schoolName: "Adarsh Vidya Mandir #01 (Central)",
  totalStudents: 480,
  activeTeachers: 16,
  csLabReadiness: "100% Operational (32 PCs)",
  todayAttendance: "96.8%",
  csLiveStreamParticipation: "98.2%"
};

const DEFAULT_IMPACT = {
  trustName: "VidyaSetu Foundation",
  csrDonors: [
    { name: "Global Tech for Education Initiative", contribution: "120 Laptops & Smart Labs", cycle: "2025-26" },
    { name: "Bharat Digital Shiksha Trust", contribution: "High-Speed Satellite Terminals (15 Schools)", cycle: "2025-26" },
    { name: "Infosys Foundation Partner Grant", contribution: "CS Teacher Training Program for 480 Mentors", cycle: "2026-27" }
  ],
  genderBreakdown: { female: 7480, male: 7940, percentageFemale: 48.5 },
  ruralInclusion: { ruralSchools: 34, urbanSchools: 8, firstGenerationComputerUsers: "68.2%" },
  monthlyGrowth: [
    { month: "Jan", activeUsers: 11200, codeRuns: 45000 },
    { month: "Feb", activeUsers: 12400, codeRuns: 56000 },
    { month: "Mar", activeUsers: 13100, codeRuns: 68000 },
    { month: "Apr", activeUsers: 13900, codeRuns: 79000 },
    { month: "May", activeUsers: 14600, codeRuns: 92000 },
    { month: "Jun", activeUsers: 15420, codeRuns: 115000 }
  ]
};

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('vst_token') || null);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('vst_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentRole, setCurrentRole] = useState(currentUser?.role || 'student'); // 'trust-admin' | 'school-admin' | 'principal' | 'teacher' | 'student' | 'parent'
  const [selectedSchoolId, setSelectedSchoolId] = useState('ALL');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false); // Clean Light Mode by default
  const [globalSearch, setGlobalSearch] = useState('');
  
  // Foundation Branding & Customization
  const [foundationName, setFoundationName] = useState("VidyaSetu Foundation");
  
  // Data stores (synced with Neon PostgreSQL)
  const [schools, setSchools] = useState([]);
  const [curriculum, setCurriculum] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [student, setStudent] = useState(DEFAULT_STUDENT);
  const [teacher, setTeacher] = useState(DEFAULT_TEACHER);
  const [principal, setPrincipal] = useState(DEFAULT_PRINCIPAL);
  const [impactMetrics, setImpactMetrics] = useState(DEFAULT_IMPACT);
  const [dbConnected, setDbConnected] = useState(true);

  // Analytics & Leaderboards
  const [classLeaderboard, setClassLeaderboard] = useState([]);
  const [schoolLeaderboard, setSchoolLeaderboard] = useState([]);
  const [trustAnalytics, setTrustAnalytics] = useState([]);

  // Notifications & Global Socket
  const [notifications, setNotifications] = useState([]);
  const globalSocketRef = useRef(null);

  const addNotification = (notif) => {
    setNotifications(prev => [...prev, { id: Date.now(), ...notif }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notif.id));
    }, 5000);
  };

  useEffect(() => {
    if (currentUser) {
      const socket = io('http://localhost:3001', { transports: ['websocket'] });
      globalSocketRef.current = socket;
      socket.on('global-notification', (payload) => {
        addNotification(payload);
      });
      socket.on('class-scheduled', (newClass) => {
        const formatted = {
          id: newClass.id,
          title: newClass.title,
          subject: newClass.subject,
          grade: newClass.grade,
          teacher: newClass.teacher,
          teacherRole: newClass.teacher_role,
          startTime: newClass.start_time,
          duration: newClass.duration,
          status: newClass.status,
          attendeesCount: newClass.attendees_count || 0,
          schoolsConnected: newClass.schools_connected || 1,
          meetCode: newClass.meet_code,
          targetType: newClass.target_type || 'ALL',
          targetGrade: newClass.target_grade,
          targetSection: newClass.target_section,
          targetStudentIds: typeof newClass.target_student_ids === 'string' ? JSON.parse(newClass.target_student_ids) : (newClass.target_student_ids || []),
          scheduledDate: newClass.scheduled_date,
          schoolId: newClass.school_id,
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
        };
        setLiveClasses(prev => [formatted, ...prev.filter(c => c.id !== formatted.id)]);
      });
      socket.on('class-status-changed', ({ id, status }) => {
        setLiveClasses(prev => prev.map(c => c.id === id ? { ...c, status } : c));
      });
      return () => { socket.disconnect(); };
    }
  }, [currentUser]);

  // Sync dynamic role objects from database
  useEffect(() => {
    const fetchRoleProfile = async () => {
      try {
        const res = await fetch(`/api/users/profile/${currentRole}`);
        if (res.ok) {
          const profile = await res.json();
          if (currentRole === 'student') setStudent(profile);
          if (currentRole === 'teacher') setTeacher(profile);
          if (currentRole === 'principal' || currentRole.includes('admin')) setPrincipal(profile);
          if (currentRole === 'parent') setParent(profile);
        }
      } catch (err) {
        // use default state
      }
    };

    if (currentUser) {
      setCurrentRole(currentUser.role);
      localStorage.setItem('vst_user', JSON.stringify(currentUser));
      fetchRoleProfile();
    } else {
      fetchRoleProfile();
      localStorage.removeItem('vst_user');
    }
  }, [currentUser, currentRole]);

  useEffect(() => {
    if (token) localStorage.setItem('vst_token', token);
    else localStorage.removeItem('vst_token');
  }, [token]);

  // Sync with Neon PostgreSQL API on load
  useEffect(() => {
    const fetchDbData = async () => {
      try {
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const fetchOpts = { headers };

        const [schoolsRes, liveRes, assignRes, impactRes, trustAnRes, currRes] = await Promise.all([
          fetch('/api/schools', fetchOpts).then(r => r.ok ? r.json() : null),
          fetch('/api/live-classes', fetchOpts).then(r => r.ok ? r.json() : null),
          fetch('/api/assignments', fetchOpts).then(r => r.ok ? r.json() : null),
          fetch('/api/impact-stats', fetchOpts).then(r => r.ok ? r.json() : null),
          fetch('/api/analytics/schools', fetchOpts).then(r => r.ok ? r.json() : null),
          fetch('/api/curriculum', fetchOpts).then(r => r.ok ? r.json() : null)
        ]);

        if (trustAnRes) {
          setTrustAnalytics(trustAnRes);
        }

        if (currRes && currRes.length > 0) {
          setCurriculum(currRes);
        }

        if (impactRes) {
          setImpactMetrics(prev => ({ ...prev, ...impactRes }));
        }

        if (schoolsRes && schoolsRes.length > 0) {
          const formatted = schoolsRes.map(s => ({
            id: s.id,
            name: s.name,
            cluster: s.cluster,
            city: s.city,
            state: s.state,
            principal: s.principal,
            email: s.email,
            studentsCount: s.students_count || 480,
            teachersCount: s.teachers_count || 16,
            csLabSystems: s.cs_lab_systems || 32,
            internetStatus: s.internet_status || 'Optical Fiber (100 Mbps)',
            rating: parseFloat(s.rating) || 4.8,
            status: s.status || 'Active',
            gradesCovered: s.grades_covered || 'Grade 6-12',
            smartClassrooms: s.smart_classrooms || 4
          }));
          setSchools(formatted);
          setDbConnected(true);
        }

        if (liveRes && liveRes.length > 0) {
          const formattedLive = liveRes.map(l => ({
            id: l.id,
            title: l.title,
            subject: l.subject,
            grade: l.grade,
            teacher: l.teacher,
            teacherRole: l.teacher_role,
            startTime: l.start_time,
            duration: l.duration,
            status: l.status,
            attendeesCount: l.attendees_count,
            schoolsConnected: l.schools_connected,
            meetCode: l.meet_code,
            targetType: l.target_type || 'ALL',
            targetGrade: l.target_grade,
            targetSection: l.target_section,
            targetStudentIds: typeof l.target_student_ids === 'string' ? JSON.parse(l.target_student_ids) : (l.target_student_ids || []),
            scheduledDate: l.scheduled_date,
            schoolId: l.school_id,
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
          }));
          setLiveClasses(formattedLive);
        }

        if (assignRes && assignRes.length > 0) {
          setAssignments(assignRes.map(a => ({
            id: a.id,
            title: a.title,
            language: a.language,
            difficulty: a.difficulty,
            grade: a.grade,
            points: a.points,
            description: a.description,
            starterCode: a.starter_code,
            submissionsCount: a.submissions_count || 0,
            passedCount: a.passed_count || 0,
            deadline: a.deadline
          })));
        }
      } catch (err) {
        console.error('Postgres API fetch error:', err);
      }
    };

    const fetchLeaderboards = async () => {
      try {
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const schId = currentUser?.schoolId || selectedSchoolId !== 'ALL' ? selectedSchoolId : 'SCH-001';
        const schRes = await fetch(`/api/leaderboard/school?schoolId=${schId}`, { headers });
        if (schRes.ok) setSchoolLeaderboard(await schRes.json());

        const gr = currentUser?.grade || 'Grade 9';
        const clsRes = await fetch(`/api/leaderboard/class?schoolId=${schId}&grade=${gr}`, { headers });
        if (clsRes.ok) setClassLeaderboard(await clsRes.json());
      } catch (e) {
        console.error('Failed to fetch leaderboards:', e);
      }
    };

    fetchDbData();
    fetchLeaderboards();
  }, [token, currentUser?.schoolId, currentUser?.grade, selectedSchoolId]);

  // Theme management
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Live Meet Engine State
  const [joinedMeetId, setJoinedMeetId] = useState(null);
  const [isTeacherHost, setIsTeacherHost] = useState(false);
  const [meetAudio, setMeetAudio] = useState(true);
  const [meetVideo, setMeetVideo] = useState(true);
  const [meetScreenShare, setMeetScreenShare] = useState(false);
  const [meetLowBandwidth, setMeetLowBandwidth] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  
  // Live Meeting Chat
  const [meetChatMessages, setMeetChatMessages] = useState([
    { id: 1, sender: "Prof. Vikram Aditya", role: "Host / Teacher", text: "Welcome everyone! Today we are diving into LIFO Stacks and memory visualization in Python.", time: "10:02 AM", isHost: true },
    { id: 2, sender: "Adarsh Vidya Mandir #01 (Lab 2)", role: "School Node", text: "Lab 2 with 32 students connected loud and clear.", time: "10:03 AM", isHost: false },
    { id: 3, sender: "Aarav Sharma (You)", role: "Student", text: "Sir, is pop() operation O(1) in dynamic arrays?", time: "10:05 AM", isHost: false }
  ]);

  const [meetParticipants, setMeetParticipants] = useState([
    { id: "p1", name: "Prof. Vikram Aditya (Master Teacher)", school: "Central Hub", isHost: true, isAudio: true, isVideo: true, handRaised: false, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
    { id: "p2", name: "Adarsh Vidya Mandir #01 CS Lab", school: "Jaipur Rural (32 PCs)", isHost: false, isAudio: true, isVideo: true, handRaised: false, avatar: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=150&auto=format&fit=crop&q=80" },
    { id: "p3", name: "Sarvodaya Balika Vidyalaya CS Lab", school: "Alwar Outskirts (28 PCs)", isHost: false, isAudio: false, isVideo: true, handRaised: true, avatar: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=150&auto=format&fit=crop&q=80" },
    { id: "p4", name: "Vivekananda Tribal High School Lab", school: "Ranchi (24 PCs)", isHost: false, isAudio: false, isVideo: true, handRaised: false, avatar: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=150&auto=format&fit=crop&q=80" },
    { id: "p5", name: "Aarav Sharma (You)", school: "Adarsh Vidya Mandir #01", isHost: false, isAudio: true, isVideo: true, handRaised: false, avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80" }
  ]);

  // Live Shared Code
  const [liveSharedCode, setLiveSharedCode] = useState(`# Python 3 Live Stream - Prof. Vikram Aditya
class Stack:
    def __init__(self):
        self.items = []
        
    def is_empty(self):
        return len(self.items) == 0
        
    def push(self, item):
        self.items.append(item)
        print(f"Pushed: {item} -> Current Stack: {self.items}")
        
    def pop(self):
        if not self.is_empty():
            removed = self.items.pop()
            print(f"Popped: {removed} <- Stack: {self.items}")
            return removed
        return "Stack Underflow!"

# Interactive Demo
s = Stack()
s.push("Browser Tab 1: VidyaSetu")
s.push("Browser Tab 2: Schools24 Meet")
s.push("Browser Tab 3: Python Compiler")
s.pop()
`);

  // Active IDE code
  const [activeIdeLanguage, setActiveIdeLanguage] = useState('python');
  const [activeIdeCode, setActiveIdeCode] = useState(`def solve_problem():
    # Welcome to VidyaSetu CS Playground Powered by Schools24!
    # Write your Computer Science algorithm below:
    numbers = [12, 45, 67, 89, 34, 23, 90, 102]
    
    print("Array Elements:", numbers)
    print("Maximum Value:", max(numbers))
    print("Even Numbers:", [x for x in numbers if x % 2 == 0])

solve_problem()
`);

  // Initial mock notifications can be seeded if needed, but we rely on the socket state defined above.

  const joinLiveMeeting = (meetId, asHost = false) => {
    setJoinedMeetId(meetId);
    setIsTeacherHost(asHost);
    setActiveTab('live-meet');
    addNotification("Joined Live Classroom", `Connected to session ${meetId} powered by Schools24.`, "live");
    
    // Log attendance to PostgreSQL
    fetch('/api/live-classes/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        classId: meetId,
        studentId: student.id,
        studentName: student.name,
        schoolId: student.schoolId,
        schoolName: student.schoolName
      })
    }).catch(() => {});
  };

  const leaveLiveMeeting = () => {
    setJoinedMeetId(null);
    setMeetScreenShare(false);
    addNotification("Left Classroom", "Session disconnected. Attendance recorded in PostgreSQL.", "info");
  };

  const sendChatMessage = (text) => {
    if (!text.trim()) return;
    const msg = {
      id: Date.now(),
      sender: currentRole === 'teacher' ? teacher.name : student.name + " (You)",
      role: currentRole === 'teacher' ? "Host / Teacher" : "Student",
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isHost: currentRole === 'teacher'
    };
    setMeetChatMessages(prev => [...prev, msg]);
  };

  const toggleRaiseHand = () => {
    setHandRaised(prev => {
      const nextState = !prev;
      setMeetParticipants(curr => curr.map(p => {
        if (p.id === "p5") return { ...p, handRaised: nextState };
        return p;
      }));
      return nextState;
    });
  };

  const submitAssignment = async (assignmentId, code, passedAll) => {
    // 1. Submit to Postgres DB
    try {
      await fetch('/api/assignments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          assignmentId,
          studentId: student.id,
          studentName: student.name,
          schoolId: student.schoolId,
          code,
          status: passedAll ? 'passed' : 'failed',
          score: passedAll ? 100 : 50
        })
      });
    } catch (e) {
      console.log('Submitting in local state mode:', e);
    }

    setAssignments(prev => prev.map(item => {
      if (item.id === assignmentId) {
        return {
          ...item,
          submissionsCount: item.submissionsCount + 1,
          passedCount: passedAll ? item.passedCount + 1 : item.passedCount
        };
      }
      return item;
    }));

    if (passedAll) {
      setStudent(prev => ({
        ...prev,
        xpPoints: prev.xpPoints + 100,
        assignmentsSubmitted: prev.assignmentsSubmitted + 1
      }));
      addNotification({ title: "Assignment Solved! 🚀", message: "+100 XP gained! Saved to PostgreSQL.", type: "success" });
    } else {
      addNotification({ title: "Submission Recorded", message: "Review test case diagnostics and retry.", type: "warning" });
    }
  };

  // Schedule a Live Class (Targeted by All / Class / Individual Students)
  const scheduleClass = async (classData) => {
    try {
      const res = await fetch('/api/live-classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(classData)
      });
      if (res.ok) {
        const created = await res.json();
        const formatted = {
          id: created.id,
          title: created.title,
          subject: created.subject,
          grade: created.grade,
          teacher: created.teacher,
          teacherRole: created.teacher_role,
          startTime: created.start_time,
          duration: created.duration,
          status: created.status,
          attendeesCount: created.attendees_count || 0,
          schoolsConnected: created.schools_connected || 1,
          meetCode: created.meet_code,
          targetType: created.target_type || 'ALL',
          targetGrade: created.target_grade,
          targetSection: created.target_section,
          targetStudentIds: typeof created.target_student_ids === 'string' ? JSON.parse(created.target_student_ids) : (created.target_student_ids || []),
          scheduledDate: created.scheduled_date,
          schoolId: created.school_id,
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
        };
        setLiveClasses(prev => [formatted, ...prev.filter(c => c.id !== formatted.id)]);
        addNotification({
          title: "Masterclass Scheduled! 📅",
          message: `"${formatted.title}" scheduled for ${formatted.scheduledDate} at ${formatted.startTime}.`,
          type: "success"
        });
        return { success: true, data: formatted };
      }
    } catch (e) {
      console.error('Failed to schedule class on server:', e);
    }
    // Fallback local memory mode
    const localId = `LIVE-${Date.now()}`;
    const fallback = {
      id: localId,
      ...classData,
      attendeesCount: 0,
      schoolsConnected: 1,
      meetCode: classData.meetCode || `vst-${Math.random().toString(36).substring(2, 7)}`,
      status: 'UPCOMING',
      targetType: classData.targetType || 'ALL',
      targetStudentIds: classData.targetStudentIds || [],
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    };
    setLiveClasses(prev => [fallback, ...prev]);
    addNotification({
      title: "Class Scheduled (Local Mode) 📅",
      message: `"${fallback.title}" scheduled for ${fallback.scheduledDate} at ${fallback.startTime}.`,
      type: "info"
    });
    return { success: true, data: fallback };
  };

  // Update Class Status (e.g. Start Live / End Class)
  const updateClassStatus = async (classId, status) => {
    try {
      await fetch(`/api/live-classes/${classId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
    } catch (e) {
      console.error('Failed to update class status:', e);
    }
    setLiveClasses(prev => prev.map(c => c.id === classId ? { ...c, status } : c));
  };

  // Directory Data Fetchers
  const fetchDirectoryStudents = async (filters = {}) => {
    try {
      const q = new URLSearchParams();
      if (filters.schoolId) q.append('schoolId', filters.schoolId);
      if (filters.grade) q.append('grade', filters.grade);
      if (filters.search) q.append('search', filters.search);
      const res = await fetch(`/api/directory/students?${q.toString()}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('Error fetching students:', e);
    }
    return [];
  };

  const fetchDirectoryTeachers = async (filters = {}) => {
    try {
      const q = new URLSearchParams();
      if (filters.schoolId) q.append('schoolId', filters.schoolId);
      if (filters.subject) q.append('subject', filters.subject);
      if (filters.search) q.append('search', filters.search);
      const res = await fetch(`/api/directory/teachers?${q.toString()}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('Error fetching teachers:', e);
    }
    return [];
  };

  // Filter scheduled classes for the current student/role
  const getTargetedClasses = () => {
    if (currentRole === 'teacher' || currentRole === 'admin' || currentRole === 'principal') {
      return liveClasses;
    }
    // For student role: filter classes targeted to ALL, student's Grade/Section, or student ID
    return liveClasses.filter(c => {
      if (!c.targetType || c.targetType === 'ALL') return true;
      if (c.targetType === 'CLASS') {
        if (!c.targetGrade) return true;
        return c.targetGrade.toLowerCase().includes(String(student.grade || '9').toLowerCase()) ||
               String(student.grade || '').toLowerCase().includes(c.targetGrade.toLowerCase());
      }
      if (c.targetType === 'STUDENTS') {
        const studentIds = Array.isArray(c.targetStudentIds) ? c.targetStudentIds : [];
        return studentIds.includes(student.id) ||
               studentIds.includes(student.rollNo) ||
               studentIds.includes(currentUser?.id) ||
               studentIds.includes(String(student.name));
      }
      return true;
    });
  };

  const activeSchools = selectedSchoolId === 'ALL' 
    ? schools 
    : schools.filter(s => s.id === selectedSchoolId);

  const trustInfo = {
    name: foundationName,
    shortName: "VidyaSetu",
    tagline: "Empowering 15,000+ Students Across 42 Trust Schools in Computer Science & Digital Literacy",
    establishedYear: 2018,
    partner: "Powered by SCHOOLS24",
    stats: {
      totalSchools: schools.length || 42,
      totalStudents: schools.reduce((acc, s) => acc + (s.studentsCount || 0), 0) || 15420,
      totalTeachers: schools.reduce((acc, s) => acc + (s.teachersCount || 0), 0) || 480,
      activeLiveClassesToday: liveClasses.length || 3,
      csLabsConnected: schools.filter(s => (s.csLabSystems || 0) > 0).length || 40,
      digitalLiteracyIndex: "94.6%",
      femaleParticipation: "48.5%",
      codeSubmissionsToday: 3840
    },
    clusters: [
      { id: "north", name: "Northern Rural Cluster", schoolCount: schools.filter(s => s.cluster === 'north').length || 11, studentCount: 4120, lead: "Dr. Rajeshwar Sharma" },
      { id: "south", name: "Southern Valley Cluster", schoolCount: schools.filter(s => s.cluster === 'south').length || 12, studentCount: 4580, lead: "Mrs. Meenakshi Sundaram" },
      { id: "east", name: "Eastern Tribal & Sub-Urban Cluster", schoolCount: schools.filter(s => s.cluster === 'east').length || 10, studentCount: 3640, lead: "Prof. Animesh Roy" },
      { id: "west", name: "Western Coastal Cluster", schoolCount: schools.filter(s => s.cluster === 'west').length || 9, studentCount: 3080, lead: "Dr. Sunita Deshmukh" }
    ]
  };

  return (
    <AppContext.Provider value={{
      token,
      setToken,
      currentUser,
      setCurrentUser,
      currentRole,
      setCurrentRole,
      selectedSchoolId,
      setSelectedSchoolId,
      activeTab,
      setActiveTab,
      isDarkMode,
      setIsDarkMode,
      globalSearch,
      setGlobalSearch,
      foundationName,
      setFoundationName,
      trustInfo,
      schools,
      activeSchools,
      curriculum,
      liveClasses,
      targetedClasses: getTargetedClasses(),
      scheduleClass,
      updateClassStatus,
      fetchDirectoryStudents,
      fetchDirectoryTeachers,
      assignments,
      student,
      teacher,
      principal,
      impactMetrics,
      notifications,
      addNotification,
      globalSocket: globalSocketRef.current,
      dbConnected,
      classLeaderboard,
      schoolLeaderboard,
      trustAnalytics,
      // Live Meeting
      joinedMeetId,
      isTeacherHost,
      meetAudio,
      setMeetAudio,
      meetVideo,
      setMeetVideo,
      meetScreenShare,
      setMeetScreenShare,
      meetLowBandwidth,
      setMeetLowBandwidth,
      handRaised,
      toggleRaiseHand,
      meetChatMessages,
      sendChatMessage,
      meetParticipants,
      liveSharedCode,
      setLiveSharedCode,
      joinLiveMeeting,
      leaveLiveMeeting,
      // IDE
      activeIdeLanguage,
      setActiveIdeLanguage,
      activeIdeCode,
      setActiveIdeCode,
      submitAssignment
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);


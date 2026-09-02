import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { Schools24Meet } from './components/live/Schools24Meet';
import { CodeLab } from './components/ide/CodeLab';
import { CourseViewer } from './components/curriculum/CourseViewer';
import { AssignmentsManager } from './components/assignments/AssignmentsManager';
import { SchoolsClusterManager } from './components/schools/SchoolsClusterManager';
import { StudentDirectory } from './components/directory/StudentDirectory';
import { TeacherDirectory } from './components/directory/TeacherDirectory';
import { NgoImpactDashboard } from './components/analytics/NgoImpactDashboard';
import { TrustAdminView } from './components/roles/TrustAdminView';
import { PrincipalView } from './components/roles/PrincipalView';
import { TeacherView } from './components/roles/TeacherView';
import { StudentView } from './components/roles/StudentView';
import { ParentView } from './components/roles/ParentView';
import { Bell } from 'lucide-react';

const GlobalToasts = () => {
  const { notifications } = useApp();
  if (!notifications?.length) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {notifications.map(n => (
        <div key={n.id} className="bg-zinc-900 border border-zinc-700 shadow-2xl rounded-xl p-4 w-80 text-white flex gap-3 items-start animate-in slide-in-from-right-8 fade-in pointer-events-auto">
          <div className="p-2 bg-violet-500/20 text-violet-400 rounded-lg shrink-0">
            <Bell className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold">{n.title}</h4>
            <p className="text-xs text-zinc-400 mt-0.5">{n.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export const App = () => {
  const { currentRole, activeTab } = useApp();

  const renderContent = () => {
    switch(activeTab) {
      case 'live-meet':
        return <Schools24Meet />;
      case 'codelab':
        return <CodeLab />;
      case 'codelab-sandbox':
        return <CodeLab isSandbox={true} />;
      case 'curriculum':
        return <CourseViewer />;
      case 'assignments':
        return <AssignmentsManager />;
      case 'schools-directory':
        return <SchoolsClusterManager />;
      case 'students-directory':
        return <StudentDirectory />;
      case 'teachers-directory':
        return <TeacherDirectory />;
      case 'ngo-impact':
        return <NgoImpactDashboard />;
      case 'dashboard':
      default:
        switch(currentRole) {
          case 'admin':
            return <TrustAdminView />;
          case 'principal':
            return <PrincipalView />;
          case 'teacher':
            return <TeacherView />;
          case 'parent':
            return <ParentView />;
          case 'student':
          default:
            return <StudentView />;
        }
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0a0a0a', color: '#fafafa', overflow: 'hidden' }}>
      {/* Sidebar - Fixed Left */}
      <Sidebar />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', minWidth: 0 }}>
        {/* Header - Top */}
        <Header />

        {/* Scrollable Workspace */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
          {renderContent()}
        </main>
      </div>
      <GlobalToasts />
    </div>
  );
};

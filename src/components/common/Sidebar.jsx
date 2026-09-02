import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FolderGit2, 
  Video, 
  Terminal, 
  BookOpen, 
  CheckSquare, 
  Building2, 
  TrendingUp,
  Radio,
  Trophy,
  Activity,
  Award,
  HelpCircle,
  FileText,
  MessageSquare,
  MessageCircle,
  LayoutDashboard,
  GraduationCap,
  Users
} from 'lucide-react';

export const Sidebar = () => {
  const { 
    activeTab, 
    setActiveTab, 
    currentRole, 
    liveClasses,
  } = useApp();

  const activeLiveCount = liveClasses.filter(c => c.status === 'LIVE').length;

  const renderNavSection = (title, items) => (
    <div className="mb-6">
      <div className="px-3 text-[11px] font-medium text-zinc-500 mb-2">
        {title}
      </div>
      <div className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          // Vercel minimal active styling
          const activeStyle = 'bg-[#111111] text-zinc-100 border border-zinc-800 shadow-sm';

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                isActive 
                  ? activeStyle
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${isActive ? 'text-zinc-100' : 'text-zinc-500'}`} />
                <span className={isActive ? 'font-medium' : ''}>{item.label}</span>
              </div>
              
              {item.badge && (
                <span className="flex items-center gap-1 rounded bg-zinc-800 text-zinc-300 text-[10px] font-medium px-1.5 py-0.5 border border-zinc-700">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside className="w-64 flex-shrink-0 bg-black border-r border-[#27272a] h-full flex flex-col py-4">
      
      {/* Logo Section */}
      <div className="px-6 mb-8 flex items-center gap-2">
        <div className="h-7 w-7 rounded bg-white flex items-center justify-center">
          <span className="text-black font-bold text-lg tracking-tighter">S</span>
        </div>
        <span className="text-lg font-semibold text-zinc-100 tracking-tight">Schools24</span>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 px-4 overflow-y-auto">
        
        {renderNavSection('Overview', [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'ngo-impact', label: 'Analytics', icon: Activity },
        ])}

        {renderNavSection('Directories', [
          { id: 'students-directory', label: 'Student Directory', icon: GraduationCap },
          { id: 'teachers-directory', label: 'Teacher Directory', icon: Users },
          { id: 'schools-directory', label: 'Trust Schools', icon: Building2 },
        ])}

        {renderNavSection('Learning', [
          { id: 'live-meet', label: 'Live Classes', icon: Video, badge: activeLiveCount > 0 ? `${activeLiveCount} Live` : null },
          { id: 'curriculum', label: 'Curriculum', icon: BookOpen },
          { id: 'codelab', label: 'Code Sandboxes', icon: Terminal },
        ])}

        {renderNavSection('Performance', [
          { id: 'assignments', label: 'Assignments', icon: CheckSquare },
          { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
          { id: 'rewards', label: 'Rewards', icon: Award },
        ])}

        {renderNavSection('Communication', [
          { id: 'messages', label: 'Messages', icon: MessageSquare },
          { id: 'feedback', label: 'Feedback', icon: MessageCircle },
        ])}

      </div>

      {/* Promo Box (Requested by User) */}
      <div className="px-4 mt-auto pt-4">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-5 w-5 rounded bg-indigo-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs">S</span>
            </div>
            <span className="text-sm font-semibold text-indigo-200">Schools24 Pro</span>
            <span className="ml-auto text-[9px] uppercase tracking-widest bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">New</span>
          </div>
          
          <h4 className="text-zinc-100 text-sm font-medium leading-snug mb-2">
            Advanced Analytics & Reporting
          </h4>
          <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
            Get deeper insights into student performance and lab utilization across the trust.
          </p>
          
          <button className="w-full bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-medium py-2 rounded-lg transition-colors">
            Upgrade Workspace
          </button>
        </div>
      </div>

    </aside>
  );
};

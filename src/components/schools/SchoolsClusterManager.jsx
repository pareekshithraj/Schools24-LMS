import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  Search, 
  MapPin, 
  Users, 
  Monitor, 
  Wifi, 
  Star, 
  SlidersHorizontal,
  Mail,
  CheckCircle2,
  ExternalLink,
  Database
} from 'lucide-react';

export const SchoolsClusterManager = () => {
  const { schools, setSelectedSchoolId, setActiveTab } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCluster, setSelectedCluster] = useState('all');

  const clusterSummary = [
    { id: 'north', name: 'North', count: schools.filter(s => s.cluster === 'north').length },
    { id: 'south', name: 'South', count: schools.filter(s => s.cluster === 'south').length },
    { id: 'east', name: 'East', count: schools.filter(s => s.cluster === 'east').length },
    { id: 'west', name: 'West', count: schools.filter(s => s.cluster === 'west').length },
  ];

  const filteredSchools = schools.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (s.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (s.state || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (s.principal || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCluster = selectedCluster === 'all' || s.cluster === selectedCluster;
    return matchesSearch && matchesCluster;
  });

  const totalStudents = schools.reduce((acc, s) => acc + (s.studentsCount || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#222] pb-4">
        <div>
          <h2 className="text-lg font-bold text-[#fafafa] flex items-center gap-2">
            <span>{schools.length} Trust Schools & CS Lab Network</span>
            <span className="text-xs font-normal text-zinc-400 font-mono">(PostgreSQL Synced)</span>
          </h2>
          <p className="text-xs text-zinc-500">
            Real-time status of {totalStudents.toLocaleString()} students, smart classrooms, optical fiber bandwidth, and computer workstations.
          </p>
        </div>

        {/* Cluster Pill Summary */}
        <div className="flex flex-wrap gap-2 text-xs">
          {clusterSummary.map(c => (
            <div key={c.id} className="border border-[#222] bg-[#111] px-2.5 py-1 rounded-md text-zinc-300">
              <span className="font-semibold">{c.name}:</span> <span className="font-mono">{c.count} schools</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Bar (Vercel Style) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by school name, state, principal..."
            className="w-full bg-[#111] border border-[#222] rounded-md pl-9 pr-4 py-1.5 text-xs text-[#fafafa] placeholder-zinc-400 focus:outline-none focus:border-zinc-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {['all', 'north', 'south', 'east', 'west'].map((cl) => (
            <button
              key={cl}
              onClick={() => setSelectedCluster(cl)}
              className={`px-2.5 py-1 rounded-md font-medium capitalize transition-colors ${
                selectedCluster === cl 
                  ? 'bg-black text-white dark:bg-white dark:text-black font-semibold' 
                  : 'border border-[#222] bg-[#111] text-zinc-400 hover:border-zinc-400'
              }`}
            >
              {cl === 'all' ? `All Clusters (${schools.length})` : `${cl} Cluster`}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of School Cards (Vercel Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredSchools.map((s) => (
          <div
            key={s.id}
            className="vercel-card p-4 space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono font-semibold text-zinc-400">
                    {s.id} • {s.cluster.toUpperCase()}
                  </span>
                  <h3 className="text-xs font-bold text-[#fafafa] mt-0.5 leading-snug">
                    {s.name}
                  </h3>
                  <div className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-zinc-400" />
                    <span>{s.city}, {s.state}</span>
                  </div>
                </div>

                <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 px-1.5 py-0.5 rounded font-semibold">
                  ★ {s.rating}
                </span>
              </div>

              {/* Lab Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#222]">
                <div className="bg-[#1a1a1a] p-2 rounded">
                  <div className="text-[10px] text-zinc-400">Students</div>
                  <div className="font-bold text-[#fafafa]">{s.studentsCount} Enrolled</div>
                </div>
                <div className="bg-[#1a1a1a] p-2 rounded">
                  <div className="text-[10px] text-zinc-400">CS Systems</div>
                  <div className="font-bold text-[#fafafa]">{s.csLabSystems} PCs Ready</div>
                </div>
              </div>

              <div className="text-[11px] text-zinc-500 truncate">
                Principal: <strong className="text-zinc-300">{s.principal}</strong>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[#222]">
              <button
                onClick={() => {
                  setSelectedSchoolId(s.id);
                  setActiveTab('dashboard');
                }}
                className="flex-1 vercel-btn-secondary py-1 text-xs"
              >
                Inspect Node
              </button>
              <a
                href={`mailto:${s.email}`}
                className="p-1.5 border border-[#222] rounded-md text-zinc-500 hover:text-[#fafafa]"
                title="Email School"
              >
                <Mail className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

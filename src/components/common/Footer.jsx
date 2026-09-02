import React from 'react';
import { useApp } from '../../context/AppContext';
import { Database, CheckCircle2 } from 'lucide-react';

export const Footer = () => {
  const { foundationName, dbConnected } = useApp();

  return (
    <footer className="w-full border-t border-[#222] bg-[#111] py-6 px-4 sm:px-6 text-zinc-500 text-xs mt-12">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Left: Foundation & Status */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-zinc-300 font-medium">All 42 School CS Systems Operational</span>
          </div>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <div className="flex items-center gap-1 text-zinc-500">
            <Database className="h-3 w-3 text-emerald-500" />
            <span>Neon PostgreSQL Active</span>
          </div>
        </div>

        {/* Right: Powered by Schools24 logo */}
        <div className="flex items-center gap-3 text-xs">
          <span className="text-zinc-400">Powered by</span>
          <img src="/SCHOOLS24.png" alt="Schools24 Logo" className="h-4 object-contain opacity-90" />
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-[#222] mt-4 pt-3 flex items-center justify-between text-[11px] text-zinc-400">
        <div>© 2026 {foundationName}. Co-branded with Schools24.</div>
        <div className="flex items-center gap-4">
          <span className="hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer">Status</span>
          <span className="hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer">CSR Documentation</span>
          <span className="hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer">CS Syllabus</span>
          <span className="hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer">Privacy</span>
        </div>
      </div>
    </footer>
  );
};

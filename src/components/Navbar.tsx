import React from 'react';
import { Box, Sparkles, FolderDown } from 'lucide-react';
import { DatabaseMetadata } from '../types';
import { DripjectsLogo } from './DripjectsLogo';

interface NavbarProps {
  metadata: DatabaseMetadata;
  totalProjectsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  metadata,
  totalProjectsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <DripjectsLogo size="md" />

        {/* Global Vault Info */}
        <div className="hidden sm:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300">
            <Box className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold text-white">{totalProjectsCount}</span>
            <span className="text-slate-400">{totalProjectsCount === 1 ? 'Project Available' : 'Projects Available'}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
            <Sparkles className="w-3 h-3" />
            <span>100% Free Downloads</span>
          </div>
        </div>

        {/* Action badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl">
            <FolderDown className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Google Drive Direct Delivery</span>
            <span className="md:hidden">Free Vault</span>
          </div>
        </div>
      </div>
    </header>
  );
};


import React from 'react';
import { Sparkles, Box, Download, Gem, LogOut, User } from 'lucide-react';
import { DatabaseMetadata } from '../types';
import { GoogleUser } from './GoogleLoginGate';

interface NavbarProps {
  metadata: DatabaseMetadata;
  currentUser: GoogleUser | null;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  metadata,
  currentUser,
  onSignOut,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/40">
            {/* Minecraft block/drip cube visual */}
            <div className="w-5 h-5 border-2 border-white/90 rotate-45 rounded-xs flex items-center justify-center bg-emerald-400/30">
              <Sparkles className="w-3 h-3 text-white -rotate-45" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-950 flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl tracking-tight text-white font-['Space_Grotesk',sans-serif]">
                DRIP<span className="text-emerald-400">JECTS</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Public Vault
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              Custom Minecraft Maps & Creations Vault
            </p>
          </div>
        </div>

        {/* Global Vault Stats */}
        <div className="hidden lg:flex items-center gap-5 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Box className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-bold text-white">{metadata.totalProjects}</span>
            <span className="text-slate-400">Project</span>
          </div>
          <div className="w-px h-3 bg-slate-800" />
          <div className="flex items-center gap-1.5 text-slate-300">
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold text-white">{metadata.totalDownloads.toLocaleString()}</span>
            <span className="text-slate-400">Downloads</span>
          </div>
          <div className="w-px h-3 bg-slate-800" />
          <div className="flex items-center gap-1.5 text-slate-300">
            <Gem className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold text-white">{metadata.totalDiamonds.toLocaleString()}</span>
            <span className="text-slate-400">Diamonds</span>
          </div>
        </div>

        {/* Authenticated User Profile & Sign Out (No Administrator Controls) */}
        <div className="flex items-center gap-3">
          {currentUser && (
            <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 pl-2 pr-3 py-1.5 rounded-xl">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
                <img
                  src={currentUser.picture}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-slate-950" />
              </div>

              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-white leading-tight truncate max-w-[120px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-400 font-mono leading-tight truncate max-w-[120px]">
                  {currentUser.email}
                </div>
              </div>

              <button
                onClick={onSignOut}
                className="ml-1 p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                title="Sign out of Google"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

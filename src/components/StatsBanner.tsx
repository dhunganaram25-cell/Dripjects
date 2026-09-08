import React from 'react';
import { HardDriveDownload, ShieldCheck, Zap, Cpu, Code2 } from 'lucide-react';
import { Project } from '../types';

interface StatsBannerProps {
  featuredProject?: Project;
  onSelectProject: (project: Project) => void;
  onRequestDownloadProject: (project: Project, e: React.MouseEvent) => void;
  onShareProject?: (project: Project, e: React.MouseEvent) => void;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({
  featuredProject,
  onSelectProject,
  onRequestDownloadProject,
  onShareProject,
}) => {
  return (
    <div className="mb-8 relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-6 md:p-8">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Mission / Intro */}
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>High-Speed Google Drive Direct Downloads</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Space_Grotesk',sans-serif]">
            Welcome to <span className="text-emerald-400">Dripjects</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            Custom Minecraft creation vault. Download public release maps directly from Google Drive with zero waiting, clean direct links, and open-source releases.
          </p>

          {/* Key Feature Badges */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Direct Google Drive Delivery</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60">
              <Code2 className="w-4 h-4 text-emerald-400" />
              <span>100% Open Source Vault</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Google Identity Verified</span>
            </div>
          </div>
        </div>

        {/* Right Column: Featured Project Highlight Card */}
        {featuredProject && (
          <div className="lg:col-span-5">
            <div 
              onClick={() => onSelectProject(featuredProject)}
              className="group relative rounded-xl overflow-hidden border border-slate-700/80 bg-slate-900/90 shadow-xl transition-all hover:border-emerald-500/60 cursor-pointer"
            >
              {/* Banner Image Preview */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                <img
                  src={featuredProject.bannerImage}
                  alt={featuredProject.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/pvpprac1.0beta.jpg';
                  }}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-emerald-500 text-slate-950 font-bold text-[11px] uppercase tracking-wider shadow">
                  Featured Map
                </div>
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-slate-900/90 border border-slate-700 text-slate-200 text-xs font-mono">
                  {featuredProject.fileSize}
                </div>
              </div>

              {/* Info */}
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                    {featuredProject.category.replace('-', ' ')}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {featuredProject.version}
                  </span>
                </div>

                <h3 className="font-bold text-white text-base group-hover:text-emerald-400 transition-colors line-clamp-1">
                  {featuredProject.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2">
                  {featuredProject.tagline}
                </p>

                {/* Direct Download Button */}
                <div className="pt-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>💎 {featuredProject.diamonds}</span>
                    <span>⬇️ {featuredProject.downloads.toLocaleString()}</span>
                  </div>

                  <button
                    id={`featured-download-${featuredProject.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRequestDownloadProject(featuredProject, e);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-transform active:scale-98 shadow-md shadow-emerald-500/20 cursor-pointer"
                    title="Download immediately via Google Drive"
                  >
                    <HardDriveDownload className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

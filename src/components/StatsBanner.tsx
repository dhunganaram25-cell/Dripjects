import React from 'react';
import { HardDriveDownload, ShieldCheck, Zap, Cpu, Code2 } from 'lucide-react';
import { Project } from '../types';
import { ProjectMediaCover } from './ProjectMediaCover';

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
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Free For Everyone</span>
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
              {/* Banner Image Preview with YouTube Hover 5s Preview */}
              <div className="relative w-full overflow-hidden bg-slate-950">
                <ProjectMediaCover
                  project={featuredProject}
                  aspectRatio="video"
                  className="rounded-none w-full"
                  allowWatchFull={false}
                  isCardPreview={true}
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-emerald-500 text-slate-950 font-bold text-[11px] uppercase tracking-wider shadow z-20 pointer-events-none">
                  Featured Map
                </div>
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-slate-900/90 border border-slate-700 text-slate-200 text-xs font-mono z-20 pointer-events-none">
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

                {/* Direct Download Button & Password indicator */}
                <div className="pt-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-mono text-emerald-400 font-semibold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      Zip Password: 123
                    </span>
                  </div>

                  <button
                    id={`featured-download-${featuredProject.id}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRequestDownloadProject(featuredProject, e);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all active:scale-95 shadow-md shadow-emerald-500/20 cursor-pointer"
                    title="Download immediately via Google Drive"
                  >
                    <HardDriveDownload className="w-3.5 h-3.5" />
                    <span>Download (.zip)</span>
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

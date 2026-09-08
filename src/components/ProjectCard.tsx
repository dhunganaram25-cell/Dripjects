import React, { useState } from 'react';
import { 
  HardDriveDownload, 
  Gem, 
  CheckCircle2, 
  Clock, 
  Share2,
  Check,
  KeyRound
} from 'lucide-react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  viewMode: 'grid' | 'list';
  onSelect: (project: Project) => void;
  onRequestDownload: (project: Project, e: React.MouseEvent) => void;
  onGiveDiamond: (project: Project, e: React.MouseEvent) => void;
  onShare: (project: Project, e: React.MouseEvent) => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  maps: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  'texture-packs': { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  mods: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  datapacks: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  skins: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30' },
  schematics: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  tools: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  other: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
};

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  viewMode,
  onSelect,
  onRequestDownload,
  onGiveDiamond,
  onShare,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);
  const catColor = CATEGORY_COLORS[project.category] || CATEGORY_COLORS.other;
  const is100Percent = project.completionPercentage >= 100;

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare(project, e);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2200);
  };

  if (viewMode === 'list') {
    return (
      <div 
        onClick={() => onSelect(project)}
        className="group relative flex flex-col sm:flex-row items-stretch gap-4 p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer shadow-sm hover:shadow-lg"
      >
        {/* Left Thumbnail */}
        <div className="relative sm:w-56 h-36 sm:h-auto rounded-xl overflow-hidden shrink-0 bg-slate-950">
          <img
            src={project.bannerImage}
            alt={project.title}
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/pvpprac1.0beta.png';
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur-sm text-slate-200">
            {project.category.replace('-', ' ')}
          </div>
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-950/90 text-slate-300">
            {project.fileSize}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${catColor.bg} ${catColor.text} ${catColor.border}`}>
                {project.category.replace('-', ' ')}
              </span>
              <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                {project.version}
              </span>
              <span className="text-xs text-slate-400">
                {project.gameVersion}
              </span>
            </div>

            <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
              {project.title}
            </h3>

            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              {project.tagline}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {project.tags.slice(0, 4).map((tag, idx) => (
                <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-800/60 text-slate-300">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom Bar: Stats, Share & Download */}
          <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <button
                onClick={(e) => onGiveDiamond(project, e)}
                className="flex items-center gap-1 hover:text-cyan-400 transition-colors cursor-pointer"
                title="Give a Diamond"
              >
                <Gem className="w-3.5 h-3.5 text-cyan-400" />
                <span>{project.diamonds.toLocaleString()}</span>
              </button>
              <div className="flex items-center gap-1">
                <HardDriveDownload className="w-3.5 h-3.5 text-emerald-400" />
                <span>{project.downloads.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Share Project Link Button */}
              <button
                onClick={handleShareClick}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                title="Share project link"
              >
                {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copiedShare ? 'Copied' : 'Share'}</span>
              </button>

              {/* Direct Download Button (triggers password prompt) */}
              <button
                id={`download-list-btn-${project.id}`}
                onClick={(e) => onRequestDownload(project, e)}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-transform active:scale-95 shadow-sm shadow-emerald-500/20 cursor-pointer"
              >
                <HardDriveDownload className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View (Default Planet Minecraft format)
  return (
    <div 
      onClick={() => onSelect(project)}
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-slate-900/80 hover:bg-slate-900 border border-slate-800/90 hover:border-emerald-500/50 transition-all duration-200 hover:-translate-y-0.5 shadow-md hover:shadow-xl hover:shadow-emerald-950/20 cursor-pointer"
    >
      {/* Thumbnail Banner */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-950">
        <img
          src={project.bannerImage}
          alt={project.title}
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/pvpprac1.0beta.png';
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${catColor.bg} ${catColor.text} ${catColor.border}`}>
            {project.category.replace('-', ' ')}
          </span>
          {project.featured && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/90 text-slate-950">
              Featured
            </span>
          )}
        </div>

        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[11px] font-mono bg-slate-950/80 backdrop-blur-md text-slate-300 border border-slate-800">
          {project.fileSize}
        </div>

        {/* Planet Minecraft Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-800">
          <div 
            className={`h-full ${is100Percent ? 'bg-emerald-400' : 'bg-amber-400'}`}
            style={{ width: `${Math.min(project.completionPercentage, 100)}%` }}
            title={`Completion: ${project.completionPercentage}%`}
          />
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Version & Status */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="font-mono text-emerald-400 font-semibold">{project.version}</span>
            <span className="text-[11px] flex items-center gap-1 text-slate-400">
              {is100Percent ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              ) : (
                <Clock className="w-3 h-3 text-amber-400" />
              )}
              {project.status}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-white text-base group-hover:text-emerald-400 transition-colors line-clamp-1">
            {project.title}
          </h3>

          {/* Tagline */}
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {project.tagline}
          </p>

          {/* Tags & Required Mod indicator */}
          <div className="flex flex-wrap items-center gap-1 mt-2.5">
            {project.requiredMods && project.requiredMods.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium">
                Requires {project.requiredMods[0].name}
              </span>
            )}
            {project.tags.slice(0, 2).map((tag, idx) => (
              <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Actions & Stats Bar */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
          {/* Diamond & Download Counts */}
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <button
              onClick={(e) => onGiveDiamond(project, e)}
              className="flex items-center gap-1 hover:text-cyan-300 transition-colors cursor-pointer"
              title="Give a Diamond"
            >
              <Gem className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold text-slate-300">{project.diamonds.toLocaleString()}</span>
            </button>
            <div className="flex items-center gap-1 text-slate-400" title="Total Downloads">
              <HardDriveDownload className="w-3.5 h-3.5 text-emerald-400" />
              <span>{project.downloads.toLocaleString()}</span>
            </div>
          </div>

          {/* Actions: Share & Download */}
          <div className="flex items-center gap-1.5">
            {/* Share Project Button */}
            <button
              onClick={handleShareClick}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Copy shareable link"
            >
              {copiedShare ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>

            {/* Direct Download Button (triggers password prompt) */}
            <button
              id={`download-grid-btn-${project.id}`}
              onClick={(e) => onRequestDownload(project, e)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-transform active:scale-95 shadow-sm shadow-emerald-500/20 cursor-pointer"
              title="View unzip password & download"
            >
              <HardDriveDownload className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

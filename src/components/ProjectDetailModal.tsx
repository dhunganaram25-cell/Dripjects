import React, { useState } from 'react';
import { 
  X, 
  HardDriveDownload, 
  Gem, 
  Calendar, 
  Check, 
  CheckCircle2, 
  Info,
  Code2,
  Cpu,
  Share2,
  KeyRound
} from 'lucide-react';
import { Project } from '../types';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
  onRequestDownload: (project: Project) => void;
  onGiveDiamond: (project: Project, e: React.MouseEvent) => void;
  onShare: (project: Project) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  onClose,
  onRequestDownload,
  onGiveDiamond,
  onShare,
}) => {
  if (!project) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'installation' | 'changelog'>('overview');
  const [copiedShare, setCopiedShare] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const images = project.galleryImages && project.galleryImages.length > 0 
    ? project.galleryImages 
    : [project.bannerImage];

  const handleShareClick = () => {
    onShare(project);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const password = project.zipPassword || '123';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar: Clean with Share & Close */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {project.category.replace('-', ' ')}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Version: {project.version}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Custom Share Button */}
            <button
              id="modal-share-project-btn"
              onClick={handleShareClick}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                copiedShare
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
              title="Share this project link"
            >
              {copiedShare ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedShare ? 'Share Link Copied!' : 'Share Project'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="max-h-[82vh] overflow-y-auto p-6 space-y-6">
          {/* Main Gallery Hero */}
          <div className="space-y-3">
            <div className="relative h-64 sm:h-80 w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
              <img
                src={images[selectedImageIndex] || project.bannerImage}
                alt={project.title}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/pvpprac1.0beta.png';
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                <div className="bg-slate-950/90 backdrop-blur-md px-3 py-1 rounded-md text-xs font-mono text-emerald-400 border border-slate-800">
                  {project.gameVersion}
                </div>
                <div className="bg-slate-950/90 backdrop-blur-md px-3 py-1 rounded-md text-xs font-mono text-slate-300 border border-slate-800">
                  {project.fileSize}
                </div>
              </div>
            </div>

            {/* Thumbnail switcher if multiple images */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                      selectedImageIndex === idx
                        ? 'border-emerald-500 scale-102 ring-2 ring-emerald-500/30'
                        : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`thumb ${idx}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Tagline & Author */}
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <span>Created by <strong className="text-slate-200">{project.author}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Updated {new Date(project.updatedAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {project.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-1">
              {project.tagline}
            </p>
          </div>

          {/* Requirements & Open Source Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
              <Cpu className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Mod Requirement
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Requires <strong>VexBot mod</strong> for bot training routines & combat sparring.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
              <Code2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  100% Open Source
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Totally free, fully unencrypted, and customizable for your own server or practice drills.
                </p>
              </div>
            </div>
          </div>

          {/* Primary Action Box: Planet Minecraft Direct Download Showcase */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-2 border-emerald-500/40 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <HardDriveDownload className="w-4 h-4" />
                  <span>Direct Download Package</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>Protected Zip • Password prompt shown on click</span>
                </div>
              </div>

              {/* Big Direct Download Button (triggers password dialog) */}
              <button
                id={`modal-primary-download-${project.id}`}
                onClick={() => onRequestDownload(project)}
                className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm sm:text-base rounded-xl transition-all active:scale-98 shadow-lg shadow-emerald-500/30 cursor-pointer"
              >
                <HardDriveDownload className="w-5 h-5 stroke-[2.5]" />
                <span>DIRECT DOWNLOAD</span>
                <span className="text-xs font-mono font-medium opacity-80 pl-1">({project.fileSize})</span>
              </button>
            </div>

            {/* Sub actions: Share Project, Diamond Vote, Downloads Count */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShareClick}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedShare ? 'Custom Link Copied!' : 'Share Project Link'}</span>
                </button>
              </div>

              {/* Diamond like button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => onGiveDiamond(project, e)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-300 border border-cyan-500/30 rounded-lg transition-colors cursor-pointer font-semibold"
                >
                  <Gem className="w-4 h-4 text-cyan-400" />
                  <span>Give Diamond ({project.diamonds.toLocaleString()})</span>
                </button>
                <span className="text-slate-400 font-mono">
                  {project.downloads.toLocaleString()} Downloads
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-slate-800 flex items-center gap-2">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'features', label: `Features (${project.features.length})` },
              { id: 'installation', label: 'Installation' },
              { id: 'changelog', label: `Changelog (${project.changelog.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-400 bg-slate-800/30'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="pt-2">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
                  {project.description}
                </div>

                {/* Tags List */}
                <div className="pt-3 border-t border-slate-800">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Tags & Keywords
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map((tag, idx) => (
                      <span key={idx} className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="space-y-2.5">
                {project.features.length === 0 ? (
                  <p className="text-xs text-slate-400">No feature points listed.</p>
                ) : (
                  project.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-slate-200">{feat}</span>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'installation' && (
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <Info className="w-4 h-4" />
                  <span>How to Install & Play</span>
                </div>
                <div className="text-xs sm:text-sm text-slate-300 font-mono whitespace-pre-line leading-relaxed">
                  {project.installation || "Simply download the file, unlock with password, and extract into your Minecraft saves directory."}
                </div>
              </div>
            )}

            {activeTab === 'changelog' && (
              <div className="space-y-4">
                {project.changelog.map((entry, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-emerald-400">{entry.version}</span>
                      <span className="text-slate-400">{entry.date}</span>
                    </div>
                    <ul className="space-y-1">
                      {entry.notes.map((note, nIdx) => (
                        <li key={nIdx} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

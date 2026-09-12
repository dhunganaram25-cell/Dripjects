import React, { useState, useEffect } from 'react';
import { 
  X, 
  HardDriveDownload, 
  Calendar, 
  Check, 
  CheckCircle2, 
  Code2, 
  Cpu, 
  Share2, 
  KeyRound, 
  ExternalLink, 
  AlertCircle, 
  FileCheck2, 
  GitBranch, 
  ArrowRight, 
  Sparkles,
  Tag
} from 'lucide-react';
import { Project, ProjectVersion } from '../types';
import { ProjectMediaCover } from './ProjectMediaCover';
import { ProjectImageGallery } from './ProjectImageGallery';

interface ProjectDetailModalProps {
  project: Project | null;
  initialTab?: 'overview' | 'versions' | 'gallery' | 'features' | 'installation' | 'changelog';
  onClose: () => void;
  onRequestDownload: (project: Project, version?: ProjectVersion) => void;
  onShare: (project: Project) => void;
  onSelectTag?: (tag: string) => void;
  onTabChange?: (tab: 'overview' | 'versions' | 'gallery' | 'features' | 'installation' | 'changelog') => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  initialTab = 'overview',
  onClose,
  onRequestDownload,
  onShare,
  onSelectTag,
  onTabChange,
}) => {
  if (!project) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'versions' | 'gallery' | 'features' | 'installation' | 'changelog'>(initialTab);
  const [copiedShare, setCopiedShare] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleTabClick = (tab: 'overview' | 'versions' | 'gallery' | 'features' | 'installation' | 'changelog') => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  const images = project.galleryImages && project.galleryImages.length > 0 
    ? project.galleryImages 
    : [project.bannerImage];

  const handleShareClick = () => {
    onShare(project);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const handleCopyPass = () => {
    navigator.clipboard.writeText(project.zipPassword || '123');
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2200);
  };

  const versionsList = project.versions && project.versions.length > 0 
    ? project.versions 
    : [
        {
          version: project.version,
          versionName: `${project.version} Release`,
          gameVersion: project.gameVersion,
          releaseDate: project.updatedAt ? project.updatedAt.split('T')[0] : '2026-09-08',
          status: project.status || 'Beta',
          isLatest: true,
          fileSize: project.fileSize,
          zipPassword: project.zipPassword || '123',
          googleDriveUrl: project.googleDriveUrl,
          directDownloadUrl: project.directDownloadUrl,
          changelogNotes: project.changelog?.[0]?.notes || ['Initial release on Dripjects'],
          requirements: project.requirements || [],
          requiredMods: project.requiredMods || []
        }
      ];

  const latestVersion = versionsList.find(v => v.isLatest) || versionsList[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar: Clean with Share & Close */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {project.category.replace('-', ' ')}
            </span>
            <span className="text-xs text-slate-300 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              Latest: {latestVersion.version}
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
              <span>{copiedShare ? 'Link Copied!' : 'Share Project'}</span>
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
          {/* Main Hero Media Cover (YouTube 5s Hover Preview & Full Player) */}
          <div className="space-y-3">
            <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl">
              <ProjectMediaCover 
                project={project} 
                aspectRatio="video" 
                allowWatchFull={true} 
              />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
                <div className="bg-slate-950/90 backdrop-blur-md px-3 py-1 rounded-md text-xs font-mono text-emerald-400 border border-slate-800">
                  {latestVersion.gameVersion || project.gameVersion}
                </div>
                <div className="bg-slate-950/90 backdrop-blur-md px-3 py-1 rounded-md text-xs font-mono text-slate-300 border border-slate-800">
                  {latestVersion.fileSize || project.fileSize}
                </div>
              </div>
            </div>
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
            {project.requiredMods && project.requiredMods.length > 0 ? (
              project.requiredMods.map((mod, mIdx) => (
                <div key={mIdx} className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  <div className="flex items-start gap-3">
                    <Cpu className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                          Required Mod: {mod.name}
                        </h4>
                        {mod.version && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-amber-500/20 rounded text-amber-200">
                            {mod.version}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {mod.description || `This map requires ${mod.name} to operate properly.`}
                      </p>
                    </div>
                  </div>

                  {mod.url && (
                    <a
                      href={mod.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow"
                      title={`Download ${mod.name}`}
                    >
                      <span>Get Mod</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))
            ) : (
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 text-slate-300">
                <Cpu className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Vanilla Compatible
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    No extra mods required to play this project.
                  </p>
                </div>
              </div>
            )}

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

          {/* Primary Action Box: Download Latest Version with Version & Minecraft details */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-2 border-emerald-500/40 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <HardDriveDownload className="w-4 h-4" />
                  <span>Downloading Latest Version [{latestVersion.version}] • {latestVersion.gameVersion || project.gameVersion}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>Protected Zip • Password prompt shown on click</span>
                </div>
              </div>

              {/* Big Direct Download Button: Explicitly shows Latest Version & Minecraft details */}
              <button
                id={`modal-primary-download-${project.id}`}
                onClick={() => onRequestDownload(project, latestVersion)}
                className="flex flex-col sm:flex-row items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm sm:text-base rounded-xl transition-all active:scale-98 shadow-lg shadow-emerald-500/30 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <HardDriveDownload className="w-5 h-5 stroke-[2.5]" />
                  <span>DOWNLOAD LATEST VERSION [{latestVersion.version}]</span>
                </div>
                <span className="text-xs font-mono font-bold bg-slate-950/20 px-2 py-0.5 rounded">
                  {latestVersion.gameVersion || project.gameVersion}
                </span>
              </button>
            </div>

            {/* Link to Older Versions & Password Copier */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleTabClick('versions')}
                className="text-slate-300 hover:text-emerald-400 transition-colors font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
                <span>Need an older version? Browse All Versions ({versionsList.length} available)</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyPass}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors cursor-pointer text-xs font-mono"
                  title="Click to copy archive unzip password"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>Unzip Pass: <strong className="text-emerald-400 font-bold">{project.zipPassword || '123'}</strong></span>
                  {copiedPass && <span className="text-[10px] text-emerald-400 font-sans font-bold">Copied!</span>}
                </button>
                <span className="text-[11px] text-emerald-400/90 font-medium px-2 py-1 bg-emerald-500/10 rounded-md border border-emerald-500/20">
                  100% Free
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-slate-800 flex items-center gap-2 overflow-x-auto pb-0.5">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'versions', label: `All Versions (${versionsList.length})` },
              { id: 'gallery', label: `Gallery (${images.length})` },
              { id: 'features', label: `Features (${project.features.length})` },
              { id: 'installation', label: 'Installation' },
              { id: 'changelog', label: `Changelog (${project.changelog.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id as any)}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
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
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
                  {project.description}
                </div>

                {/* Embedded Image Gallery in Overview */}
                {images.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <ProjectImageGallery images={images} projectTitle={project.title} />
                  </div>
                )}

                {/* Tags List */}
                <div className="pt-3 border-t border-slate-800">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Tags & Keywords (Click tag to filter)
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map((tag, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => onSelectTag?.(tag)}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-slate-700/60 hover:border-emerald-500/40 transition-colors cursor-pointer"
                        title={`Filter by tag #${tag}`}
                      >
                        <Tag className="w-3 h-3 text-emerald-400" />
                        <span>#{tag}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* All Versions Tab */}
            {activeTab === 'versions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-emerald-400" />
                      <span>All Releases & Versions Archive</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Select and download any version of {project.title}. Older releases and historical builds are listed below.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                    {versionsList.length} build{versionsList.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-3">
                  {versionsList.map((ver, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border transition-all ${
                        ver.isLatest
                          ? 'bg-slate-900/90 border-emerald-500/40 shadow-md shadow-emerald-500/10'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="text-base font-extrabold text-white">
                              v{ver.version}
                            </span>
                            {ver.isLatest && (
                              <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>Latest Version</span>
                              </span>
                            )}
                            <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {ver.gameVersion || project.gameVersion}
                            </span>
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800/80 text-slate-400">
                              {ver.status || 'Stable'}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              {ver.releaseDate}
                            </span>
                            <span>•</span>
                            <span className="font-mono">{ver.fileSize || project.fileSize}</span>
                            <span>•</span>
                            <span className="text-amber-400/90 flex items-center gap-1">
                              <KeyRound className="w-3 h-3" />
                              Password: {ver.zipPassword || project.zipPassword || '123'}
                            </span>
                          </div>
                        </div>

                        {/* Version Download Button */}
                        <button
                          onClick={() => onRequestDownload(project, ver)}
                          className={`shrink-0 flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer shadow active:scale-98 ${
                            ver.isLatest
                              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold shadow-emerald-500/20'
                              : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-emerald-500/40'
                          }`}
                        >
                          <HardDriveDownload className="w-4 h-4" />
                          <span>Download {ver.version}</span>
                        </button>
                      </div>

                      {/* Version Changelog / Notes */}
                      {ver.changelogNotes && ver.changelogNotes.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-800/80">
                          <h4 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">
                            Release Notes:
                          </h4>
                          <ul className="space-y-1">
                            {ver.changelogNotes.map((note, nIdx) => (
                              <li key={nIdx} className="text-xs text-slate-300 flex items-start gap-2">
                                <span className="text-emerald-400 mt-1">•</span>
                                <span>{note}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery Tab */}
            {activeTab === 'gallery' && (
              <div className="space-y-4">
                <ProjectImageGallery images={images} projectTitle={project.title} />
              </div>
            )}

            {/* Features Tab */}
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

            {/* Installation Tab */}
            {activeTab === 'installation' && (
              <div className="space-y-4">
                {/* Requirements & Dependencies */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4" />
                    <span>Installation Requirements & Dependencies</span>
                  </div>

                  {project.requiredMods && project.requiredMods.length > 0 && (
                    <div className="space-y-2">
                      {project.requiredMods.map((mod, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                          <div>
                            <span className="font-bold text-white">{mod.name}</span>
                            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-bold uppercase">
                              Required
                            </span>
                            {mod.description && (
                              <p className="text-[11px] text-slate-400 mt-0.5">{mod.description}</p>
                            )}
                          </div>
                          {mod.url && (
                            <a
                              href={mod.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 flex items-center gap-1 px-2.5 py-1 text-xs bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/30 rounded-lg transition-colors"
                            >
                              <span>Get Mod</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {project.requirements && project.requirements.length > 0 ? (
                    <div className="space-y-1 pt-1">
                      {project.requirements.map((req, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                          <FileCheck2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{req}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Step-by-step Setup Instructions
                  </h4>
                  <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line font-mono bg-slate-900/60 p-3.5 rounded-lg border border-slate-800">
                    {project.installation}
                  </div>
                </div>
              </div>
            )}

            {/* Changelog Tab */}
            {activeTab === 'changelog' && (
              <div className="space-y-4">
                {project.changelog.length === 0 ? (
                  <p className="text-xs text-slate-400">No changelog entries yet.</p>
                ) : (
                  project.changelog.map((entry, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-emerald-400">
                          Version {entry.version}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {entry.date}
                        </span>
                      </div>
                      <ul className="space-y-1 pl-4 list-disc text-xs text-slate-300">
                        {entry.notes.map((note, nIdx) => (
                          <li key={nIdx}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  KeyRound, 
  Copy, 
  Check, 
  HardDriveDownload, 
  X, 
  Sparkles, 
  AlertCircle, 
  ExternalLink,
  FileCheck2,
  GitBranch
} from 'lucide-react';
import { Project, ProjectVersion } from '../types';
import { useProjectThumbnail } from '../utils/thumbnailHelper';

interface DownloadPasswordDialogProps {
  project: Project | null;
  version?: ProjectVersion | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDownload: (project: Project, version?: ProjectVersion | null) => void;
}

export const DownloadPasswordDialog: React.FC<DownloadPasswordDialogProps> = ({
  project,
  version,
  isOpen,
  onClose,
  onConfirmDownload,
}) => {
  if (!isOpen || !project) return null;

  const [copied, setCopied] = useState(false);

  // Extract password from chosen version or project
  const password = version?.zipPassword || project.zipPassword || '123';
  const displayVersion = version?.version || project.version;
  const displayGameVersion = version?.gameVersion || project.gameVersion;
  const displayFileSize = version?.fileSize || project.fileSize;

  // Project thumbnail with YouTube -> Gallery image fallback
  const { 
    src: thumbnailSrc, 
    handleImageError, 
    handleImageLoad, 
    sourceType 
  } = useProjectThumbnail(project);

  const handleCopyPassword = () => {
    try {
      navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleProceedDownload = () => {
    // Also copy password automatically to make it effortless for user
    try {
      navigator.clipboard.writeText(password);
    } catch {
      // ignore clipboard error in restricted iframes
    }
    onConfirmDownload(project, version);
    onClose();
  };

  // Compile full requirements list
  const requiredMods = version?.requiredMods || project.requiredMods || [];
  const textRequirements = version?.requirements || project.requirements || [
    `Minecraft Platform: ${displayGameVersion || 'Java Edition'}`,
    ...(requiredMods.map(m => `${m.name} (${m.required !== false ? 'Required' : 'Optional'})`)),
    'Archive extractor with password support (7-Zip / WinRAR)',
  ];

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-emerald-950/40 space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Project Mini Card with YouTube/Gallery Thumbnail & Version Badge */}
        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
          <div className="relative w-20 h-14 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-700/60 shadow-md">
            <img
              src={thumbnailSrc}
              alt={project.title}
              onError={handleImageError}
              onLoad={handleImageLoad}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            {sourceType === 'youtube' && (
              <div className="absolute bottom-0.5 right-0.5 px-1 py-0.2 bg-red-600 rounded text-[8px] font-bold text-white uppercase tracking-wider">
                YT
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {project.category.replace('-', ' ')}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                <GitBranch className="w-3 h-3" />
                v{displayVersion}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                • {displayFileSize}
              </span>
            </div>
            <h3 className="text-base font-extrabold text-white truncate">
              {project.title}
            </h3>
            <p className="text-[11px] text-slate-400 truncate">
              By {project.author} • {displayGameVersion}
            </p>
          </div>
        </div>

        {/* Requirements Section */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-amber-500/15 text-amber-400">
                <AlertCircle className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Installation Requirements & Dependencies
              </h4>
            </div>
            <span className="text-[10px] font-mono text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              v{displayVersion}
            </span>
          </div>

          {/* Required Mods List */}
          {requiredMods.length > 0 ? (
            <div className="space-y-2">
              {requiredMods.map((mod, idx) => (
                <div 
                  key={idx}
                  className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">
                        {mod.name}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase ${
                        mod.required !== false 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {mod.required !== false ? 'Required' : 'Optional'}
                      </span>
                    </div>
                    {mod.description && (
                      <p className="text-[11px] text-slate-400 leading-tight line-clamp-2">
                        {mod.description}
                      </p>
                    )}
                    {mod.version && (
                      <span className="text-[10px] font-mono text-emerald-400 block">
                        Version: {mod.version}
                      </span>
                    )}
                  </div>

                  {mod.url && (
                    <a
                      href={mod.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/30 rounded-lg transition-colors cursor-pointer"
                    >
                      <span>Get Mod</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : null}

          {/* Requirement Bullet Points */}
          <div className="space-y-1.5 pt-1">
            {textRequirements.map((req, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{req}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Password Display Box */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Password For Unzipping is:
            </span>
            {copied && (
              <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" /> Copied!
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-900 border border-slate-700/80">
            <span className="font-mono text-xl sm:text-2xl font-black text-white tracking-widest pl-1 select-all">
              {password}
            </span>
            <button
              type="button"
              onClick={handleCopyPassword}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Enter <strong className="text-emerald-400 font-mono">{password}</strong> when extracting the downloaded <code className="text-slate-300">.zip</code> in WinRAR, 7-Zip, or your file extractor.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            id="confirm-download-after-password-btn"
            type="button"
            onClick={handleProceedDownload}
            className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/25 active:scale-98 cursor-pointer"
          >
            <HardDriveDownload className="w-4 h-4 stroke-[2.5]" />
            <span>Copy Password & Download v{displayVersion} (.zip)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-xs text-slate-400 hover:text-slate-300 transition-colors cursor-pointer text-center"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

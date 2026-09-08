import React, { useState } from 'react';
import { KeyRound, Copy, Check, HardDriveDownload, X, ShieldAlert, Sparkles } from 'lucide-react';
import { Project } from '../types';

interface DownloadPasswordDialogProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDownload: (project: Project) => void;
}

export const DownloadPasswordDialog: React.FC<DownloadPasswordDialogProps> = ({
  project,
  isOpen,
  onClose,
  onConfirmDownload,
}) => {
  if (!isOpen || !project) return null;

  const [copied, setCopied] = useState(false);

  // Extract password from project.zipPassword or fallback to default
  const password = project.zipPassword || '123';

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleProceedDownload = () => {
    // Also copy password automatically to make it effortless for user
    navigator.clipboard.writeText(password);
    onConfirmDownload(project);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-emerald-950/40 space-y-6 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Key Icon */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <KeyRound className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="pr-6">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 mb-1">
              Protected Archive
            </div>
            <h3 className="text-xl font-extrabold text-white tracking-tight">
              Unzip Password Required
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              The archive for <strong className="text-slate-200">{project.title}</strong> is encrypted with a password.
            </p>
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
            onClick={handleProceedDownload}
            className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/25 active:scale-98 cursor-pointer"
          >
            <HardDriveDownload className="w-4 h-4 stroke-[2.5]" />
            <span>Copy Password & Download (.zip)</span>
          </button>

          <button
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

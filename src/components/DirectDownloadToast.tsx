import React, { useEffect } from 'react';
import { HardDriveDownload, CheckCircle2, X, ExternalLink } from 'lucide-react';
import { Project } from '../types';

interface DirectDownloadToastProps {
  project: Project | null;
  downloadUrl: string | null;
  onClose: () => void;
}

export const DirectDownloadToast: React.FC<DirectDownloadToastProps> = ({
  project,
  downloadUrl,
  onClose,
}) => {
  if (!project) return null;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 6000);
    return () => clearTimeout(timer);
  }, [project, onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 duration-300">
      <div className="p-4 rounded-2xl bg-slate-900/95 border-2 border-emerald-500/80 shadow-2xl backdrop-blur-md text-white flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
          <HardDriveDownload className="w-5 h-5 animate-bounce" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Direct Download Triggered!</span>
            </h4>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-sm font-bold text-white truncate mt-1">
            {project.title}
          </p>

          <p className="text-xs text-slate-300 mt-0.5">
            Your browser is downloading the file directly from Google Drive ({project.fileSize}).
          </p>

          {downloadUrl && (
            <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Didn't start automatically?</span>
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 underline underline-offset-2"
              >
                <span>Click here</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

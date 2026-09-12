import React, { useState } from 'react';
import { ShieldAlert, Sparkles, Mail, ArrowRight, X, Infinity as InfinityIcon } from 'lucide-react';
import { GoogleUser } from './GoogleLoginGate';

interface GuestDownloadLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeWithEmail: (email: string) => void;
  onUpgradeWithGoogle: () => void;
}

export const GuestDownloadLimitModal: React.FC<GuestDownloadLimitModalProps> = ({
  isOpen,
  onClose,
  onUpgradeWithEmail,
  onUpgradeWithGoogle,
}) => {
  if (!isOpen) return null;

  const [email, setEmail] = useState('');
  const [showEmailField, setShowEmailField] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('@')) {
      onUpgradeWithEmail(email);
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl shadow-black/80 space-y-5 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mx-auto shadow-inner">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Guest Download Limit Reached
          </h2>
          <p className="text-xs text-slate-300">
            You have used all <span className="text-amber-400 font-bold">3 free guest downloads</span>. To unlock unlimited downloads across all versions and maps, sign in with Google or your Email.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs text-slate-300">
          <div className="flex items-center justify-between font-medium">
            <span>Guest Tier (Current)</span>
            <span className="text-amber-400 font-mono font-bold">0 / 3 remaining</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="w-full h-full bg-amber-500 rounded-full" />
          </div>
          <div className="flex items-center justify-between text-[11px] text-emerald-400 pt-1 font-semibold">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Member Access
            </span>
            <span className="flex items-center gap-1">
              <InfinityIcon className="w-3.5 h-3.5" /> Unlimited Downloads
            </span>
          </div>
        </div>

        {/* Upgrade options */}
        <div className="space-y-3">
          {/* Sign in with Google */}
          <button
            onClick={() => {
              onUpgradeWithGoogle();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm rounded-xl transition-all shadow-md shadow-black/30 active:scale-98 cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign in with Google (Unlimited)</span>
          </button>

          {/* Sign in with Email */}
          {!showEmailField ? (
            <button
              onClick={() => setShowEmailField(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all border border-slate-700 cursor-pointer"
            >
              <Mail className="w-4 h-4 text-emerald-400" />
              <span>Or Sign in with Email (Unlimited)</span>
            </button>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-2 pt-1">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!email.includes('@')}
                  className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Unlock</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </form>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-1 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer text-center"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

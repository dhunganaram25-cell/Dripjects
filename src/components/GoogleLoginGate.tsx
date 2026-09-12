/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle, 
  ExternalLink, 
  Mail,
  ArrowRight,
  UserCheck,
  Sparkles,
  Infinity as InfinityIcon
} from 'lucide-react';
import { DripjectsLogo } from './DripjectsLogo';

export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture: string;
  isGuest?: boolean;
}

interface GoogleLoginGateProps {
  onLoginSuccess: (user: GoogleUser) => void;
}

declare global {
  interface Window {
    google?: any;
  }
}

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export const GoogleLoginGate: React.FC<GoogleLoginGateProps> = ({
  onLoginSuccess,
}) => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Environment Google Client ID (kept strictly in env, never exposed or displayed in UI)
  const clientId: string = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';

  // Clean up any previously cached client IDs from localStorage for security
  useEffect(() => {
    try {
      localStorage.removeItem('dripjects_google_client_id');
    } catch {
      // ignore
    }
  }, []);

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Initialize Google Identity Services if client_id is provided in environment
  useEffect(() => {
    if (!clientId) return;

    let isMounted = true;
    const interval = setInterval(() => {
      if (window.google?.accounts?.id && isMounted) {
        clearInterval(interval);
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            auto_select: false,
            callback: (response: any) => {
              if (response.credential) {
                const payload = parseJwt(response.credential);
                if (payload) {
                  const user: GoogleUser = {
                    id: payload.sub || `google-${Date.now()}`,
                    name: payload.name || payload.email.split('@')[0],
                    email: payload.email,
                    picture: payload.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(payload.email)}`,
                    isGuest: false,
                  };
                  localStorage.setItem('dripjects_google_user', JSON.stringify(user));
                  onLoginSuccess(user);
                }
              }
            },
          });

          if (googleBtnRef.current) {
            window.google.accounts.id.renderButton(googleBtnRef.current, {
              theme: 'filled_blue',
              size: 'large',
              text: 'signin_with',
              shape: 'rectangular',
              width: 300,
            });
          }
        } catch (err: any) {
          console.warn('Google GSI notice:', err);
        }
      }
    }, 250);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [clientId, onLoginSuccess]);

  // Google OAuth flow (Unlimited downloads)
  const handleRealGoogleOAuth = async () => {
    setErrorMessage(null);

    if (!clientId) {
      setShowEmailInput(true);
      return;
    }

    setIsSigningIn(true);

    if (window.google?.accounts?.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'email profile openid',
          error_callback: (error: any) => {
            setIsSigningIn(false);
            console.warn('OAuth popup notice:', error);
            setErrorMessage(
              'Google sign-in was closed or cancelled. You can continue as guest or sign in with email.'
            );
          },
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              setIsSigningIn(false);
              setErrorMessage('Google authorization was cancelled.');
              return;
            }

            if (tokenResponse.access_token) {
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const data = await res.json();
                const user: GoogleUser = {
                  id: data.sub || `google-${Date.now()}`,
                  name: data.name || data.email.split('@')[0],
                  email: data.email,
                  picture: data.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.email)}`,
                  isGuest: false,
                };
                localStorage.setItem('dripjects_google_user', JSON.stringify(user));
                onLoginSuccess(user);
              } catch {
                setErrorMessage('Failed to retrieve user profile.');
              }
            }
            setIsSigningIn(false);
          },
        });

        client.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err: any) {
        console.error('Google OAuth init failed:', err);
        setIsSigningIn(false);
        setErrorMessage('Google popup was blocked. Continue as guest or sign in below.');
        return;
      }
    }

    setIsSigningIn(false);
    setShowEmailInput(true);
  };

  // Guest Login (3 Download Limit)
  const handleGuestLogin = () => {
    setIsSigningIn(true);
    setTimeout(() => {
      const guestUser: GoogleUser = {
        id: `guest-${Date.now()}`,
        name: 'Guest Explorer',
        email: 'guest@dripjects.local',
        picture: 'https://api.dicebear.com/7.x/bottts/svg?seed=Guest',
        isGuest: true,
      };
      
      // Initialize guest download counter if not already tracked
      if (localStorage.getItem('dripjects_guest_downloads_remaining') === null) {
        localStorage.setItem('dripjects_guest_downloads_remaining', '3');
      }

      localStorage.setItem('dripjects_google_user', JSON.stringify(guestUser));
      onLoginSuccess(guestUser);
      setIsSigningIn(false);
    }, 200);
  };

  // Email Login (Unlimited Downloads)
  const handleCustomEmailLogin = (emailToUse: string) => {
    const email = emailToUse.trim();
    if (!email || !email.includes('@')) return;

    setIsSigningIn(true);
    setTimeout(() => {
      const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const user: GoogleUser = {
        id: `user-${Date.now()}`,
        name: name,
        email: email,
        picture: `https://lh3.googleusercontent.com/a/default-user=s96-c`,
        isGuest: false,
      };
      localStorage.setItem('dripjects_google_user', JSON.stringify(user));
      onLoginSuccess(user);
      setIsSigningIn(false);
    }, 250);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <DripjectsLogo size="md" />

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Authentication Required</span>
          </div>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5">
          {/* Header Icon & Title */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-1">
              <DripjectsLogo size="lg" showText={false} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Sign In to Dripjects
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Access community Minecraft creations, versions archive, and direct downloads.
              </p>
            </div>
          </div>

          {/* Iframe Notice if previewing inside embedded frame */}
          {isInIframe && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-emerald-400">Testing in Preview?</span>
                <a
                  href={currentOrigin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                >
                  <span>Open in Tab</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-[11px] text-slate-400">
                Browsers restrict Google popups inside embedded frames. Open in a tab or continue as Guest.
              </p>
            </div>
          )}

          {/* Notice banner if Google OAuth was cancelled or error */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Official Google GSI Rendered Button if Client ID exists */}
          {clientId && (
            <div className="flex justify-center" ref={googleBtnRef} />
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Primary Google Login Button */}
            <button
              id="google-signin-btn"
              onClick={handleRealGoogleOAuth}
              disabled={isSigningIn}
              className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm rounded-xl transition-all shadow-md shadow-black/30 active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              <div className="flex items-center gap-3">
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
                <span>{isSigningIn ? 'Connecting...' : 'Sign in with Google'}</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <InfinityIcon className="w-3 h-3" />
                <span>Unlimited</span>
              </span>
            </button>

            {/* Guest Login Button (Replacing previous email toggle button) */}
            <button
              id="guest-login-btn"
              onClick={handleGuestLogin}
              disabled={isSigningIn}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/90 hover:bg-slate-700 text-slate-100 font-bold text-sm rounded-xl transition-all border border-slate-700/80 hover:border-emerald-500/40 active:scale-98 disabled:opacity-50 cursor-pointer shadow"
            >
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>Continue as Guest</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-full">
                3 Downloads Limit
              </span>
            </button>
          </div>

          {/* Email Login (For unlimited downloads with custom email) */}
          {!showEmailInput ? (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setShowEmailInput(true)}
                className="text-xs text-slate-400 hover:text-emerald-400 transition-colors py-1 cursor-pointer inline-flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Sign in with Email for Unlimited Downloads</span>
              </button>
            </div>
          ) : (
            <div className="pt-2 space-y-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Enter email address:</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <InfinityIcon className="w-2.5 h-2.5" />
                  Unlimited Downloads
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customEmail.includes('@')) {
                      handleCustomEmailLogin(customEmail);
                    }
                  }}
                  placeholder="name@example.com"
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
                <button
                  onClick={() => handleCustomEmailLogin(customEmail)}
                  disabled={!customEmail.includes('@')}
                  className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Access policies summary */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2 text-[11px] text-slate-400">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Guest Access:</span>
              </div>
              <span className="text-slate-300 font-medium">3 downloads limit</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Google or Email Member:</span>
              </div>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <InfinityIcon className="w-3 h-3" />
                Unlimited downloads
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/60 py-4 px-6 text-center text-xs text-slate-400">
        <span>Dripjects &copy; {new Date().getFullYear()} • Public Creations Vault</span>
      </footer>
    </div>
  );
};

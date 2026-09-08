import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Sparkles, 
  Download, 
  CheckCircle, 
  Settings, 
  ExternalLink, 
  Copy,
  Check,
  User,
  ArrowRight
} from 'lucide-react';

export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture: string;
}

interface GoogleLoginGateProps {
  onLoginSuccess: (user: GoogleUser) => void;
}

declare global {
  interface Window {
    google?: any;
  }
}

const DEFAULT_CLIENT_ID = '918138094861-7lpuo2q220i8194okdu6iadh47ntano8.apps.googleusercontent.com';

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
  const [showConfig, setShowConfig] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedOrigin, setCopiedOrigin] = useState(false);

  // Origin info
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  // Stored or environment Google Client ID
  const [clientId, setClientId] = useState<string>(() => {
    return (
      (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
      localStorage.getItem('dripjects_google_client_id') ||
      DEFAULT_CLIENT_ID
    );
  });

  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Initialize Google Identity Services if available and client_id is set
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
          console.warn('Google GSI init notice:', err);
        }
      }
    }, 250);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [clientId, onLoginSuccess]);

  // Real Google OAuth2 popup flow using Google Identity Services token client
  const handleRealGoogleOAuth = async () => {
    setErrorMessage(null);
    setIsSigningIn(true);

    if (clientId && window.google?.accounts?.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'email profile openid',
          error_callback: (error: any) => {
            setIsSigningIn(false);
            console.warn('OAuth popup callback:', error);
            setErrorMessage(
              'Google popup closed or origin pending in Google Cloud Console. You can enter with email or continue below.'
            );
          },
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              setIsSigningIn(false);
              setErrorMessage('Google authorization was cancelled or origin pending in Google Console.');
              return;
            }

            if (tokenResponse.access_token) {
              try {
                // Fetch verified profile from Google's userinfo API
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const data = await res.json();
                const user: GoogleUser = {
                  id: data.sub || `google-${Date.now()}`,
                  name: data.name || data.email.split('@')[0],
                  email: data.email,
                  picture: data.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.email)}`,
                };
                localStorage.setItem('dripjects_google_user', JSON.stringify(user));
                onLoginSuccess(user);
              } catch {
                setErrorMessage('Failed to fetch profile from Google.');
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
        setErrorMessage('Google popup was blocked by browser. You can sign in directly below.');
        return;
      }
    }

    setIsSigningIn(false);
    setErrorMessage('Google Identity client is loading. Please try again in a moment or enter below.');
  };

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
      };
      localStorage.setItem('dripjects_google_user', JSON.stringify(user));
      onLoginSuccess(user);
      setIsSigningIn(false);
    }, 300);
  };

  const handleSaveClientId = (newId: string) => {
    setClientId(newId.trim());
    localStorage.setItem('dripjects_google_client_id', newId.trim());
    setShowConfig(false);
    setErrorMessage(null);
  };

  const handleCopyOrigin = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(currentOrigin);
      setCopiedOrigin(true);
      setTimeout(() => setCopiedOrigin(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 shadow-md shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white font-['Space_Grotesk',sans-serif]">
                DRIP<span className="text-emerald-400">JECTS</span>
              </span>
              <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                Public Vault
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1.5"
              title="OAuth Settings"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">OAuth Settings</span>
            </button>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Authentication Required</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5">
          {/* Header Icon */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Sign In to Dripjects
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Log in to access community Minecraft creations and direct downloads.
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
                Browsers restrict Google popups inside embedded frames. Open in a tab or continue below.
              </p>
            </div>
          )}

          {/* Notice banner if Google OAuth was cancelled or error */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Official Google GSI Rendered Button */}
          <div className="flex justify-center" ref={googleBtnRef} />

          {/* Action Buttons */}
          <div className="space-y-2.5">
            {/* Primary Google Login Button */}
            <button
              id="google-signin-btn"
              onClick={handleRealGoogleOAuth}
              disabled={isSigningIn}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm rounded-xl transition-all shadow-md shadow-black/30 active:scale-98 disabled:opacity-50 cursor-pointer"
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
              <span>{isSigningIn ? 'Connecting to Google...' : 'Sign in with Google'}</span>
            </button>
          </div>

          {/* Email input toggle */}
          {!showEmailInput ? (
            <button
              type="button"
              onClick={() => setShowEmailInput(true)}
              className="w-full text-center text-xs text-slate-400 hover:text-slate-200 transition-colors py-0.5 cursor-pointer block"
            >
              Or enter your email address
            </button>
          ) : (
            <div className="pt-2 space-y-2 border-t border-slate-800">
              <label className="text-[11px] text-slate-400 block">
                Enter your email address:
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => handleCustomEmailLogin(customEmail)}
                  disabled={!customEmail.includes('@')}
                  className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Enter
                </button>
              </div>
            </div>
          )}

          {/* Config Drawer for Google Cloud Console */}
          {showConfig && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-700/80 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                <span>Google Cloud Console Settings</span>
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                >
                  <span>Console</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Origin for this app:
                </label>
                <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-400">
                  <span className="truncate">{currentOrigin}</span>
                  <button
                    onClick={handleCopyOrigin}
                    className="p-1 text-slate-300 hover:text-white shrink-0 cursor-pointer"
                    title="Copy Origin"
                  >
                    {copiedOrigin ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  Tip: In Google Cloud Console, enter <code className="text-emerald-400">https://dripjects.vercel.app</code> without a trailing slash.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Client ID:
                </label>
                <input
                  type="text"
                  defaultValue={clientId}
                  id="oauth-client-id-input"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowConfig(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('oauth-client-id-input') as HTMLInputElement;
                    if (input) handleSaveClientId(input.value);
                  }}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {/* Footer Features */}
          <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Google Identity Services 2.0 Integration</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Zero credentials stored on servers</span>
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

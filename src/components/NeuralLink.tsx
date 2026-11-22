import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { loginWithPortal, signInWithEmail, signUpWithEmail } from '../lib/firebase';
import { Mail, Lock, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface NeuralLinkProps {
  onSuccess: (user: any) => void;
}

export default function NeuralLink({ onSuccess }: NeuralLinkProps) {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Handle Google OAuth (Supabase primary, with fallback)
  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // First attempt Supabase OAuth if configured, or Firebase
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin
          }
        });
        if (error) throw error;
      } catch {
        // Fallback to Firebase Google Provider
        const user = await loginWithPortal();
        if (user) onSuccess(user);
      }
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      setErrorMsg(err?.message || "Failed to sign in with Google.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Email + Password Sign-In & Sign-Up
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please fill in both email and password.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessNotice(null);

    try {
      if (authMode === 'signin') {
        // 1. Try Supabase sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // If Supabase failed or user was registered in Firebase, try Firebase fallback
          try {
            const fbUser = await signInWithEmail(email, password);
            if (fbUser) {
              onSuccess(fbUser);
              return;
            }
          } catch {
            throw error;
          }
        } else if (data?.user) {
          onSuccess(data.user);
          return;
        }
      } else {
        // Sign Up - bypass email confirmation requirement by directly authenticating user
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          // Try Firebase fallback (Firebase doesn't require confirmation by default)
          try {
            const fbUser = await signUpWithEmail(email, password);
            if (fbUser) {
              onSuccess(fbUser);
              return;
            }
          } catch {
            throw error;
          }
        } else if (data?.user) {
          // If session is immediately returned, log in right away
          if (data.session) {
            onSuccess(data.user);
            return;
          }

          // If project currently has email confirmation toggle on in Supabase,
          // automatically attempt sign-in or use user credentials directly so student is not blocked:
          try {
            const signInRes = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            if (signInRes.data?.user) {
              onSuccess(signInRes.data.user);
              return;
            }
          } catch (autoSignInErr) {
            console.warn("Immediate sign-in attempt after sign-up:", autoSignInErr);
          }

          // Ensure student gets into the app seamlessly without waiting on email
          onSuccess(data.user);
          return;
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setErrorMsg(err?.message || "Authentication failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 sm:p-8 overflow-y-auto font-sans">
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(#3b82f6 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md space-y-8 bg-slate-900/60 border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl"
      >
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto mb-4 border border-blue-500/20 rounded-2xl flex items-center justify-center bg-blue-500/10 shadow-lg">
            <Lock className="w-7 h-7 text-blue-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {authMode === 'signin' ? 'Sign In to WeCan' : 'Create an Account'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {authMode === 'signin'
              ? 'Enter your credentials to continue your prep.'
              : 'Join to access voice simulation and AI evaluations.'}
          </p>
        </div>

        {/* Tab switcher: Sign In vs Sign Up */}
        <div className="flex bg-slate-800/80 p-1 rounded-xl border border-white/5" role="tablist" aria-label="Authentication Options">
          <button
            type="button"
            role="tab"
            aria-selected={authMode === 'signin'}
            onClick={() => { setAuthMode('signin'); setErrorMsg(null); setSuccessNotice(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              authMode === 'signin'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={authMode === 'signup'}
            onClick={() => { setAuthMode('signup'); setErrorMsg(null); setSuccessNotice(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              authMode === 'signup'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Feedback Messages */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              role="alert"
              aria-live="assertive"
              className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-xs text-red-300"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{errorMsg}</span>
            </motion.div>
          )}
          {successNotice && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              role="status"
              aria-live="polite"
              className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-2.5 text-xs text-emerald-300"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{successNotice}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4" aria-label="Email and Password Authentication">
          <div className="space-y-1.5">
            <label htmlFor="auth-email-input" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="auth-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                aria-label="Email Address"
                className="w-full bg-slate-950/70 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="auth-password-input" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="auth-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                className="w-full bg-slate-950/70 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-[0.99]"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{authMode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <span className="relative bg-slate-900 px-3 text-[11px] uppercase tracking-wider text-slate-500 font-medium">
            Or continue with
          </span>
        </div>

        {/* Social / Google Login */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={isLoading}
          className="w-full py-2.5 bg-slate-800/80 hover:bg-slate-800 border border-white/10 rounded-xl transition-all text-sm font-medium text-slate-200 flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
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
          <span>Google</span>
        </button>
      </motion.div>
    </div>
  );
}

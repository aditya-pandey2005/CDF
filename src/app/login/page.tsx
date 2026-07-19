'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/classroom';
  const urlError = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const errorCode = searchParams.get('error_code');

  // Build a user-friendly error message from URL params
  const getInitialError = (): string | null => {
    if (errorCode === 'otp_expired') {
      return 'Your magic link has expired. Please request a new one.';
    }
    if (errorDescription) {
      return errorDescription;
    }
    if (urlError === 'auth-code-error') {
      return 'Authentication failed. Please try again.';
    }
    return null;
  };

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(getInitialError());

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const origin = window.location.origin;

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
        },
      });

      if (otpError) {
        setError(otpError.message || 'Failed to send magic link.');
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      const msg = err?.message || (typeof err === 'string' ? err : 'An unexpected error occurred');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const callbackUrl = `${origin}/auth/callback${nextUrl ? `?next=${encodeURIComponent(nextUrl)}` : ''}`;
      
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
        },
      });

      if (authError) {
        setError(authError.message);
        setGoogleLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initiate Google sign-in');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900 font-sans">
      {/* Left Panel: Desktop Only */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-500 p-16 flex-col justify-between text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-blue-500/30 blur-3xl" />
        
        {/* Brand Name & Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-md border border-white/25 shadow-sm">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
          </div>
          <span className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">SikshaMitra</span>
        </div>

        {/* Main Content & Features */}
        <div className="space-y-12 relative z-10 my-auto max-w-xl">
          <h2 className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight drop-shadow-sm">
            Join thousands of Teachers that Trust SikshaMitra to Supercharge their Classrooms
          </h2>
          
          <ul className="space-y-5">
            <li className="flex items-center gap-4 text-lg text-white/90">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-400/20 text-cyan-200 font-bold border border-cyan-400/30 shadow-[0_0_12px_rgba(34,211,238,0.3)] shrink-0">
                ✓
              </span>
              <span>Hinglish Explanations</span>
            </li>
            <li className="flex items-center gap-4 text-lg text-white/90">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-400/20 text-cyan-200 font-bold border border-cyan-400/30 shadow-[0_0_12px_rgba(34,211,238,0.3)] shrink-0">
                ✓
              </span>
              <span>Mermaid Diagramming</span>
            </li>
            <li className="flex items-center gap-4 text-lg text-white/90">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-400/20 text-cyan-200 font-bold border border-cyan-400/30 shadow-[0_0_12px_rgba(34,211,238,0.3)] shrink-0">
                ✓
              </span>
              <span>Interactive MCQ Quizzes</span>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="text-sm text-white/60 relative z-10">
          © {new Date().getFullYear()} SikshaMitra. Connecting Dreams Foundation.
        </div>
      </div>

      {/* Right Panel: Form Container */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative min-h-screen">
        {/* Main Card */}
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-xl p-8 relative overflow-hidden transition-all duration-300">
          
          {/*Platform Fee Diagonal Ribbon: "100% Free" */}
          <div className="absolute top-0 right-0 overflow-hidden w-24 h-24">
            <div className="absolute top-4 -right-8 w-28 bg-emerald-500 text-white text-[10px] font-extrabold py-1 text-center rotate-45 shadow-sm uppercase tracking-wider">
              100% Free
            </div>
          </div>

          {success ? (
            /* Success State */
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                We sent a secure Magic Login Link to <strong className="text-gray-800">{email}</strong>. 
                Please click the link in your email to sign in instantly.
              </p>
              <button 
                onClick={() => setSuccess(false)}
                className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors"
              >
                ← Back to sign in
              </button>
            </div>
          ) : (
            /* Normal Sign-In State */
            <>
              {/* Header */}
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 border border-blue-100 shadow-inner">
                  <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" x2="12" y1="19" y2="22" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome to SikshaMitra</h1>
                <p className="text-gray-500 text-sm mt-1">Get started with your email</p>
              </div>

              {/* Error Box */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 flex items-start gap-2 shadow-sm">
                  <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Email Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="name@school.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading || googleLoading}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 bg-white transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none disabled:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md shadow-blue-600/10 hover:shadow-blue-600/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {loading && (
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  Continue
                </button>
              </form>

              {/* Separator */}
              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-gray-200"></div>
                <span className="px-3 text-xs text-gray-400 uppercase tracking-wider">or</span>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>

              {/* Google Sign-in */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading || googleLoading}
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-xl shadow-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
              >
                {googleLoading ? (
                  <svg className="animate-spin h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                )}
                Continue with Google
              </button>

              {/* Legal Disclaimer */}
              <p className="mt-8 text-center text-xs text-gray-400 leading-relaxed">
                By continuing you agree to our{' '}
                <a href="/privacy" className="underline hover:text-gray-500">privacy policy</a>
                {' '}&{' '}
                <a href="/terms" className="underline hover:text-gray-500">terms of use</a>.
              </p>
            </>
          )}
        </div>

        {/* Bottom Helper Box */}
        <div className="w-full max-w-md mt-6">
          <a
            href="/guide"
            className="flex items-center justify-between bg-blue-50/50 border border-blue-100 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 rounded-xl p-4 text-sm text-blue-800 shadow-sm"
          >
            <span className="font-medium">New to AI Teaching? Read the Teacher Guide</span>
            <span className="font-bold text-blue-600 ml-2">→</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

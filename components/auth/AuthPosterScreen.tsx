'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShieldCheck, Zap, Lock, Mail, User, AlertCircle } from 'lucide-react';
import { sound } from '@/lib/sound';
import { WantedPosterIntro } from './WantedPosterIntro';

interface AuthPosterScreenProps {
  initialTab?: 'login' | 'signup';
}

function AuthPosterContent({ initialTab = 'login' }: AuthPosterScreenProps) {
  const searchParams = useSearchParams();
  const isExpiredNotice = searchParams.get('expired') === 'true';
  const returnUrl = searchParams.get('returnUrl') || '/';

  const [showIntro, setShowIntro] = useState(true);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(initialTab);

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);

  // Signup Form States
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupLoading, setSignupLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSeenIntro = sessionStorage.getItem('dh_auth_intro_seen');
      if (hasSeenIntro) {
        setShowIntro(false);
      }
    }
  }, []);

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    sound.playPop();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.error || 'Login failed. Please check credentials.');
        setLoginLoading(false);
        return;
      }

      setAccessGranted(true);
      sound.playLevelUp();
      setTimeout(() => {
        window.location.href = returnUrl;
      }, 600);
    } catch {
      setLoginError('Network error. Please try again.');
      setLoginLoading(false);
    }
  };

  // Handle Signup
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);

    if (signupPassword.length < 6) {
      setSignupError('Password must be at least 6 characters.');
      return;
    }

    setSignupLoading(true);
    sound.playPop();

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: signupName, email: signupEmail, password: signupPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSignupError(data.error || 'Registration failed.');
        setSignupLoading(false);
        return;
      }

      setRegistered(true);
      sound.playLevelUp();
      setTimeout(() => {
        window.location.href = returnUrl;
      }, 600);
    } catch {
      setSignupError('Network error. Please try again.');
      setSignupLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center flex items-center justify-center p-4 relative overflow-hidden select-none"
      style={{ backgroundImage: "url('/images/bg-night-city.jpg')" }}
    >
      
      {/* Translucent Dark Overlay so Night City background is clearly visible */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      {/* Cinematic Intro Animation Overlay */}
      {showIntro ? (
        <WantedPosterIntro onComplete={() => setShowIntro(false)} />
      ) : (
        /* MAIN REVEALED AUTHENTICATION WANTED POSTER */
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 18 }}
          className="w-full max-w-md relative z-10"
        >
          {/* SUCCESS OVERLAY (ACCESS GRANTED / REGISTERED) */}
          {accessGranted || registered ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#FFD83D] comic-border-lg shadow-comic-lg p-8 text-center space-y-4 border-4 border-black"
            >
              <div className="comic-sticker comic-sticker-red text-sm font-black animate-bounce mx-auto">
                POW! ACCESS GRANTED!
              </div>
              <h2 className="font-black text-3xl uppercase">WELCOME HERO!</h2>
              <p className="font-mono text-xs font-bold text-gray-900">
                Initializing your personalized PERSONAL HUB dashboard...
              </p>
            </motion.div>
          ) : (
            /* WANTED POSTER INTERFACE */
            <div className="bg-[#FFFDF5] comic-border-lg shadow-comic-lg p-6 sm:p-8 w-full border-4 border-black space-y-5 relative">
              
              {/* Tape Corners */}
              <div className="absolute -top-3 -left-3 w-10 h-6 bg-[#FFD83D]/90 border-2 border-black rotate-[-15deg] shadow-comic-sm" />
              <div className="absolute -top-3 -right-3 w-10 h-6 bg-[#FFD83D]/90 border-2 border-black rotate-[15deg] shadow-comic-sm" />

              {/* SESSION EXPIRED NOTICE BANNER */}
              {isExpiredNotice && (
                <div className="bg-[#FF5A5F] text-white comic-border-sm p-3 font-mono text-xs font-black flex items-center gap-2 shadow-comic-sm animate-pulse">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Your session expired after 30 minutes of inactivity. Please log in again to continue.</span>
                </div>
              )}

              {/* WANTED POSTER HEADER */}
              <div className="text-center border-b-4 border-black pb-4 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono font-black text-gray-700">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-[#FF5A5F]" />
                    <span>DEION HUB GATEWAY</span>
                  </span>
                  <span>ISSUE #2026</span>
                </div>
                <h1 className="font-black text-4xl sm:text-5xl uppercase tracking-tighter text-black mt-1">
                  WELCOME TO THE HUB
                </h1>
                <p className="font-mono text-xs font-bold text-gray-800">
                  Select your action to authenticate into hero headquarters
                </p>
              </div>

              {/* TWO PRIMARY CHOICE TABS: LOGIN & CREATE ACCOUNT */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-black comic-border-sm">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    sound.playPop();
                  }}
                  className={`py-2.5 px-2 font-black text-xs uppercase tracking-wider transition-all ${
                    activeTab === 'login'
                      ? 'bg-[#FFD83D] text-black shadow-comic-sm'
                      : 'bg-black text-white hover:text-[#FFD83D]'
                  }`}
                >
                  ENTER THE HUB
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signup');
                    sound.playPop();
                  }}
                  className={`py-2.5 px-2 font-black text-xs uppercase tracking-wider transition-all ${
                    activeTab === 'signup'
                      ? 'bg-[#FF5A5F] text-white shadow-comic-sm'
                      : 'bg-black text-white hover:text-[#FF5A5F]'
                  }`}
                >
                  CREATE IDENTITY
                </button>
              </div>

              {/* FORM CONTENT WITH COMIC PANEL TRANSITION */}
              <AnimatePresence mode="wait">
                {activeTab === 'login' ? (
                  <motion.div
                    key="login-panel"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {loginError && (
                      <div className="bg-red-100 comic-border-sm p-3 text-xs font-black text-red-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{loginError}</span>
                      </div>
                    )}

                    <form onSubmit={handleLoginSubmit} className="space-y-3">
                      <div>
                        <label className="block text-xs font-black mb-1 uppercase flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-black" />
                          <span>EMAIL ADDRESS</span>
                        </label>
                        <input
                          type="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="hero@example.com"
                          required
                          className="comic-input w-full text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black mb-1 uppercase flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5 text-black" />
                            <span>PASSWORD</span>
                          </span>
                          <span className="text-[10px] font-mono text-gray-600 hover:underline cursor-pointer">
                            Forgot password?
                          </span>
                        </label>
                        <input
                          type="password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="comic-input w-full text-xs font-bold"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loginLoading}
                        className="btn-comic btn-comic-yellow w-full py-3 text-xs flex items-center justify-center gap-2 font-black uppercase mt-2 shadow-comic-sm"
                      >
                        <span>{loginLoading ? 'AUTHENTICATING...' : 'ENTER THE HUB'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="signup-panel"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {signupError && (
                      <div className="bg-red-100 comic-border-sm p-3 text-xs font-black text-red-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{signupError}</span>
                      </div>
                    )}

                    <form onSubmit={handleSignupSubmit} className="space-y-3">
                      <div>
                        <label className="block text-xs font-black mb-1 uppercase flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-black" />
                          <span>HERO NAME</span>
                        </label>
                        <input
                          type="text"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          placeholder="e.g. Daniel Bernard"
                          required
                          className="comic-input w-full text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black mb-1 uppercase flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-black" />
                          <span>EMAIL ADDRESS</span>
                        </label>
                        <input
                          type="email"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          placeholder="hero@example.com"
                          required
                          className="comic-input w-full text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black mb-1 uppercase flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5 text-black" />
                          <span>CREATE PASSWORD</span>
                        </label>
                        <input
                          type="password"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          required
                          className="comic-input w-full text-xs font-bold"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={signupLoading}
                        className="btn-comic btn-comic-red w-full py-3 text-xs flex items-center justify-center gap-2 font-black uppercase mt-2 shadow-comic-sm"
                      >
                        <span>{signupLoading ? 'REGISTERING...' : 'CREATE YOUR IDENTITY'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* POSTER FOOTER */}
              <div className="pt-3 border-t-2 border-dashed border-black/30 text-center text-[11px] font-mono font-bold text-gray-700">
                <span className="flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                  <span>SECURE ENCRYPTED JWT AUTHENTICATION</span>
                </span>
              </div>

            </div>
          )}
        </motion.div>
      )}

    </div>
  );
}

export function AuthPosterScreen(props: AuthPosterScreenProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#121212]" />}>
      <AuthPosterContent {...props} />
    </Suspense>
  );
}

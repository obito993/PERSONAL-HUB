'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Zap, Lock, Mail, AlertCircle } from 'lucide-react';
import { sound } from '@/lib/sound';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    sound.playPop();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed. Please check credentials.');
        setLoading(false);
        return;
      }

      setAccessGranted(true);
      sound.playLevelUp();
      setTimeout(() => {
        window.location.href = '/';
      }, 600);
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      
      {/* Access Granted Overlay Animation */}
      {accessGranted ? (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#FFD83D] comic-border-lg shadow-comic-lg p-12 text-center space-y-4 max-w-md w-full"
        >
          <div className="comic-sticker comic-sticker-red text-base font-black animate-bounce mx-auto">
            POW! ACCESS GRANTED!
          </div>
          <h2 className="font-black text-4xl uppercase">WELCOME BACK HERO!</h2>
          <p className="font-mono text-xs font-bold text-gray-800">
            Initializing your personalized PERSONAL HUB dashboard...
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="bg-white comic-border-lg shadow-comic-lg p-6 sm:p-10 max-w-md w-full space-y-6 relative overflow-hidden"
        >
          {/* Top Brand Sticker */}
          <div className="flex items-center justify-between border-b-3 border-black pb-3">
            <div className="bg-[#FFD83D] comic-border-sm px-3 py-1 font-black text-base flex items-center gap-1.5">
              <Zap className="w-5 h-5" />
              <span>PERSONAL HUB AUTH</span>
            </div>
            <span className="comic-sticker comic-sticker-red text-[10px]">
              AUTHENTICATION
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="font-black text-3xl uppercase tracking-tight">WELCOME BACK!</h1>
            {/* Speech Bubble */}
            <div className="speech-bubble text-xs font-extrabold bg-[#FFFDF5] inline-block">
              &quot;Enter your credentials to access your hero workspace!&quot;
            </div>
          </div>

          {error && (
            <div className="bg-red-100 comic-border-sm p-3 text-xs font-black text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-black mb-1 uppercase flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                <span>EMAIL ADDRESS</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hero@example.com"
                required
                className="comic-input w-full text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-black mb-1 uppercase flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                <span>PASSWORD</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="comic-input w-full text-sm font-bold"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-comic btn-comic-yellow w-full py-3 text-sm flex items-center justify-center gap-2 font-black"
            >
              <span>{loading ? 'AUTHENTICATING...' : 'ENTER THE HUB'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t-2 border-dashed border-black/30 text-center text-xs font-bold space-y-2">
            <div>
              Don&apos;t have an account yet?{' '}
              <Link href="/signup" className="text-[#FF5A5F] hover:underline font-black">
                CREATE ACCOUNT
              </Link>
            </div>
          </div>
        </motion.div>
      )}

    </div>
  );
}

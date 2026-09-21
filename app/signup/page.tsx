'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, User, Mail, Lock, AlertCircle, Check } from 'lucide-react';
import { sound } from '@/lib/sound';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    sound.playPop();

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed.');
        setLoading(false);
        return;
      }

      setRegistered(true);
      sound.playLevelUp();
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 1200);
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      
      {registered ? (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#B9A7FF] comic-border-lg shadow-comic-lg p-12 text-center space-y-4 max-w-md w-full"
        >
          <div className="comic-sticker comic-sticker-yellow text-base font-black animate-bounce mx-auto">
            ★ HERO CREATED! ★
          </div>
          <h2 className="font-black text-4xl uppercase">WELCOME, {name.toUpperCase()}!</h2>
          <p className="font-mono text-xs font-bold text-black">
            Setting up your personal digital toolbox workspace...
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="bg-white comic-border-lg shadow-comic-lg p-6 sm:p-10 max-w-md w-full space-y-6 relative"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between border-b-3 border-black pb-3">
            <div className="bg-[#FF5A5F] text-white comic-border-sm px-3 py-1 font-black text-base flex items-center gap-1.5">
              <Zap className="w-5 h-5 fill-white" />
              <span>JOIN PERSONAL HUB</span>
            </div>
            <span className="comic-sticker comic-sticker-yellow text-[10px]">
              REGISTRATION
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="font-black text-3xl uppercase tracking-tight">CREATE ACCOUNT</h1>
            <div className="speech-bubble text-xs font-extrabold bg-[#FFFDF5] inline-block">
              &quot;Join the platform to save notes, track career missions, and earn XP!&quot;
            </div>
          </div>

          {error && (
            <div className="bg-red-100 comic-border-sm p-3 text-xs font-black text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-black mb-1 uppercase flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                <span>FULL NAME</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Hero Name"
                required
                className="comic-input w-full text-sm font-bold"
              />
            </div>

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
                placeholder="Min 6 characters"
                required
                className="comic-input w-full text-sm font-bold"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-comic btn-comic-purple w-full py-3 text-sm flex items-center justify-center gap-2 font-black"
            >
              <span>{loading ? 'CREATING ACCOUNT...' : 'JOIN THE HEROES'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t-2 border-dashed border-black/30 text-center text-xs font-bold">
            Already have an account?{' '}
            <Link href="/login" className="text-[#FF5A5F] hover:underline font-black">
              LOG IN
            </Link>
          </div>
        </motion.div>
      )}

    </div>
  );
}

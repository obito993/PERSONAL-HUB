'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Trophy, Flame, LogOut, Briefcase, GraduationCap, Code, Shield } from 'lucide-react';
import { sound } from '@/lib/sound';

interface UserProfileData {
  id: string;
  name: string;
  email: string;
  xp: number;
  level: number;
  streak: number;
  createdAt: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          router.push('/login');
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    sound.playPop();
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="p-12 text-center font-black text-xl">
        ⚡ LOADING HERO PROFILE...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Header Profile Panel */}
      <div className="bg-white comic-border-lg p-6 sm:p-8 shadow-comic flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#FFD83D] comic-border-lg flex items-center justify-center font-black text-2xl shadow-comic-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="comic-sticker comic-sticker-yellow text-[10px]">
                HERO PROFILE
              </span>
              <span className="text-xs font-mono font-bold bg-[#B9A7FF] comic-border-sm px-2 py-0.5">
                LVL {user.level}
              </span>
            </div>
            <h1 className="font-black text-2xl sm:text-4xl uppercase">{user.name}</h1>
            <div className="font-mono text-xs text-gray-600 font-bold">{user.email}</div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="btn-comic btn-comic-red px-4 py-2 text-xs flex items-center gap-1.5"
        >
          <LogOut className="w-4 h-4" />
          <span>LOGOUT</span>
        </button>
      </div>

      {/* User Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono font-bold">
        <div className="comic-card-yellow p-5 space-y-1">
          <div className="text-xs font-sans font-black uppercase text-gray-800 flex items-center gap-1">
            <Trophy className="w-4 h-4 text-[#FF5A5F]" />
            <span>TOTAL XP</span>
          </div>
          <div className="text-3xl font-black">{user.xp.toLocaleString()} XP</div>
        </div>

        <div className="comic-card-purple p-5 space-y-1">
          <div className="text-xs font-sans font-black uppercase text-gray-800 flex items-center gap-1">
            <Flame className="w-4 h-4 text-[#FF5A5F] fill-[#FF5A5F]" />
            <span>ACTIVE STREAK</span>
          </div>
          <div className="text-3xl font-black">{user.streak} DAYS</div>
        </div>

        <div className="comic-card-cream p-5 space-y-1">
          <div className="text-xs font-sans font-black uppercase text-gray-800 flex items-center gap-1">
            <Shield className="w-4 h-4 text-green-700" />
            <span>ACCOUNT STATUS</span>
          </div>
          <div className="text-lg font-black text-green-800">AUTHENTICATED</div>
        </div>
      </div>

    </div>
  );
}

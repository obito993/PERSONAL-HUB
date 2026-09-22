'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Wrench, 
  Sparkles, 
  GraduationCap, 
  Briefcase, 
  Wallet, 
  Palette, 
  Timer, 
  Flame, 
  Trophy, 
  Search, 
  Zap,
  Code,
  User,
  Wifi,
  Clock,
  Bell
} from 'lucide-react';

export interface NavbarProps {
  onOpenCommand: () => void;
}

const NAV_ITEMS = [
  { href: '/', label: 'HUB', icon: Zap },
  { href: '/tools', label: 'TOOLS', icon: Wrench },
  { href: '/study', label: 'STUDY', icon: GraduationCap },
  { href: '/coding', label: 'CODE ARENA', icon: Code },
  { href: '/ai', label: 'AI', icon: Sparkles },
  { href: '/career', label: 'CAREER', icon: Briefcase },
  { href: '/money', label: 'MONEY', icon: Wallet },
  { href: '/create', label: 'CREATE', icon: Palette },
  { href: '/focus', label: 'FOCUS', icon: Timer },
  { href: '/habits', label: 'HABITS', icon: Flame },
  { href: '/challenges', label: 'QUEST', icon: Trophy },
];

export function Navbar({ onOpenCommand }: NavbarProps) {
  const pathname = usePathname();
  const [authUser, setAuthUser] = useState<{ name: string; email: string; level: number; xp: number } | null>(null);
  const [currentTime, setCurrentTime] = useState('');
  const [shortcutText, setShortcutText] = useState('Ctrl K');

  useEffect(() => {
    // Detect OS platform for shortcut badge
    if (typeof window !== 'undefined') {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0 || navigator.userAgent.includes('Mac');
      setShortcutText(isMac ? '⌘K' : 'Ctrl K');
    }

    // Check server auth state
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.user) {
          setAuthUser(data.user);
        }
      })
      .catch(() => {});

    // Clock
    const update = () => setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [pathname]);

  const firstName = authUser?.name ? authUser.name.trim().split(' ')[0] : '';
  const displayTitle = firstName
    ? (firstName.toUpperCase().endsWith('S') ? `${firstName.toUpperCase()}' HUB` : `${firstName.toUpperCase()}'S HUB`)
    : 'PERSONAL HUB';

  return (
    <>
      {/* Top macOS-Style Application Window Bar */}
      <div className="bg-[#FFD83D] comic-border-b-lg border-b-3 border-black py-1.5 px-4 flex items-center justify-between text-xs font-mono font-bold w-full text-black">
        {/* Left: Window Control Dots & Brand */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#FF5A5F] comic-border-sm inline-block" />
            <span className="w-3 h-3 rounded-full bg-white comic-border-sm inline-block" />
            <span className="w-3 h-3 rounded-full bg-green-500 comic-border-sm inline-block" />
          </div>

          <span className="font-sans font-black tracking-wider text-xs uppercase">PERSONAL HUB OS</span>
        </div>

        {/* Right: Status Indicators */}
        <div className="flex items-center gap-3 text-[11px] text-black">
          <div className="hidden sm:flex items-center gap-1 font-black">
            <Wifi className="w-3.5 h-3.5" />
            <span>ONLINE</span>
          </div>

          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{currentTime}</span>
          </div>

          <div className="hidden sm:flex items-center">
            <Bell className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Floating Main Navbar (YELLOW & NEO-BRUTALIST) */}
      <header className="sticky top-2 z-40 w-full px-4 md:px-8 my-3">
        <div className="bg-[#FFD83D] comic-border-lg shadow-comic-lg p-2.5 sm:p-3 flex items-center justify-between gap-3 w-full border-3 border-black relative">
          
          {/* Left Side: Authenticated User's Dynamic Name (e.g., DEION'S HUB) */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="bg-black text-[#FFD83D] comic-border-sm px-3.5 py-1.5 font-black tracking-wider text-base sm:text-xl group-hover:bg-[#FF5A5F] group-hover:text-white transition-colors flex items-center gap-1.5">
              <span>⚡</span>
              <span>{displayTitle}</span>
            </div>
          </Link>

          {/* Center: Completely Empty */}
          <div className="flex-1" />

          {/* Top-Right: Search & Profile Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={onOpenCommand}
              className="bg-[#FFD83D] hover:bg-white text-black border-2 border-black shadow-comic-sm hover:-translate-y-0.5 active:translate-y-0.5 transition-all px-3 sm:px-4 py-1.5 font-black text-xs sm:text-sm flex items-center gap-1.5 rounded-xl"
              title="Global Search / Command Palette (Ctrl+K / Cmd+K)"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.8]" />
              <span className="font-black">SEARCH</span>
              <span className="hidden sm:inline bg-black text-[#FFD83D] px-1.5 py-0.2 text-[10px] font-mono rounded border border-white">
                {shortcutText}
              </span>
            </button>

            <Link
              href="/profile"
              className="bg-[#FFD83D] hover:bg-white text-black border-2 border-black shadow-comic-sm hover:-translate-y-0.5 active:translate-y-0.5 transition-all px-3 sm:px-4 py-1.5 font-black text-xs sm:text-sm flex items-center gap-1.5 rounded-full sm:rounded-xl"
              title="Profile"
            >
              <div className="w-6 h-6 rounded-full bg-black text-[#FFD83D] font-black text-xs flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5 stroke-[2.8]" />
              </div>
              <span className="hidden sm:inline font-black">
                {firstName ? firstName.toUpperCase() : 'PROFILE'}
              </span>
            </Link>
          </div>

        </div>
      </header>
    </>
  );
}

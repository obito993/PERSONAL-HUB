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
  const isHome = pathname === '/';
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

  return (
    <>
      {/* Top macOS-Style Application Window Bar */}
      <div className="bg-[#FFD83D] comic-border-b-lg border-b-3 border-black py-1.5 px-4 flex items-center justify-between text-xs font-mono font-bold w-full text-black">
        {/* Left: Window Control Dots & Menu Items */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#FF5A5F] comic-border-sm inline-block" />
            <span className="w-3 h-3 rounded-full bg-white comic-border-sm inline-block" />
            <span className="w-3 h-3 rounded-full bg-green-500 comic-border-sm inline-block" />
          </div>

          <span className="font-sans font-black tracking-wider text-xs uppercase">PERSONAL HUB OS</span>

          <div className="hidden md:flex items-center gap-3 text-black text-[11px] font-extrabold">
            <Link href="/" className="hover:underline">File</Link>
            <Link href="/tools" className="hover:underline">Tools</Link>
            <Link href="/study" className="hover:underline">Study</Link>
            <Link href="/coding" className="hover:underline">Code Arena</Link>
            <Link href="/ai" className="hover:underline">AI</Link>
            <Link href="/career" className="hover:underline">Career</Link>
            <Link href="/privacy" className="hover:underline">Help</Link>
          </div>
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

      {/* Floating Main Navbar (FULLY YELLOW) */}
      <header className="sticky top-2 z-40 w-full px-4 md:px-8 my-3">
        <div className="bg-[#FFD83D] comic-border-lg shadow-comic-lg p-2.5 sm:p-3 flex items-center justify-between gap-3 w-full border-3 border-black relative">
          
          {/* Left Branding for non-home pages */}
          {!isHome && (
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="bg-black text-[#FFD83D] comic-border-sm px-3.5 py-1.5 font-black tracking-wider text-lg sm:text-2xl group-hover:bg-[#FF5A5F] group-hover:text-white transition-colors flex items-center gap-1.5">
                <span>⚡</span>
                <span>PERSONAL HUB</span>
              </div>
            </Link>
          )}

          {/* Center BIG Headline: WELCOME TO THE HUB (FULL YELLOW) */}
          {isHome ? (
            <div className="flex-1 flex justify-center">
              <Link href="/" className="group">
                <div className="bg-[#FFD83D] text-black comic-border-md px-6 sm:px-10 py-2.5 font-black text-2xl sm:text-4xl lg:text-5xl tracking-tight uppercase shadow-comic-md group-hover:bg-[#FF5A5F] group-hover:text-white transition-all transform hover:scale-105 flex items-center gap-2">
                  <span>⚡</span>
                  <span>WELCOME TO THE HUB</span>
                </div>
              </Link>
            </div>
          ) : (
            <nav className="hidden xl:flex items-center gap-1 mx-auto">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-2 py-1 font-extrabold text-xs tracking-wider flex items-center gap-1 border-2 transition-all ${
                      isActive
                        ? 'bg-black text-[#FFD83D] border-[#050505] shadow-comic-sm font-black translate-y-[-1px]'
                        : 'border-transparent text-black hover:border-[#050505] hover:bg-[#FFFDF5]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Top-Right Side Corner: FIND (SEARCH) & PROFILE (FULLY YELLOW) */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto shrink-0">
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

            {authUser ? (
              <Link
                href="/profile"
                className="bg-[#FFD83D] hover:bg-white text-black border-2 border-black shadow-comic-sm hover:-translate-y-0.5 active:translate-y-0.5 transition-all px-3 sm:px-4 py-1.5 font-black text-xs sm:text-sm flex items-center gap-1.5 rounded-xl"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.8]" />
                <span className="hidden sm:inline">{authUser.name.split(' ')[0].toUpperCase()}</span>
              </Link>
            ) : (
              <Link
                href="/profile"
                className="bg-[#FFD83D] hover:bg-white text-black border-2 border-black shadow-comic-sm hover:-translate-y-0.5 active:translate-y-0.5 transition-all px-3 sm:px-4 py-1.5 font-black text-xs sm:text-sm flex items-center gap-1.5 rounded-xl"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.8]" />
                <span>PROFILE</span>
              </Link>
            )}
          </div>

        </div>
      </header>
    </>
  );
}

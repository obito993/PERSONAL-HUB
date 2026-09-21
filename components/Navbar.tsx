'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Zap,
  FileText,
  Briefcase,
  BarChart2,
  LogOut,
  User,
  Menu,
  X,
  HelpCircle,
  Kanban,
  ShieldCheck,
  Layout,
  PlusCircle,
  Scan,
} from 'lucide-react';
import { UserSession } from '@/types';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [pathname]);

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    setUser(null);
    router.push('/');
    router.refresh();
  };

  const navLinks = [
    { label: 'HQ DASHBOARD', href: '/dashboard', icon: BarChart2, protected: true },
    { label: 'MASTER PROFILE', href: '/profile', icon: ShieldCheck, protected: true },
    { label: 'MY RESUMES', href: '/resumes', icon: FileText, protected: true },
    { label: 'JOB ANALYZER', href: '/jobs/analyze', icon: Briefcase, protected: true },
    { label: 'ATS SCANNER', href: '/ats', icon: Scan, protected: true },
    { label: 'TEMPLATES', href: '/templates', icon: Layout, protected: false },
    { label: 'TRACKER', href: '/tracker', icon: Kanban, protected: true },
    { label: 'INTERVIEW', href: '/interview', icon: HelpCircle, protected: true },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b-2 border-orange-500/20 bg-[#09090b]/85 backdrop-blur-xl no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          data-cursor="HQ"
          className="flex items-center gap-2 font-black text-lg tracking-tight text-white group shrink-0 uppercase"
        >
          <div className="w-8 h-8 rounded-lg border-2 border-orange-500 bg-orange-500/10 p-0.5 shadow-[0_0_15px_rgba(249,115,22,0.4)] group-hover:bg-orange-500 group-hover:text-black transition-all flex items-center justify-center">
            <Zap className="w-4 h-4 text-orange-400 group-hover:text-black transition-colors" />
          </div>
          <span className="font-mono">RESUMEFORGE<span className="text-orange-500 text-glow-orange">.AI</span></span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 overflow-x-auto">
          {navLinks.map((link) => {
            if (link.protected && !user) return null;
            const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                data-cursor="OPEN"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-[11px] font-black tracking-wider transition-all whitespace-nowrap uppercase ${
                  active
                    ? 'border-orange-500 bg-orange-500/20 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.2)]'
                    : 'border-transparent text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Auth CTA / User Profile */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {user && (
            <Link
              href="/resumes/create"
              data-cursor="NEW"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded border-2 border-orange-500 bg-orange-500 text-black font-black text-xs tracking-wider uppercase shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:bg-orange-400 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ CREATE RESUME</span>
            </Link>
          )}

          {loading ? (
            <div className="w-20 h-8 bg-zinc-900 animate-pulse rounded border border-zinc-800" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                data-cursor="PROFILE"
                className="flex items-center gap-2 px-3 py-1.5 rounded border border-zinc-800 bg-zinc-900/90 text-xs font-bold text-zinc-300 hover:border-orange-500/50 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-orange-400" />
                <span>{user.name.toUpperCase()}</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="p-2 rounded border border-zinc-800 text-zinc-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-xs font-bold text-zinc-300 hover:text-white transition-colors"
              >
                SIGN IN
              </Link>
              <Link
                href="/register"
                className="px-4 py-1.5 text-xs font-black text-black bg-orange-500 hover:bg-orange-400 rounded border-2 border-orange-500 uppercase tracking-wider shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all"
              >
                JOIN THE EXPERIENCE
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded border border-orange-500/30 text-zinc-400 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6 text-orange-400" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b-2 border-orange-500/30 bg-[#09090b] px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            if (link.protected && !user) return null;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded text-xs font-extrabold text-zinc-300 hover:bg-zinc-900 hover:text-orange-400"
              >
                <Icon className="w-4 h-4 text-orange-400" />
                {link.label}
              </Link>
            );
          })}
          {user && (
            <Link
              href="/resumes/create"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 mt-3 py-2 text-xs font-black text-black bg-orange-500 rounded uppercase tracking-wider"
            >
              <PlusCircle className="w-4 h-4" />
              CREATE RESUME
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

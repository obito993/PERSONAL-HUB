'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { ComicDock } from '@/components/layout/ComicDock';
import { CommandPalette } from '@/components/command/CommandPalette';
import { GlobalAudio } from '@/components/layout/GlobalAudio';
import { IdleTimerProvider } from '@/components/auth/IdleTimerProvider';

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        e.stopPropagation();
        setIsCommandOpen((prev) => !prev);
      }
    };

    // Attach with capture phase to guarantee interception before browser address bar shortcuts
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  // Determine signature dynamic comic background per page route
  const getPageBackground = () => {
    if (pathname === '/login' || pathname === '/signup') return "url('/images/bg-night-city.jpg')";
    if (pathname.startsWith('/tools')) return "url('/images/bg-tools-yellow.jpg')";
    if (pathname.startsWith('/study')) return "url('/images/bg-study-pink.jpg')";
    if (pathname.startsWith('/ai')) return "url('/images/bg-ai-purple.jpg')";
    if (pathname.startsWith('/career')) return "url('/images/bg-career-orange.jpg')";
    if (pathname.startsWith('/coding')) return "url('/images/bg-tools-yellow.jpg')"; // Blue/Code Arena
    return "url('/images/media_1790004675855.jpg')"; // Default Red for Home Hub
  };

  return (
    <IdleTimerProvider>
      <div className="min-h-screen flex flex-col justify-between relative pb-28">
        {/* Isolated fixed background image with brightness filter (does not break fixed stacking context for dock) */}
        <div 
          className="fixed inset-0 -z-10 bg-fixed bg-cover bg-center transition-all duration-300 pointer-events-none"
          style={{ 
            backgroundImage: getPageBackground(),
            filter: pathname === '/login' || pathname === '/signup' ? 'brightness(0.7) contrast(1.1)' : 'brightness(1.12) contrast(1.05)'
          }}
        />

        <Navbar onOpenCommand={() => setIsCommandOpen(true)} />
        
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 relative z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 12, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.995 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Floating React Bits Comic Dock fixed to viewport */}
        <ComicDock onOpenFind={() => setIsCommandOpen(true)} />

        {/* Global Background Audio Controller (🔊 / 🔇) */}
        <GlobalAudio />

        <CommandPalette 
          isOpen={isCommandOpen} 
          onClose={() => setIsCommandOpen(false)} 
        />
      </div>
    </IdleTimerProvider>
  );
}



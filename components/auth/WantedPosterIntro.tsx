'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { sound } from '@/lib/sound';

interface WantedPosterIntroProps {
  onComplete: () => void;
}

export function WantedPosterIntro({ onComplete }: WantedPosterIntroProps) {
  const [phase, setPhase] = useState<'FLYING' | 'WIND' | 'IMPACT' | 'SETTLED'>('FLYING');
  const [showWhamSticker, setShowWhamSticker] = useState(false);

  useEffect(() => {
    // Check prefers-reduced-motion
    if (typeof window !== 'undefined') {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const hasSeenIntro = sessionStorage.getItem('dh_auth_intro_seen');

      if (prefersReducedMotion || hasSeenIntro) {
        onComplete();
        return;
      }
    }

    // Phase Timeline:
    // 0.0s -> FLYING
    // 0.8s -> WIND
    // 1.4s -> IMPACT (SLAM!)
    // 2.0s -> SETTLED & REVEAL
    const t1 = setTimeout(() => {
      setPhase('WIND');
    }, 700);

    const t2 = setTimeout(() => {
      setPhase('IMPACT');
      setShowWhamSticker(true);
      try {
        sound.playPop();
      } catch {}
    }, 1300);

    const t3 = setTimeout(() => {
      setShowWhamSticker(false);
      setPhase('SETTLED');
    }, 1900);

    const t4 = setTimeout(() => {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('dh_auth_intro_seen', 'true');
      }
      onComplete();
    }, 2600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  const handleSkip = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('dh_auth_intro_seen', 'true');
    }
    sound.playPop();
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#121212] flex items-center justify-center overflow-hidden p-4 select-none">
      
      {/* Comic Book Speed Lines & Halftone Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#FFD83D_1.5px,transparent_1.5px)] [background-size:16px_16px]" />

      {/* Screen Shake Container on Impact */}
      <motion.div
        animate={phase === 'IMPACT' ? { x: [-12, 12, -8, 8, -4, 0], y: [-8, 8, -4, 4, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg flex items-center justify-center relative z-10"
      >
        {/* SKIP INTRO BUTTON */}
        <button
          onClick={handleSkip}
          className="absolute top-[-60px] right-0 bg-black text-[#FFD83D] hover:bg-[#FF5A5F] hover:text-white comic-border-sm px-4 py-1.5 font-black text-xs tracking-wider uppercase shadow-comic-sm transition-all cursor-pointer z-50 flex items-center gap-1.5"
        >
          <span>SKIP INTRO</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        {/* IMPACT WHAM STICKER */}
        <AnimatePresence>
          {showWhamSticker && (
            <motion.div
              initial={{ scale: 0.2, opacity: 0, rotate: -25 }}
              animate={{ scale: 1.4, opacity: 1, rotate: -15 }}
              exit={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute -top-12 -left-8 z-40 bg-[#FF5A5F] text-white comic-border-lg p-3 font-black text-3xl sm:text-4xl shadow-comic-lg tracking-widest uppercase transform rotate-[-12deg]"
            >
              💥 WHAM!
            </motion.div>
          )}
        </AnimatePresence>

        {/* WANTED POSTER CARD */}
        <motion.div
          initial={{
            scale: 0.15,
            rotateZ: -24,
            rotateX: 45,
            y: -200,
            opacity: 0,
            filter: 'blur(10px)',
          }}
          animate={
            phase === 'FLYING'
              ? { scale: 0.6, rotateZ: -18, rotateX: 30, y: -80, opacity: 0.7, filter: 'blur(5px)' }
              : phase === 'WIND'
              ? { scale: 1.25, rotateZ: 8, rotateX: -12, skewX: 4, y: 10, opacity: 1, filter: 'blur(0px)' }
              : phase === 'IMPACT'
              ? { scale: 1.0, rotateZ: -2, rotateX: 0, skewX: 0, y: 0, opacity: 1, filter: 'blur(0px)' }
              : { scale: 1.0, rotateZ: -1, y: 0, opacity: 1, filter: 'blur(0px)' }
          }
          transition={{
            type: 'spring',
            stiffness: phase === 'IMPACT' ? 400 : 120,
            damping: phase === 'IMPACT' ? 18 : 12,
          }}
          className="bg-[#FFFDF5] comic-border-lg shadow-comic-lg p-8 sm:p-10 w-full text-center relative border-4 border-black space-y-5"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Tape Corners */}
          <div className="absolute -top-3 -left-3 w-10 h-6 bg-[#FFD83D]/80 border-2 border-black rotate-[-15deg] shadow-comic-sm" />
          <div className="absolute -top-3 -right-3 w-10 h-6 bg-[#FFD83D]/80 border-2 border-black rotate-[15deg] shadow-comic-sm" />

          {/* Poster Top Banner */}
          <div className="border-b-4 border-black pb-3 space-y-1">
            <span className="comic-badge comic-badge-red text-xs tracking-widest uppercase font-mono font-bold">
              ★ DEION HUB HERO REGISTRY ★
            </span>
            <h1 className="font-black text-5xl sm:text-6xl tracking-tighter uppercase text-black">
              WANTED
            </h1>
            <p className="font-mono text-xs font-black tracking-wider uppercase text-gray-800">
              IDENTITY RECOGNITION REQUIRED
            </p>
          </div>

          {/* Stylized Identity Area */}
          <div className="bg-[#FFD83D] comic-border-md p-6 border-3 border-black space-y-2 relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-black text-[#FFD83D] comic-border-sm mx-auto flex items-center justify-center font-black text-2xl">
              ⚡
            </div>
            <h2 className="font-black text-2xl uppercase tracking-wide">
              DEION HUB
            </h2>
            <div className="bg-black text-white px-3 py-1 text-xs font-mono font-bold rounded inline-block uppercase">
              LEVEL 1 ACCESS REQUIRED
            </div>
          </div>

          {/* Poster Tagline */}
          <div className="pt-2 border-t-2 border-dashed border-black/40">
            <p className="font-mono text-xs font-bold italic text-gray-800">
              &quot;Your next hero chapter starts right here.&quot;
            </p>
          </div>

          {/* Bottom Status */}
          <div className="flex items-center justify-between text-[11px] font-mono font-black text-black pt-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
              <span>SECURED GATEWAY</span>
            </span>
            <span>ISSUE #2026</span>
          </div>
        </motion.div>
      </motion.div>

    </div>
  );
}

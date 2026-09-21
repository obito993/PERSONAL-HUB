'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

export function ComicIntroOverlay() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check session storage so intro plays only once per session launch
    const hasSeenIntro = sessionStorage.getItem('rf_seen_intro');
    if (!hasSeenIntro) {
      setShow(true);
    }
  }, []);

  const handleSkip = () => {
    setShow(false);
    sessionStorage.setItem('rf_seen_intro', 'true');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#09090b] p-6 no-print"
        >
          {/* Halftone texture overlay */}
          <div className="bg-halftone absolute inset-0 opacity-20 pointer-events-none" />

          {/* Animated Circuit Energy Lines */}
          <svg className="absolute inset-0 h-full w-full opacity-20">
            <motion.path
              d="M 0 100 Q 300 300 600 100 T 1200 400"
              fill="none"
              stroke="#f97316"
              strokeWidth="3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: 'easeInOut' }}
            />
          </svg>

          {/* Core Kinetic Logo Reveal */}
          <div className="relative z-10 text-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: 'backOut' }}
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-orange-500 bg-orange-500/10 text-orange-400 shadow-[0_0_40px_rgba(249,115,22,0.6)]"
            >
              <Zap className="h-10 w-10" />
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase"
            >
              YOUR CAREER.<br />
              <span className="text-orange-500 text-glow-orange">YOUR STORY.</span><br />
              YOUR NEXT CHAPTER.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-4 text-sm font-semibold tracking-widest text-zinc-400 uppercase"
            >
              INITIALIZING AI CAREER COMMAND CENTER...
            </motion.p>
          </div>

          {/* Skip CTA */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            onClick={handleSkip}
            className="absolute bottom-10 z-20 rounded-full border border-orange-500/50 bg-orange-500/10 px-6 py-2 text-xs font-black tracking-widest text-orange-400 uppercase hover:bg-orange-500 hover:text-black transition-colors"
          >
            ENTER COMMAND CENTER [SKIP]
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

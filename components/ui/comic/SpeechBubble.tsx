'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SpeechBubbleProps {
  children: React.ReactNode;
  speaker?: string; // e.g. "FORGE AI", "RECRUITER", "HERO"
  variant?: 'orange' | 'yellow' | 'dark';
  tailPosition?: 'bottom' | 'left' | 'top' | 'right';
  className?: string;
}

export function SpeechBubble({
  children,
  speaker = 'FORGE AI',
  variant = 'orange',
  tailPosition = 'bottom',
  className = '',
}: SpeechBubbleProps) {
  const bgStyles = {
    orange: 'bg-orange-500 text-black border-2 border-black shadow-[4px_4px_0px_#000]',
    yellow: 'bg-amber-400 text-black border-2 border-black shadow-[4px_4px_0px_#000]',
    dark: 'bg-[#121218] text-white border-2 border-orange-500 shadow-[4px_4px_0px_rgba(249,115,22,0.5)]',
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className={`relative rounded-xl p-3.5 ${bgStyles[variant]} ${className}`}
    >
      {speaker && (
        <div className="mb-1 font-mono text-[10px] font-black tracking-widest uppercase opacity-80 border-b border-current/20 pb-0.5">
          💬 {speaker}:
        </div>
      )}
      <div className="font-extrabold tracking-tight text-xs sm:text-sm leading-snug">
        {children}
      </div>
    </motion.div>
  );
}

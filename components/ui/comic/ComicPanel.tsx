'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ComicPanelProps {
  children: React.ReactNode;
  panelTag?: string; // e.g. "PANEL 01", "CHAPTER 02"
  title?: string;
  subtitle?: string;
  className?: string;
  glow?: boolean;
}

export function ComicPanel({
  children,
  panelTag,
  title,
  subtitle,
  className = '',
  glow = false,
}: ComicPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`group relative overflow-hidden rounded-xl bg-[#0d0d12] p-6 comic-border ${
        glow ? 'glow-orange' : ''
      } ${className}`}
    >
      {/* Subtle Comic Halftone Texture Overlay */}
      <div className="bg-halftone pointer-events-none absolute inset-0 opacity-20" />

      {/* Comic Header Bar */}
      {(panelTag || title) && (
        <div className="relative mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-orange-500/20 pb-3">
          {panelTag && (
            <span className="inline-block rounded bg-orange-500/20 px-2.5 py-0.5 text-xs font-black tracking-widest text-orange-400 uppercase border border-orange-500/30">
              {panelTag}
            </span>
          )}
          {title && (
            <h3 className="font-extrabold tracking-tight text-white text-lg group-hover:text-orange-400 transition-colors">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="w-full text-xs text-zinc-400 font-medium">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10">{children}</div>

      {/* Bottom Corner Comic Accent */}
      <div className="absolute right-0 bottom-0 h-4 w-4 border-r-2 border-b-2 border-orange-500/40 transition-colors group-hover:border-orange-500" />
    </motion.div>
  );
}

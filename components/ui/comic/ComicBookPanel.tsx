'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface ComicBookPanelProps {
  children: React.ReactNode;
  issueTag?: string; // e.g. "PANEL 01", "CHAPTER 02"
  title?: string;
  subtitle?: string;
  badge?: string; // Action badge text e.g. "BOOM!"
  className?: string;
}

export function ComicBookPanel({
  children,
  issueTag,
  title,
  subtitle,
  badge,
  className = '',
}: ComicBookPanelProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotateX((-y / rect.height) * 12);
    setRotateY((x / rect.width) * 12);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={panelRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX, rotateY }}
      transition={{ type: 'spring', damping: 20, stiffness: 250, mass: 0.1 }}
      style={{ transformStyle: 'preserve-3d' }}
      className={`group relative overflow-hidden rounded-xl border-2 border-orange-500/40 bg-[#0d0d12] p-6 shadow-[5px_5px_0px_#000,0_0_20px_rgba(249,115,22,0.15)] hover:border-orange-500 hover:shadow-[7px_7px_0px_#f97316,0_0_30px_rgba(249,115,22,0.35)] transition-all ${className}`}
    >
      {/* Halftone texture overlay */}
      <div className="bg-halftone pointer-events-none absolute inset-0 opacity-25" />

      {/* Top Badge Overlay */}
      {badge && (
        <div className="absolute top-2 right-2 z-20 font-mono text-[10px] font-black uppercase rounded bg-amber-400 text-black px-2 py-0.5 border border-black shadow-[2px_2px_0px_#000] rotate-3">
          ⚡ {badge}
        </div>
      )}

      {/* Panel Tag Bar */}
      {(issueTag || title) && (
        <div className="relative z-10 mb-4 flex flex-wrap items-center justify-between gap-2 border-b-2 border-orange-500/20 pb-3">
          {issueTag && (
            <span className="font-mono text-[10px] font-black tracking-widest text-orange-400 uppercase rounded bg-orange-500/20 px-2 py-0.5 border border-orange-500/40">
              {issueTag}
            </span>
          )}
          {title && (
            <h3 className="font-black tracking-tight text-white text-base uppercase group-hover:text-orange-400 transition-colors">
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

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

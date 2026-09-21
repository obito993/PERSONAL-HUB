'use client';

import React from 'react';

export function ComicHeroArtwork() {
  return (
    <div className="relative w-full max-w-md mx-auto aspect-square bg-[#FFFDF5] comic-border-lg p-4 shadow-comic-lg flex flex-col items-center justify-center overflow-hidden group">
      
      {/* Halftone & Diagonal Background Grid */}
      <div className="absolute inset-0 halftone-box opacity-20 pointer-events-none" />
      
      {/* Speed Lines SVG Animation */}
      <svg className="absolute inset-0 w-full h-full stroke-black/20 stroke-2 pointer-events-none">
        <line x1="0" y1="0" x2="100%" y2="100%" strokeDasharray="6,6" />
        <line x1="100%" y1="0" x2="0" y2="100%" strokeDasharray="6,6" />
        <circle cx="50%" cy="50%" r="40%" fill="none" stroke="#FFD83D" strokeWidth="4" strokeDasharray="8,8" />
      </svg>

      {/* Central Abstract Hero Command Sphere */}
      <div className="relative z-10 w-44 h-44 bg-[#FFD83D] comic-border-lg rounded-full flex flex-col items-center justify-center shadow-comic group-hover:scale-105 transition-transform duration-300">
        <div className="w-24 h-24 bg-[#FF5A5F] comic-border-sm rounded-full flex items-center justify-center text-white font-black text-4xl shadow-[2px_2px_0_#000]">
          ⚡
        </div>
        <div className="font-black text-xs uppercase tracking-wider mt-2 bg-white text-black px-2 py-0.5 comic-border-sm">
          DEION OS HERO
        </div>
      </div>

      {/* Floating Comic Panels & Tool Badges Around Center */}
      <div className="absolute top-4 left-4 bg-[#B9A7FF] comic-border-sm px-2.5 py-1 text-[10px] font-black shadow-comic-sm rotate-[-6deg] animate-pulse">
        🧠 AI BRAIN ACTIVE
      </div>

      <div className="absolute top-6 right-4 bg-[#5DADE2] comic-border-sm px-2.5 py-1 text-[10px] font-black shadow-comic-sm rotate-[4deg]">
        💻 CODE ARENA
      </div>

      <div className="absolute bottom-6 left-6 bg-[#FF5A5F] text-white comic-border-sm px-2.5 py-1 text-[10px] font-black shadow-comic-sm rotate-[3deg]">
        💼 MISSION BOARD
      </div>

      <div className="absolute bottom-4 right-6 bg-white comic-border-sm px-2.5 py-1 text-[10px] font-black shadow-comic-sm rotate-[-4deg]">
        📊 GST & MATH
      </div>

      {/* Comic Speech Overlay */}
      <div className="absolute bottom-16 bg-white comic-border-sm px-3 py-1 text-[11px] font-black shadow-comic text-center z-20">
        &quot;DIGITAL COMMAND CENTER ONLINE&quot;
      </div>

    </div>
  );
}

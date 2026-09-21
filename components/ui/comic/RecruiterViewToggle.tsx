'use client';

import React from 'react';
import { Eye, ShieldCheck, Monitor } from 'lucide-react';

interface RecruiterViewToggleProps {
  isRecruiterView: boolean;
  onToggle: (value: boolean) => void;
}

export function RecruiterViewToggle({
  isRecruiterView,
  onToggle,
}: RecruiterViewToggleProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-orange-500/30 bg-[#0d0d12] p-1.5 no-print">
      <button
        onClick={() => onToggle(false)}
        className={`flex items-center gap-1.5 rounded px-3 py-1 text-xs font-bold transition-colors ${
          !isRecruiterView
            ? 'bg-orange-500 text-black shadow-[0_0_10px_rgba(249,115,22,0.4)]'
            : 'text-zinc-400 hover:text-white'
        }`}
      >
        <Monitor className="h-3.5 w-3.5" />
        <span>COMMAND CENTER</span>
      </button>

      <button
        onClick={() => onToggle(true)}
        className={`flex items-center gap-1.5 rounded px-3 py-1 text-xs font-bold transition-colors ${
          isRecruiterView
            ? 'bg-white text-black shadow-md'
            : 'text-zinc-400 hover:text-white'
        }`}
      >
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
        <span>RECRUITER VIEW (ATS CLEAN)</span>
      </button>
    </div>
  );
}

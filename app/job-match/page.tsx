'use client';

import React from 'react';
import Link from 'next/link';
import { Target, ArrowRight, ShieldCheck } from 'lucide-react';
import { ComicPanel } from '@/components/ui/comic/ComicPanel';

export default function JobMatchPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen text-white">
      <div className="text-center mb-10">
        <span className="font-mono text-xs font-black text-orange-500 uppercase tracking-widest">
          SKILL GAP MATRIX & MATCH HUB
        </span>
        <h1 className="text-4xl sm:text-5xl font-black uppercase text-white mt-2">
          JOB <span className="text-orange-500 text-glow-orange">MATCH HUB</span>
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto font-medium">
          Evaluate keyword gaps, confirm verified missing skills, and calculate diagnostic score alignment.
        </p>
      </div>

      <ComicPanel panelTag="MATCH MATRIX" title="RUN JOB MATCH ANALYSIS">
        <div className="py-8 text-center">
          <Target className="h-12 w-12 text-orange-400 mx-auto mb-3" />
          <p className="text-xs text-zinc-400 max-w-md mx-auto mb-6">
            Compare your resume against target job postings to discover matching (✓), missing (×), and partial (△) keyword overlaps.
          </p>
          <Link
            href="/jobs/analyze"
            data-cursor="MATCH"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-orange-500 bg-orange-500 px-8 py-4 font-black text-black text-xs uppercase shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:bg-orange-400 transition-all"
          >
            <span>LAUNCH MATCH ANALYSIS</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </ComicPanel>
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { ComicPanel } from '@/components/ui/comic/ComicPanel';

export default function TailorHubPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen text-white">
      <div className="text-center mb-10">
        <span className="font-mono text-xs font-black text-orange-500 uppercase tracking-widest">
          AI TRANSFORMATION LAB
        </span>
        <h1 className="text-4xl sm:text-5xl font-black uppercase text-white mt-2">
          RESUME <span className="text-orange-500 text-glow-orange">TAILORING HUB</span>
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto font-medium">
          Align your resume bullets with target job requirements using strict anti-hallucination AI guardrails.
        </p>
      </div>

      <ComicPanel panelTag="TRANSFORMATION NODE" title="TAILOR A RESUME FOR A JOB">
        <div className="py-8 text-center">
          <RefreshCw className="h-12 w-12 text-orange-400 mx-auto mb-3 animate-spin" />
          <p className="text-xs text-zinc-400 max-w-md mx-auto mb-6">
            Select an existing job analysis to launch the Transformation Lab with animated connection nodes between your Master Profile and Job Requirements.
          </p>
          <Link
            href="/jobs/analyze"
            data-cursor="ANALYZE"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-orange-500 bg-orange-500 px-8 py-4 font-black text-black text-xs uppercase shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:bg-orange-400 transition-all"
          >
            <span>START NEW JOB ANALYSIS</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </ComicPanel>
    </div>
  );
}

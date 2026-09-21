'use client';

import React from 'react';
import Link from 'next/link';
import { Target, PlusCircle, ArrowRight } from 'lucide-react';
import { ComicPanel } from '@/components/ui/comic/ComicPanel';

export default function JobsWorkspacePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b-2 border-orange-500/20 pb-6">
        <div>
          <span className="font-mono text-xs font-black text-orange-500 uppercase tracking-widest">
            JOB WORKSPACE & TARGET DESCRIPTIONS
          </span>
          <h1 className="text-3xl font-black uppercase text-white">TARGET JOB DESCRIPTIONS</h1>
        </div>
        <Link
          href="/jobs/analyze"
          data-cursor="ANALYZE"
          className="inline-flex items-center gap-2 rounded-xl border-2 border-orange-500 bg-orange-500 px-6 py-3 font-black text-black text-xs uppercase shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:bg-orange-400 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ ANALYZE NEW JOB</span>
        </Link>
      </div>

      <ComicPanel panelTag="PORTAL 02" title="ANALYZE TARGET JOB DESCRIPTION" subtitle="Paste & Extract Requirements">
        <div className="py-8 text-center">
          <Target className="h-12 w-12 text-orange-400 mx-auto mb-3" />
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Paste a job description from LinkedIn, Indeed, or company portals to extract required skills, soft skills, and keyword alignment.
          </p>
          <div className="mt-6">
            <Link
              href="/jobs/analyze"
              className="inline-flex items-center gap-2 rounded border-2 border-orange-500 bg-orange-500 px-6 py-2.5 font-black text-black text-xs uppercase"
            >
              <span>OPEN JOB ANALYZER</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </ComicPanel>
    </div>
  );
}

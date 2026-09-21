'use client';

import React from 'react';
import Link from 'next/link';
import { Upload, UserCheck, ArrowRight, Zap } from 'lucide-react';
import { ComicPanel } from '@/components/ui/comic/ComicPanel';

export default function ResumeCreatePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-screen text-white">
      <div className="text-center mb-12">
        <span className="font-mono text-xs font-black text-orange-500 uppercase tracking-widest">
          RESUME CREATOR LAUNCHER
        </span>
        <h1 className="text-4xl font-black uppercase text-white mt-2">
          CHOOSE YOUR <span className="text-orange-500 text-glow-orange">STARTING POINT</span>
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
          Import your existing PDF/DOCX resume or generate a build directly from your Master Profile.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link href="/resumes/new" data-cursor="UPLOAD">
          <ComicPanel panelTag="OPTION A" title="IMPORT EXISTING RESUME" subtitle="PDF, DOCX, or TXT File">
            <div className="py-6 flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-2xl border-2 border-orange-500 bg-orange-500/10 flex items-center justify-center text-orange-400 mb-4 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                <Upload className="h-8 w-8" />
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                Upload your resume file. Our multi-strategy parser extracts skills, experience bullets, and contact info into structured JSON.
              </p>
              <div className="w-full py-3 rounded border-2 border-orange-500 bg-orange-500 text-black font-black text-xs uppercase flex items-center justify-center gap-2">
                <span>UPLOAD FILE</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </ComicPanel>
        </Link>

        <Link href="/profile" data-cursor="MASTER">
          <ComicPanel panelTag="OPTION B" title="BUILD FROM MASTER PROFILE" subtitle="Single Source of Truth">
            <div className="py-6 flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-2xl border-2 border-orange-500 bg-orange-500/10 flex items-center justify-center text-orange-400 mb-4 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                <UserCheck className="h-8 w-8" />
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                Use your stored Master Profile to generate clean ATS resumes tailored for Fresher, Experienced, or Career Changer modes.
              </p>
              <div className="w-full py-3 rounded border border-orange-500/40 bg-orange-500/10 text-orange-400 font-black text-xs uppercase flex items-center justify-center gap-2">
                <span>OPEN MASTER PROFILE</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </ComicPanel>
        </Link>
      </div>
    </div>
  );
}

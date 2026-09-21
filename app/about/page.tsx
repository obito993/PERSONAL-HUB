'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, Target, ArrowRight, FileText, CheckCircle2 } from 'lucide-react';
import { ComicPanel } from '@/components/ui/comic/ComicPanel';

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden bg-[#09090b] min-h-screen text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="bg-halftone pointer-events-none absolute inset-0 opacity-20" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <span className="font-mono text-xs font-black text-orange-500 uppercase tracking-widest">
            THE ARCHITECTURE & MISSION
          </span>
          <h1 className="text-4xl sm:text-6xl font-black uppercase text-white mt-2">
            WHY RESUMEFORGE.AI IS <span className="text-orange-500 text-glow-orange">DIFFERENT</span>
          </h1>
          <p className="mt-4 text-zinc-300 font-medium max-w-2xl mx-auto text-sm sm:text-base">
            We built a high-energy interactive command center for candidates, but our output resumes remain 100% clean, professional, and ATS-optimized.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <ComicPanel panelTag="PHILOSOPHY 01" title="STRICT ANTI-HALLUCINATION" subtitle="Truth-bound AI">
            <p className="text-xs text-zinc-400 leading-relaxed">
              Generic AI tools write fake bullet points, pretend you managed teams of 50, and fabricate degrees. ResumeForge AI operates under strict guardrails. It reorganizes and elevates your verified experience without inventing credentials.
            </p>
          </ComicPanel>

          <ComicPanel panelTag="PHILOSOPHY 02" title="PERMANENT MASTER PROFILE" subtitle="Single Source of Truth">
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your career is continuous. Master Profile stores your entire history securely in one place. Tailoring a resume creates a job-specific snapshot and never overwrites your master records.
            </p>
          </ComicPanel>

          <ComicPanel panelTag="PHILOSOPHY 03" title="3 SEPARATE METRICS" subtitle="No Meaningless Numbers">
            <p className="text-xs text-zinc-400 leading-relaxed">
              Instead of giving you a single arbitrary score, we evaluate Job Match %, ATS Compatibility %, and Resume Quality % independently so you know exactly what to improve.
            </p>
          </ComicPanel>

          <ComicPanel panelTag="PHILOSOPHY 04" title="100% ATS COMPATIBLE OUTPUT" subtitle="Recruiter Readability First">
            <p className="text-xs text-zinc-400 leading-relaxed">
              While our web interface is cinematic and story-driven, your exported PDF and DOCX files follow clean, parsing-tested ATS standards that human recruiters and ATS software can easily scan.
            </p>
          </ComicPanel>
        </div>

        <div className="text-center mt-8">
          <Link
            href="/resumes/create"
            data-cursor="BUILD"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-orange-500 bg-orange-500 px-8 py-4 font-black text-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:bg-orange-400 transition-all"
          >
            <span>BUILD MY ATS RESUME NOW</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

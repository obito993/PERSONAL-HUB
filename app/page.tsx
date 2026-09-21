'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  Target,
  FileText,
  HelpCircle,
  BarChart3,
  Kanban,
  CheckCircle2,
  Briefcase,
  Layers,
  Sparkles,
  Scan,
  Compass,
  ChevronRight,
} from 'lucide-react';
import { ComicPanel } from '@/components/ui/comic/ComicPanel';

export default function LandingPage() {
  const [activeUniverse, setActiveUniverse] = useState(0);

  const careerWorlds = [
    { title: 'SOFTWARE ENGINEER', skills: ['TypeScript', 'React', 'Node.js', 'System Architecture', 'CI/CD'] },
    { title: 'DATA ANALYST', skills: ['SQL', 'Python', 'Tableau', 'ETL Pipelines', 'A/B Testing'] },
    { title: 'TEACHER & EDUCATOR', skills: ['Curriculum Design', 'Student Assessment', 'Lesson Planning', 'EdTech'] },
    { title: 'ACCOUNTANT & FINANCE', skills: ['Financial Reporting', 'GAAP', 'Auditing', 'Tax Strategy', 'Excel'] },
    { title: 'NURSE & HEALTHCARE', skills: ['Patient Care', 'Clinical Rotations', 'EMR Systems', 'Triage', 'BLS/ACLS'] },
    { title: 'MARKETING EXECUTIVE', skills: ['SEO/SEM', 'Brand Strategy', 'Growth Hacking', 'Copywriting', 'Analytics'] },
    { title: 'MECHANICAL ENGINEER', skills: ['SolidWorks', 'CAD/CAM', 'Thermal Analysis', 'Prototyping', 'GD&T'] },
    { title: 'OPERATIONS MANAGER', skills: ['Supply Chain', 'Logistics', 'Vendor Relations', 'Six Sigma', 'Budgeting'] },
  ];

  return (
    <div className="relative overflow-hidden bg-[#09090b] text-white">
      {/* Background Halftone & Glow */}
      <div className="bg-halftone pointer-events-none absolute inset-0 opacity-25" />
      <div className="pointer-events-none absolute top-0 left-1/2 h-[600px] w-[1100px] -translate-x-1/2 bg-gradient-to-b from-orange-500/15 via-orange-600/5 to-transparent blur-3xl" />

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-4 pt-16 pb-20 text-center sm:px-6 md:pt-28 md:pb-28 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-orange-500/10 px-4 py-1.5 text-xs font-black tracking-widest text-orange-400 uppercase shadow-[0_0_15px_rgba(249,115,22,0.2)]"
        >
          <Zap className="h-3.5 w-3.5" />
          <span>AI CAREER COMMAND CENTER v2.0</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto max-w-5xl font-black tracking-tight text-white uppercase text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.05]"
        >
          YOUR CAREER.<br />
          <span className="text-orange-500 text-glow-orange">YOUR STORY.</span><br />
          YOUR NEXT CHAPTER.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-zinc-300 font-medium text-base sm:text-lg leading-relaxed"
        >
          Build an ATS-friendly resume, tailor it to any job, and turn your experience into a resume recruiters can quickly understand.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/resumes/create"
            data-cursor="CREATE"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl border-2 border-orange-500 bg-orange-500 px-8 py-4 font-black text-black text-sm tracking-wider uppercase shadow-[0_0_25px_rgba(249,115,22,0.5)] hover:bg-orange-400 hover:scale-105 transition-all"
          >
            <span>CREATE MY RESUME</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/jobs/analyze"
            data-cursor="ANALYZE"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border-2 border-zinc-700 bg-zinc-900/90 px-8 py-4 font-black text-white text-sm tracking-wider uppercase hover:border-orange-500 hover:bg-zinc-800 transition-all"
          >
            <Target className="h-4 w-4 text-orange-400" />
            <span>ANALYZE A JOB</span>
          </Link>
        </motion.div>

        {/* Hero Interactive Command Center Visual */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="relative mx-auto mt-16 max-w-5xl rounded-2xl border-2 border-orange-500/40 bg-[#0d0d12] p-4 text-left shadow-[0_0_40px_rgba(249,115,22,0.25)]"
        >
          <div className="flex items-center justify-between border-b border-orange-500/20 pb-3 px-2">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-rose-500" />
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="ml-2 font-mono text-xs text-orange-400 font-bold">LIVE AI SCANNER MOCKUP</span>
            </div>
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] font-black text-emerald-400 uppercase border border-emerald-500/30">
              STATUS: READY TO APPLY
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4 p-2">
            {/* Blank Resume Scanner */}
            <div className="md:col-span-4 rounded-xl border border-zinc-800 bg-[#09090b] p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-orange-500 shadow-[0_0_10px_#f97316] animate-scan" />
              <div className="text-xs font-mono text-zinc-400 font-bold uppercase mb-2">RAW RESUME DOCUMENT</div>
              <div className="space-y-2">
                <div className="h-4 w-3/4 rounded bg-zinc-800" />
                <div className="h-3 w-full rounded bg-zinc-900" />
                <div className="h-3 w-5/6 rounded bg-zinc-900" />
                <div className="mt-3 h-16 w-full rounded border border-orange-500/30 bg-orange-500/10 p-2 text-[11px] font-mono text-orange-300">
                  AI SCAN: Extracted 14 skills, 3 projects, 4 experience bullets.
                </div>
              </div>
            </div>

            {/* Keyword Connection Engine */}
            <div className="md:col-span-5 rounded-xl border border-zinc-800 bg-[#09090b] p-4">
              <div className="text-xs font-mono text-zinc-400 font-bold uppercase mb-2">KEYWORD MATCHING NODES</div>
              <div className="space-y-2">
                {[
                  { key: 'Python & SQL', match: '100% MATCH', color: 'text-emerald-400' },
                  { key: 'Cloud Architecture (AWS)', match: 'TAILORED', color: 'text-orange-400' },
                  { key: 'Cross-functional Leadership', match: 'VERIFIED', color: 'text-emerald-400' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between rounded bg-zinc-900 p-2 text-xs font-mono">
                    <span className="text-zinc-300 font-semibold">{item.key}</span>
                    <span className={`font-black ${item.color}`}>{item.match}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Diagnostic Score Card */}
            <div className="md:col-span-3 rounded-xl border-2 border-orange-500/40 bg-orange-500/10 p-4 flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-mono font-black text-orange-400 uppercase">DIAGNOSTIC METRICS</div>
                <div className="mt-2 text-3xl font-black text-white">92%</div>
                <div className="text-xs font-bold text-emerald-400">ATS COMPATIBLE</div>
              </div>
              <div className="mt-4 text-[10px] text-zinc-400 font-mono">
                Clean formatting • Verified experience • Recruiter ready
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 6-CHAPTER STORY-DRIVEN SCROLL */}
      <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="font-mono text-xs font-black tracking-widest text-orange-500 uppercase">
            THE CAREER STORYLINE
          </span>
          <h2 className="mt-2 text-3xl font-black text-white uppercase sm:text-5xl">
            HOW YOUR STORY UNFOLDS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ComicPanel panelTag="CHAPTER 01" title="START WITH YOU" subtitle="Master Profile Engine">
            <p className="text-xs text-zinc-400 leading-relaxed">
              Create a permanent Master Profile. Keep all your real achievements, degrees, and skills in one secure place that is never overwritten.
            </p>
            <div className="mt-4 font-mono text-[11px] font-bold text-orange-400 uppercase">
              • Fresher • Experienced • Career Changer
            </div>
          </ComicPanel>

          <ComicPanel panelTag="CHAPTER 02" title="FIND YOUR TARGET" subtitle="Job Description Extractor">
            <p className="text-xs text-zinc-400 leading-relaxed">
              Paste any job description from LinkedIn, Indeed, or company sites. AI instantly extracts required skills, tools, and responsibilities.
            </p>
            <div className="mt-4 font-mono text-[11px] font-bold text-orange-400 uppercase">
              • Technical • Soft Skills • Hard Requirements
            </div>
          </ComicPanel>

          <ComicPanel panelTag="CHAPTER 03" title="CONNECT THE DOTS" subtitle="Anti-Hallucination AI">
            <p className="text-xs text-zinc-400 leading-relaxed">
              Our AI connects target job requirements with your genuine background. Zero fake employers, zero invented degrees.
            </p>
            <div className="mt-4 font-mono text-[11px] font-bold text-orange-400 uppercase">
              • Truth-Bound • Verified Experience
            </div>
          </ComicPanel>

          <ComicPanel panelTag="CHAPTER 04" title="BUILD PERFECT VERSION" subtitle="Interactive Editor">
            <p className="text-xs text-zinc-400 leading-relaxed">
              Edit bullets, accept or reject AI improvements in real time, and switch between 15 professional ATS templates with zero content loss.
            </p>
            <div className="mt-4 font-mono text-[11px] font-bold text-orange-400 uppercase">
              • 15 Templates • Live Zoom Preview
            </div>
          </ComicPanel>

          <ComicPanel panelTag="CHAPTER 05" title="MAKE IT ATS-READY" subtitle="Futuristic ATS Scanner">
            <p className="text-xs text-zinc-400 leading-relaxed">
              Pass your resume through our top-to-bottom laser beam scanner. Review 3 separate diagnostic scores for Match, ATS, and Quality.
            </p>
            <div className="mt-4 font-mono text-[11px] font-bold text-orange-400 uppercase">
              • 3 Scores • Issue Detector
            </div>
          </ComicPanel>

          <ComicPanel panelTag="CHAPTER 06" title="GO GET THE INTERVIEW" subtitle="Complete Application Package">
            <p className="text-xs text-zinc-400 leading-relaxed">
              Download clean PDF and DOCX files. Generate matching cover letters, practice targeted interview questions, and track applications.
            </p>
            <div className="mt-4 font-mono text-[11px] font-bold text-orange-400 uppercase">
              • PDF / DOCX • Cover Letter • Interview
            </div>
          </ComicPanel>
        </div>
      </section>

      {/* ANIMATED CAREER UNIVERSE CAROUSEL */}
      <section className="border-t-2 border-orange-500/20 bg-[#0c0c10] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="font-mono text-xs font-black tracking-widest text-orange-500 uppercase">
              UNIVERSAL CAREER SUPPORT
            </span>
            <h2 className="mt-2 text-3xl font-black text-white uppercase sm:text-4xl">
              WHATEVER THE ROLE. BUILD THE RESUME FOR IT.
            </h2>
          </div>

          <div className="mt-10 flex overflow-x-auto pb-6 space-x-4 scrollbar-none">
            {careerWorlds.map((world, idx) => (
              <button
                key={idx}
                onClick={() => setActiveUniverse(idx)}
                className={`flex-none w-72 rounded-xl border-2 p-5 text-left transition-all ${
                  activeUniverse === idx
                    ? 'border-orange-500 bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.3)]'
                    : 'border-zinc-800 bg-[#09090b] hover:border-zinc-700'
                }`}
              >
                <div className="font-mono text-[10px] font-black text-orange-400 uppercase">CAREER DISCIPLINE 0{idx + 1}</div>
                <h3 className="mt-1 font-extrabold text-white text-base">{world.title}</h3>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {world.skills.map((s, si) => (
                    <span key={si} className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-300">
                      {s}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="relative border-t-2 border-orange-500/20 bg-[#09090b] py-24 text-center">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-4xl font-black text-white uppercase sm:text-6xl">
            YOUR STORY DESERVES MORE THAN A GENERIC RESUME.
          </h2>
          <p className="mt-4 text-zinc-400 font-medium text-base sm:text-lg">
            Build it. Tailor it. Optimize it. Apply.
          </p>
          <div className="mt-10">
            <Link
              href="/resumes/create"
              data-cursor="START"
              className="inline-flex items-center justify-center gap-3 rounded-xl border-2 border-orange-500 bg-orange-500 px-10 py-5 font-black text-black text-base tracking-widest uppercase shadow-[0_0_30px_rgba(249,115,22,0.6)] hover:bg-orange-400 hover:scale-105 transition-all"
            >
              <span>ENTER THE EXPERIENCE</span>
              <ArrowRight className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

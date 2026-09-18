'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  UploadCloud,
  CheckCircle2,
  FileCheck,
  Target,
  Zap,
  ShieldCheck,
  Download,
  Eye,
  Sliders,
  HelpCircle,
  BarChart3,
  Layers,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden bg-zinc-950 text-white">
      {/* Subtle Background Glow Spheres */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-orange-600/15 via-violet-600/10 to-transparent blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-orange-500/30 text-xs font-semibold text-orange-400 mb-8 shadow-lg shadow-orange-500/10"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Gen ATS Resume Intelligence & AI Tailoring</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1]"
        >
          Turn your resume into your <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-violet-400">next opportunity</span>.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed"
        >
          Analyze job descriptions, discover what your resume is missing, and create a tailored ATS-friendly version based on your real experience.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/resumes/new"
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-black bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <span>Analyze My Resume</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-zinc-300 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors flex items-center justify-center"
          >
            See How It Works
          </a>
        </motion.div>

        {/* Animated Product Preview Window */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 max-w-5xl mx-auto p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 shadow-2xl backdrop-blur-xl relative"
        >
          <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800/80 bg-zinc-950/60 rounded-t-xl">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="text-xs text-zinc-500 ml-2 font-mono">resumeforge.ai/dashboard/analysis</span>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
            {/* Left Score Card */}
            <div className="md:col-span-4 p-5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex flex-col items-center justify-center">
              <div className="w-32 h-32 rounded-full border-8 border-orange-500/30 border-t-orange-500 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">86%</span>
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Match Score</span>
              </div>
              <div className="w-full mt-4 space-y-1.5 text-xs text-zinc-400">
                <div className="flex justify-between"><span>Skills Match</span><span className="text-emerald-400 font-bold">92%</span></div>
                <div className="flex justify-between"><span>Keyword Density</span><span className="text-orange-400 font-bold">81%</span></div>
                <div className="flex justify-between"><span>Experience Level</span><span className="text-emerald-400 font-bold">88%</span></div>
              </div>
            </div>

            {/* Middle & Right Content */}
            <div className="md:col-span-8 space-y-4">
              <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-4 h-4" /> Keyword Intelligence
                  </span>
                  <span className="text-[11px] text-zinc-500">3 Missing Critical Keywords</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-medium">✓ Python</span>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-medium">✓ SQL</span>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-medium">✓ React</span>
                  <span className="px-2.5 py-1 rounded-md bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-medium">× Docker</span>
                  <span className="px-2.5 py-1 rounded-md bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-medium">× PostgreSQL</span>
                  <span className="px-2.5 py-1 rounded-md bg-amber-950/80 border border-amber-800 text-amber-300 text-xs font-medium">△ AWS ETL</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800">
                <div className="text-xs font-bold text-white mb-1">AI Tailoring Preview [Change Tracking]</div>
                <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono space-y-1">
                  <div className="text-rose-400 line-through">- Responsible for building backend database queries.</div>
                  <div className="text-emerald-400">+ Spearheaded high-concurrency SQL & PostgreSQL database queries, reducing API latency by 32%.</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 border-t border-zinc-900 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-widest text-orange-500">Simple 5-Step Process</h2>
            <p className="text-3xl font-extrabold text-white mt-2">How ResumeForge AI Works</p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { step: '01', title: 'Upload Resume', desc: 'Upload PDF, DOCX, or TXT. Structured data is extracted instantly.' },
              { step: '02', title: 'Paste Job Post', desc: 'Paste the target job description to extract required skills & duties.' },
              { step: '03', title: 'Analyze Match', desc: 'Transparent sub-score math evaluates skills, keywords & mistakes.' },
              { step: '04', title: 'AI Tailor', desc: 'Confirm your skills and let AI rewrite bullet points without fake claims.' },
              { step: '05', title: 'Export PDF/DOCX', desc: 'Select from 6 ATS templates and export print-ready documents.' },
            ].map((s) => (
              <div key={s.step} className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 relative">
                <span className="text-2xl font-black text-orange-500 font-mono">{s.step}</span>
                <h3 className="text-base font-bold text-white mt-2">{s.title}</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Deep Dives */}
      <section className="py-20 border-t border-zinc-900 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Analysis & Scoring */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-white">Transparent & Explainable Matching Engine</h3>
              <p className="text-zinc-400 text-sm mt-3 leading-relaxed">
                No black-box guesses. We calculate component sub-scores for Skills (30%), Keywords (25%), Experience (20%), Responsibilities (15%), and Education (10%) to give you an explainable compatibility score.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
              <div className="flex justify-between items-center text-xs border-b border-zinc-800 pb-2">
                <span className="text-zinc-300 font-medium">Skills Match Score</span>
                <span className="text-emerald-400 font-bold">91%</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-zinc-800 pb-2">
                <span className="text-zinc-300 font-medium">Keyword Intelligence Score</span>
                <span className="text-orange-400 font-bold">78%</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-zinc-800 pb-2">
                <span className="text-zinc-300 font-medium">Experience & Verb Alignment</span>
                <span className="text-emerald-400 font-bold">84%</span>
              </div>
            </div>
          </div>

          {/* AI Tailoring & Change Tracking */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="order-2 md:order-1 p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs">
                <span className="inline-block px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono text-[10px] uppercase font-bold mb-1">REWRITTEN</span>
                <p className="text-zinc-300">Updated bullet point to incorporate action verb "Spearheaded" and target keyword "PostgreSQL".</p>
                <div className="mt-2 flex gap-2">
                  <button className="px-2.5 py-1 rounded bg-emerald-600 text-white font-semibold text-[11px]">Accept</button>
                  <button className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-400 font-semibold text-[11px]">Reject</button>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-white">Strict Anti-Hallucination AI Tailoring</h3>
              <p className="text-zinc-400 text-sm mt-3 leading-relaxed">
                Our AI will NEVER fabricate job titles, degrees, or unearned awards. Every change is clearly diffed with ADDED, REMOVED, REWRITTEN, or REORDERED tags for your approval.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6 ATS Templates Showcase */}
      <section className="py-20 border-t border-zinc-900 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-widest text-orange-500">ATS Optimized Templates</h2>
            <p className="text-3xl font-extrabold text-white mt-2">6 Professional Design Layouts</p>
            <p className="text-zinc-400 text-sm mt-2">Switch templates instantly with zero content loss.</p>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {['Classic', 'Modern', 'Minimal', 'Technical', 'Data Analyst', 'Professional'].map((t) => (
              <div key={t} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center hover:border-orange-500/50 transition-colors">
                <div className="w-full h-32 bg-zinc-950 rounded-lg border border-zinc-800/80 mb-3 flex flex-col p-2 space-y-1">
                  <div className="h-2 w-3/4 bg-zinc-700 rounded" />
                  <div className="h-1.5 w-full bg-zinc-800 rounded" />
                  <div className="h-1.5 w-5/6 bg-zinc-800 rounded" />
                  <div className="h-1.5 w-4/5 bg-zinc-800 rounded" />
                </div>
                <span className="text-xs font-bold text-zinc-200">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 border-t border-zinc-900 bg-zinc-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Does ResumeForge AI invent fake experience?', a: 'No! ResumeForge AI operates under strict anti-hallucination guardrails. It never invents employers, titles, metrics, or skills you do not possess.' },
              { q: 'How does the Match Score work?', a: 'Our transparent engine evaluates 5 sub-categories: Required Skills, Keyword Density, Experience Alignment, Responsibilities, and Education requirements.' },
              { q: 'Can I export to Word (.docx)?', a: 'Yes! We support native Microsoft Word (.docx) export as well as high-fidelity PDF downloads.' },
              { q: 'Are my resumes private?', a: 'Yes. All resumes and analyses are strictly encrypted and private to your authenticated user account.' },
            ].map((faq, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-orange-400" />
                  {faq.q}
                </h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-zinc-900 bg-gradient-to-b from-zinc-950 to-zinc-900 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-extrabold text-white">Ready to land your next interview?</h2>
          <p className="text-zinc-400 mt-4 max-w-xl mx-auto text-base">
            Upload your resume now and get your instant transparent match report and tailored ATS build in under 60 seconds.
          </p>
          <div className="mt-8">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-extrabold text-black bg-orange-500 hover:bg-orange-400 shadow-xl shadow-orange-500/20 text-base transition-transform transform hover:scale-105"
            >
              Get Started for Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

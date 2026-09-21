'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  FileText,
  HelpCircle,
  BarChart3,
  Kanban,
  CheckCircle2,
  Briefcase,
  Layers,
  Award,
  Globe,
  GraduationCap,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden bg-zinc-950 text-white">
      {/* Background Glow Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-orange-600/15 via-violet-600/10 to-transparent blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-orange-500/30 text-xs font-semibold text-orange-400 mb-8 shadow-lg shadow-orange-500/10"
        >
          <Sparkles className="w-3.5 h-3.5 text-orange-400" />
          <span>Universal AI Resume Builder & Job Application Platform</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1]"
        >
          Build a Resume That <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-violet-400">Fits the Job</span>.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed"
        >
          Create, tailor and optimize professional resumes for any career using AI — while keeping your real experience at the center.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/profile"
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-black bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <span>Build My Resume</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/jobs/new"
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-zinc-300 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
          >
            <Target className="w-4 h-4 text-orange-400" />
            <span>Analyze a Job</span>
          </Link>
        </motion.div>

        {/* Product Preview Dashboard Mockup */}
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
            <span className="text-xs text-zinc-500 ml-2 font-mono">resumeforge.ai/dashboard</span>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
            {/* 3 Diagnostic Metrics */}
            <div className="md:col-span-4 p-5 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-3">
              <div className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-2">3 Diagnostic Metrics</div>
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800/80 flex justify-between items-center">
                <span className="text-xs text-zinc-300 font-medium">Job Match</span>
                <span className="text-sm font-black text-emerald-400">88%</span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800/80 flex justify-between items-center">
                <span className="text-xs text-zinc-300 font-medium">ATS Compatibility</span>
                <span className="text-sm font-black text-amber-400">92%</span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800/80 flex justify-between items-center">
                <span className="text-xs text-zinc-300 font-medium">Resume Quality</span>
                <span className="text-sm font-black text-emerald-400">86%</span>
              </div>
            </div>

            {/* Platform Modules Stack */}
            <div className="md:col-span-8 grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800">
                <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
                <div className="text-xs font-bold text-white">Master Profile</div>
                <p className="text-[11px] text-zinc-400 mt-1">Single source of truth. Never overwritten during tailoring.</p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800">
                <FileText className="w-5 h-5 text-orange-400 mb-2" />
                <div className="text-xs font-bold text-white">Cover Letter Generator</div>
                <p className="text-[11px] text-zinc-400 mt-1">Tailored in 5 distinct styles using real background.</p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800">
                <HelpCircle className="w-5 h-5 text-violet-400 mb-2" />
                <div className="text-xs font-bold text-white">Interview Practice</div>
                <p className="text-[11px] text-zinc-400 mt-1">HR, Technical, Behavioral questions & answer frameworks.</p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800">
                <Kanban className="w-5 h-5 text-blue-400 mb-2" />
                <div className="text-xs font-bold text-white">Application Tracker</div>
                <p className="text-[11px] text-zinc-400 mt-1">Kanban tracking for applications, interviews, & offers.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Universal Career Support Section */}
      <section className="py-20 border-t border-zinc-900 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-widest text-orange-500">Universal Career Engine</h2>
            <p className="text-3xl font-extrabold text-white mt-2">Built for IT & Non-IT Professions</p>
            <p className="text-zinc-400 text-sm mt-2">
              From Software Engineers & Data Scientists to Accountants, Nurses, Teachers, and Sales Executives.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { cat: 'IT & Software', roles: 'Developers, Data Analysts, DevOps, UI/UX' },
              { cat: 'Finance & Accounting', roles: 'Accountants, Financial Analysts, Auditors' },
              { cat: 'Healthcare & Nursing', roles: 'Nurses, Healthcare Admins, Clinical Specialists' },
              { cat: 'Sales & Marketing', roles: 'Executives, Managers, Digital Marketers' },
              { cat: 'Education & Teaching', roles: 'Teachers, Lecturers, Academic Researchers' },
              { cat: 'Engineering & Construction', roles: 'Mechanical, Civil, Electrical Engineers' },
              { cat: 'HR & Operations', roles: 'Recruiters, HR Executives, Logistics Leads' },
              { cat: 'Freshers & Graduates', roles: 'Interns, Students, Academic Honors' },
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                <div className="text-xs font-bold text-white">{item.cat}</div>
                <div className="text-[11px] text-zinc-400 mt-1 leading-snug">{item.roles}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 15 ATS Templates Section */}
      <section className="py-20 border-t border-zinc-900 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-widest text-orange-500">15 ATS & Professional Templates</h2>
            <p className="text-3xl font-extrabold text-white mt-2">Clean, Parsing-Tested Layouts</p>
            <p className="text-zinc-400 text-sm mt-2">Switch templates instantly in live preview with zero content loss.</p>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              'ATS Classic', 'ATS Executive', 'ATS Modern', 'Minimalist', 'Corporate',
              'Technical Grid', 'Data Analyst', 'Academic', 'Healthcare', 'Creative',
              'Fresher Graduate', 'Management', 'Sales & Marketing', 'Operations', 'Compact'
            ].map((t) => (
              <div key={t} className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center hover:border-orange-500/50 transition-colors">
                <div className="w-full h-24 bg-zinc-950 rounded border border-zinc-800 mb-2 flex flex-col p-2 space-y-1">
                  <div className="h-2 w-2/3 bg-zinc-700 rounded" />
                  <div className="h-1.5 w-full bg-zinc-800 rounded" />
                  <div className="h-1.5 w-4/5 bg-zinc-800 rounded" />
                </div>
                <span className="text-xs font-semibold text-zinc-300">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 border-t border-zinc-900 bg-zinc-950">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-white text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'What is the Master Profile?', a: 'Your Master Profile is a permanent single repository of your entire background. Tailoring a resume creates a separate version and never overwrites your Master Profile.' },
              { q: 'Does ResumeForge AI invent fake credentials?', a: 'Never. Our AI operates under strict anti-hallucination guardrails and only uses skills, experience, and projects supported by your background.' },
              { q: 'How do the 3 metrics differ?', a: 'Job Match measures relevance to the target job description. ATS Compatibility measures structural and parsing validity. Resume Quality measures writing clarity and verb impact.' },
              { q: 'Can I export to DOCX and PDF?', a: 'Yes! High-fidelity PDF exports and native Microsoft Word (.docx) files are both fully supported.' },
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

      {/* CTA */}
      <section className="py-20 border-t border-zinc-900 bg-gradient-to-b from-zinc-950 to-zinc-900 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-extrabold text-white">Start Building Your Resume Today</h2>
          <p className="text-zinc-400 mt-4 max-w-xl mx-auto text-base">
            Join job seekers creating job-tailored resumes, cover letters, and interview preparation workspace in seconds.
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

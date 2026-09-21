'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Layout, Check, Sparkles, Eye, ShieldCheck } from 'lucide-react';
import { ComicPanel } from '@/components/ui/comic/ComicPanel';

export default function TemplatesGalleryPage() {
  const [activeFilter, setActiveFilter] = useState('ALL');

  const templates = [
    { id: 'classic', name: 'ATS CLASSIC', category: 'EXECUTIVE', tag: 'ATS SAFE', desc: 'Traditional corporate typography with clean hierarchy.' },
    { id: 'modern', name: 'ATS MODERN', category: 'MODERN', tag: 'RECOMMENDED', desc: 'Sleek accent bar with split contact header.' },
    { id: 'minimal', name: 'MINIMALIST', category: 'MINIMAL', tag: 'ATS SAFE', desc: 'Typography-focused layout with maximum whitespace.' },
    { id: 'technical', name: 'TECHNICAL GRID', category: 'TECH', tag: 'DEV FOCUS', desc: 'Structured technical skill grid and repository highlights.' },
    { id: 'dataanalyst', name: 'DATA ANALYST', category: 'ANALYTICS', tag: 'METRICS', desc: 'Analytical cards emphasizing quantified outcomes.' },
    { id: 'professional', name: 'ATS EXECUTIVE', category: 'EXECUTIVE', tag: 'CORPORATE', desc: 'Executive presentation format for senior leadership.' },
    { id: 'academic', name: 'ACADEMIC & RESEARCH', category: 'ACADEMIC', tag: 'PUBLICATIONS', desc: 'Education-first structure emphasizing papers & grants.' },
    { id: 'healthcare', name: 'HEALTHCARE & CLINICAL', category: 'MEDICAL', tag: 'LICENSES', desc: 'Highlights clinical rotations, certifications, & licenses.' },
    { id: 'creative', name: 'CREATIVE & PORTFOLIO', category: 'CREATIVE', tag: 'EDITORIAL', desc: 'Visual portfolio accent hierarchy for designers & copywriters.' },
    { id: 'fresher', name: 'FRESHER & GRADUATE', category: 'FRESHER', tag: 'PROJECTS', desc: 'Prioritizes academic projects, coursework, & leadership.' },
  ];

  const filtered = activeFilter === 'ALL'
    ? templates
    : templates.filter((t) => t.category === activeFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen text-white">
      <div className="text-center mb-10">
        <span className="font-mono text-xs font-black text-orange-500 uppercase tracking-widest">
          EDITORIAL ATS GALLERY
        </span>
        <h1 className="text-4xl sm:text-5xl font-black uppercase text-white mt-2">
          COLLECTIBLE <span className="text-orange-500 text-glow-orange">ATS TEMPLATES</span>
        </h1>
        <p className="mt-3 text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto font-medium">
          Switch templates instantly in live builder with 0% content loss. Designed for recruiter readability and ATS parsing.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-10 font-mono">
        {['ALL', 'TECH', 'ANALYTICS', 'EXECUTIVE', 'FRESHER', 'ACADEMIC', 'MEDICAL', 'CREATIVE'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-3 py-1.5 rounded border text-xs font-black tracking-wider uppercase transition-all ${
              activeFilter === cat
                ? 'border-orange-500 bg-orange-500 text-black shadow-[0_0_10px_rgba(249,115,22,0.4)]'
                : 'border-zinc-800 bg-[#0d0d12] text-zinc-400 hover:border-zinc-700 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((t, idx) => (
          <ComicPanel key={t.id} panelTag={t.tag} title={t.name} subtitle={t.desc}>
            <div className="my-4 h-48 w-full rounded border border-zinc-800 bg-zinc-950 p-3 relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-2">
                <div className="h-3 w-1/2 bg-zinc-700 rounded" />
                <div className="h-2 w-3/4 bg-zinc-800 rounded" />
                <div className="h-2 w-full bg-zinc-900 rounded" />
                <div className="h-2 w-5/6 bg-zinc-900 rounded" />
              </div>
              <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500 border-t border-zinc-900 pt-2">
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <ShieldCheck className="h-3 w-3" /> ATS PARSED OK
                </span>
                <span>ID: {t.id}</span>
              </div>
            </div>

            <Link
              href={`/profile`}
              data-cursor="USE"
              className="w-full py-2.5 rounded border-2 border-orange-500 bg-orange-500 text-black font-black text-xs uppercase flex items-center justify-center gap-2 hover:bg-orange-400 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>USE THIS TEMPLATE</span>
            </Link>
          </ComicPanel>
        ))}
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Plus,
  FileText,
  Briefcase,
  Zap,
  TrendingUp,
  ArrowRight,
  Eye,
  ShieldCheck,
  Scan,
  Kanban,
  HelpCircle,
  Layout,
  PlusCircle,
} from 'lucide-react';
import { ComicPanel } from '@/components/ui/comic/ComicPanel';

interface AnalysisSummary {
  id: string;
  overallScore: number;
  createdAt: string;
  resume: { id: string; name: string };
  jobDescription: { title: string; company: string };
}

export default function DashboardPage() {
  const router = useRouter();
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
  const [resumeCount, setResumeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [resumesRes, analysesRes] = await Promise.all([
          fetch('/api/resumes'),
          fetch('/api/analyses'),
        ]);

        if (resumesRes.status === 401 || analysesRes.status === 401) {
          router.push('/login');
          return;
        }

        const resumesData = await resumesRes.json();
        const analysesData = await analysesRes.json();

        setResumeCount(resumesData.resumes?.length || 0);
        setAnalyses(analysesData.analyses || []);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [router]);

  const avgMatchScore =
    analyses.length > 0
      ? Math.round(analyses.reduce((acc, a) => acc + a.overallScore, 0) / analyses.length)
      : 0;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div className="h-10 w-48 bg-zinc-900 animate-pulse rounded-lg border border-zinc-800" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-zinc-900 animate-pulse rounded-xl border border-zinc-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b-2 border-orange-500/20 pb-6">
        <div>
          <span className="font-mono text-xs font-black text-orange-500 uppercase tracking-widest">
            CAREER COMMAND CENTER
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            YOUR HQ DASHBOARD
          </h1>
        </div>
        <Link
          href="/resumes/create"
          data-cursor="NEW"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-orange-500 bg-orange-500 text-black font-black text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:bg-orange-400 transition-all"
        >
          <PlusCircle className="w-4 h-4 stroke-[3]" />
          <span>+ CREATE RESUME</span>
        </Link>
      </div>

      {/* Large Visual Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="comic-border rounded-xl bg-[#0d0d12] p-5">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono font-bold uppercase">
            <span>RESUMES LAB</span>
            <FileText className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-4xl font-black text-white mt-2 font-mono">0{resumeCount}</div>
          <div className="text-[10px] text-zinc-500 font-mono mt-1">Uploaded & Tailored Builds</div>
        </div>

        <div className="comic-border rounded-xl bg-[#0d0d12] p-5">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono font-bold uppercase">
            <span>JOBS ANALYZED</span>
            <Briefcase className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-4xl font-black text-white mt-2 font-mono">{analyses.length < 10 ? `0${analyses.length}` : analyses.length}</div>
          <div className="text-[10px] text-zinc-500 font-mono mt-1">Target Descriptions</div>
        </div>

        <div className="comic-border rounded-xl bg-[#0d0d12] p-5">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono font-bold uppercase">
            <span>AVERAGE MATCH</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-4xl font-black text-emerald-400 mt-2 font-mono">
            {avgMatchScore > 0 ? `${avgMatchScore}%` : 'N/A'}
          </div>
          <div className="text-[10px] text-zinc-500 font-mono mt-1">Diagnostic Alignment</div>
        </div>

        <div className="comic-border rounded-xl bg-[#0d0d12] p-5">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono font-bold uppercase">
            <span>ATS READINESS</span>
            <Scan className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-4xl font-black text-white mt-2 font-mono">HIGH</div>
          <div className="text-[10px] text-zinc-500 font-mono mt-1">Clean Parsing Verified</div>
        </div>
      </div>

      {/* Portal Cards Grid */}
      <div className="mb-10">
        <h2 className="text-xl font-black text-white uppercase tracking-wider mb-4 font-mono">
          COMMAND PORTALS
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/profile" data-cursor="PROFILE">
            <ComicPanel panelTag="PORTAL 01" title="MASTER PROFILE" subtitle="Single Source of Truth">
              <p className="text-xs text-zinc-400">Manage permanent background records across education, experience, and verified skills.</p>
            </ComicPanel>
          </Link>

          <Link href="/jobs/analyze" data-cursor="ANALYZE">
            <ComicPanel panelTag="PORTAL 02" title="JOB ANALYZER" subtitle="Requirement Extractor">
              <p className="text-xs text-zinc-400">Extract skills, keywords, and responsibilities from any job description.</p>
            </ComicPanel>
          </Link>

          <Link href="/ats" data-cursor="SCAN">
            <ComicPanel panelTag="PORTAL 03" title="ATS SCANNER" subtitle="Laser Diagnostic Lab">
              <p className="text-xs text-zinc-400">Pass document through top-to-bottom scanner to identify formatting & keyword issues.</p>
            </ComicPanel>
          </Link>
        </div>
      </div>

      {/* Recent Analyses Section */}
      <div>
        <h2 className="text-xl font-black text-white uppercase tracking-wider mb-4 font-mono">
          RECENT TARGET ANALYSES
        </h2>

        {analyses.length === 0 ? (
          <ComicPanel panelTag="EMPTY LAB" title="NO JOBS ANALYZED YET" subtitle="Start by analyzing a job description">
            <div className="py-6 text-center">
              <Zap className="h-10 w-10 text-orange-400 mx-auto mb-3 animate-pulse" />
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Upload your resume and paste a job description to calculate your 3 diagnostic scores & generate a tailored version.
              </p>
              <div className="mt-6">
                <Link
                  href="/jobs/analyze"
                  className="inline-flex items-center gap-2 rounded border-2 border-orange-500 bg-orange-500 px-6 py-2.5 font-black text-black text-xs uppercase"
                >
                  <span>ANALYZE FIRST JOB</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </ComicPanel>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyses.map((item) => (
              <ComicPanel
                key={item.id}
                panelTag={`SCORE ${item.overallScore}%`}
                title={item.jobDescription.title}
                subtitle={item.jobDescription.company}
              >
                <div className="flex justify-between items-center text-xs text-zinc-400 font-mono mb-4">
                  <span>Resume: {item.resume.name}</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                <Link
                  href={`/analysis/${item.id}`}
                  data-cursor="VIEW"
                  className="w-full py-2 px-4 rounded border border-orange-500/40 bg-orange-500/10 hover:bg-orange-500 hover:text-black text-orange-400 font-black text-xs uppercase flex items-center justify-center gap-2 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>VIEW ANALYSIS</span>
                </Link>
              </ComicPanel>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

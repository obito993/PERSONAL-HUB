'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, FileText, Briefcase, Sparkles, TrendingUp, ArrowRight, Eye, AlertCircle } from 'lucide-react';

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
        <div className="h-10 w-48 bg-zinc-900 animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-zinc-900 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Dashboard</h1>
          <p className="text-xs text-zinc-400 mt-1">Overview of your ATS resume analyses & tailored versions</p>
        </div>
        <Link
          href={resumeCount === 0 ? '/resumes/new' : '/jobs/new'}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-extrabold text-sm shadow-lg shadow-orange-500/20 transition-transform transform hover:scale-105"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ New Analysis</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Total Resumes</span>
            <FileText className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-3xl font-black text-white mt-2">{resumeCount}</div>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Total Analyses</span>
            <Briefcase className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-3xl font-black text-white mt-2">{analyses.length}</div>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Tailored Builds</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white mt-2">{analyses.length}</div>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Average Match Score</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white mt-2">
            {avgMatchScore > 0 ? `${avgMatchScore}%` : 'N/A'}
          </div>
        </div>
      </div>

      {/* Recent Analyses Section */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Recent Analyses</h2>

        {analyses.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800 border-dashed">
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400 mb-3">
              <Sparkles className="w-6 h-6 text-orange-400" />
            </div>
            <h3 className="text-lg font-bold text-white">No job descriptions analyzed yet</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              Upload your resume and paste a job description to calculate your match score & ATS fixes.
            </p>
            <div className="mt-6">
              <Link
                href="/resumes/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs"
              >
                Upload Your Resume <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyses.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -2 }}
                className="p-5 rounded-xl bg-zinc-900/70 border border-zinc-800 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div>
                      <h3 className="font-bold text-white text-base line-clamp-1">{item.jobDescription.title}</h3>
                      <p className="text-xs text-orange-400 font-medium">{item.jobDescription.company}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xl font-extrabold text-white">{item.overallScore}%</span>
                      <span className="text-[10px] text-zinc-500 uppercase font-bold">Match</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800/80 text-xs text-zinc-400 flex justify-between items-center">
                    <span>Resume: <span className="text-zinc-200">{item.resume.name}</span></span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-5">
                  <Link
                    href={`/analysis/${item.id}`}
                    className="w-full py-2 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Analysis</span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Zap, ArrowRight, Loader2, Target, CheckCircle2, AlertCircle, Scan } from 'lucide-react';
import { ComicPanel } from '@/components/ui/comic/ComicPanel';
import { ParsedJob } from '@/types';

interface ResumeSelectOption {
  id: string;
  name: string;
}

function JobAnalyzeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialResumeId = searchParams.get('resumeId') || '';

  const [resumes, setResumes] = useState<ResumeSelectOption[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState(initialResumeId);
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');

  const [extractedJob, setExtractedJob] = useState<ParsedJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [isFragmenting, setIsFragmenting] = useState(false);

  useEffect(() => {
    fetch('/api/resumes')
      .then((res) => (res.ok ? res.json() : { resumes: [] }))
      .then((data) => {
        setResumes(data.resumes || []);
        if (!selectedResumeId && data.resumes && data.resumes.length > 0) {
          setSelectedResumeId(data.resumes[0].id);
        }
      });
  }, [selectedResumeId]);

  const handleExtractJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !company || !description) {
      setError('Please provide job title, company name, and job description.');
      return;
    }
    setError('');
    setLoading(true);
    setIsFragmenting(true);

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, company, description, url }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to save job posting.');
        setLoading(false);
        setIsFragmenting(false);
        return;
      }

      setTimeout(() => {
        setExtractedJob(data.job.structuredData);
        setIsFragmenting(false);
      }, 800);
    } catch {
      setError('An unexpected error occurred.');
      setIsFragmenting(false);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAnalysis = async () => {
    if (!selectedResumeId) {
      setError('Please select a resume to match against.');
      return;
    }
    setAnalyzing(true);
    setError('');

    try {
      const jobRes = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, company, description, url }),
      });

      const jobData = await jobRes.json();
      const jobId = jobData.job?.id;

      if (!jobId) {
        setError('Unable to save job record.');
        setAnalyzing(false);
        return;
      }

      const analysisRes = await fetch('/api/analyses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId: selectedResumeId, jobDescriptionId: jobId }),
      });

      const analysisData = await analysisRes.json();
      if (!analysisRes.ok) {
        setError(analysisData.error || 'Failed to analyze resume.');
        setAnalyzing(false);
        return;
      }

      router.push(`/analysis/${analysisData.analysisId}`);
    } catch {
      setError('An error occurred during match analysis.');
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 min-h-screen text-white">
      <div className="mb-8 text-center">
        <span className="font-mono text-xs font-black text-orange-500 uppercase tracking-widest">
          AI INVESTIGATION ROOM
        </span>
        <h1 className="text-3xl sm:text-4xl font-black uppercase text-white mt-1">
          JOB DESCRIPTION <span className="text-orange-500 text-glow-orange">ANALYZER</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-1 font-mono">
          PASTE A JOB POSTING TO FRAGMENT TEXT INTO RECOGNIZED SKILLS, TOOLS, & KEYWORDS
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border-2 border-rose-600 text-rose-300 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Resume Selector */}
        <ComicPanel panelTag="TARGET RESUME" title="SELECT RESUME TO MATCH">
          {resumes.length === 0 ? (
            <div className="text-xs text-orange-400 font-mono">
              No resumes uploaded yet.{' '}
              <a href="/resumes/new" className="underline font-bold">
                Upload a resume first
              </a>
            </div>
          ) : (
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="w-full p-3 rounded bg-zinc-950 border border-orange-500/40 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          )}
        </ComicPanel>

        {/* Job Details Form */}
        <form onSubmit={handleExtractJob}>
          <ComicPanel panelTag="INPUT FORM" title="PASTE JOB DETAILS">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-mono font-bold text-zinc-300 mb-1">JOB TITLE *</label>
                <input
                  type="text"
                  required
                  placeholder="Senior Full Stack Engineer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded bg-zinc-950 border border-zinc-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-zinc-300 mb-1">COMPANY NAME *</label>
                <input
                  type="text"
                  required
                  placeholder="Stripe, Vercel, Google"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full p-2.5 rounded bg-zinc-950 border border-zinc-800 text-xs text-white"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-mono font-bold text-zinc-300 mb-1">FULL JOB DESCRIPTION *</label>
              <textarea
                rows={7}
                required
                placeholder="Paste the full job description text here..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 rounded bg-zinc-950 border border-zinc-800 text-xs text-white font-mono leading-relaxed"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-5 py-3 rounded border border-orange-500/40 bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-black font-black text-xs uppercase flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scan className="w-4 h-4" />}
                <span>FRAGMENT & EXTRACT KEYWORDS</span>
              </button>

              <button
                type="button"
                onClick={handleRunAnalysis}
                disabled={analyzing || !selectedResumeId}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border-2 border-orange-500 bg-orange-500 text-black font-black text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(249,115,22,0.4)] flex items-center justify-center gap-2 hover:bg-orange-400 disabled:opacity-50 transition-all"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>ANALYZING COMPATIBILITY...</span>
                  </>
                ) : (
                  <>
                    <span>ANALYZE RESUME & MATCH</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </ComicPanel>
        </form>

        {/* Fragmenting AI Visual Animation */}
        {isFragmenting && (
          <ComicPanel panelTag="AI SCANNER ACTIVE" title="FRAGMENTING JOB DESCRIPTION...">
            <div className="py-8 text-center space-y-4">
              <div className="relative mx-auto h-12 w-12 rounded-full border-2 border-orange-500 bg-orange-500/10 flex items-center justify-center text-orange-400">
                <Zap className="h-6 w-6 animate-spin text-orange-400" />
              </div>
              <div className="font-mono text-xs text-orange-400 font-bold uppercase animate-pulse">
                [SKILLS EXTRACTED] • [RESPONSIBILITIES IDENTIFIED] • [KEYWORDS CATEGORIZED]
              </div>
            </div>
          </ComicPanel>
        )}

        {/* Extracted Intelligence Display */}
        {extractedJob && !isFragmenting && (
          <ComicPanel panelTag="AI INTELLIGENCE REPORT" title="EXTRACTED JOB REQUIREMENT PROFILE">
            <div className="space-y-4 font-mono text-xs">
              <div>
                <div className="text-zinc-400 font-bold uppercase mb-2">DETECTED REQUIRED SKILLS:</div>
                <div className="flex flex-wrap gap-1.5">
                  {extractedJob.requiredSkills.map((s, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded bg-orange-500/20 border border-orange-500/40 text-orange-300 font-black">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-zinc-400 font-bold uppercase mb-2">KEY RESPONSIBILITIES:</div>
                <ul className="list-disc list-inside text-zinc-300 space-y-1">
                  {extractedJob.responsibilities.slice(0, 4).map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          </ComicPanel>
        )}
      </div>
    </div>
  );
}

export default function JobAnalyzePage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-10 text-center text-xs text-zinc-400 font-mono">LOADING JOB ANALYZER...</div>}>
      <JobAnalyzeContent />
    </Suspense>
  );
}

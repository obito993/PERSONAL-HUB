'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Briefcase, Sparkles, ArrowRight, Loader2, Target, CheckCircle2, AlertCircle } from 'lucide-react';
import { ParsedJob } from '@/types';

interface ResumeSelectOption {
  id: string;
  name: string;
}

function NewJobContent() {
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
        return;
      }

      setExtractedJob(data.job.structuredData);
    } catch {
      setError('An unexpected error occurred.');
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
      // First ensure job is created
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
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Paste Job Description</h1>
        <p className="text-xs text-zinc-400 mt-1">Extract key skills & responsibilities to evaluate your resume compatibility</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {/* Resume Selector */}
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
          <label className="block text-xs font-semibold text-zinc-300 mb-2">Select Target Resume</label>
          {resumes.length === 0 ? (
            <div className="text-xs text-orange-400">
              No resumes uploaded yet.{' '}
              <a href="/resumes/new" className="underline font-bold">
                Upload a resume first
              </a>
            </div>
          ) : (
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-orange-500"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Job Details Form */}
        <form onSubmit={handleExtractJob} className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-300 font-medium mb-1">Job Title *</label>
              <input
                type="text"
                required
                placeholder="Senior Full Stack Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-300 font-medium mb-1">Company Name *</label>
              <input
                type="text"
                required
                placeholder="Stripe, Vercel, Google"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-300 font-medium mb-1">Optional Job Posting URL</label>
            <input
              type="url"
              placeholder="https://linkedin.com/jobs/view/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-300 font-medium mb-1">Full Job Description *</label>
            <textarea
              rows={8}
              required
              placeholder="Paste the full job posting text here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white leading-relaxed"
            />
          </div>

          <div className="pt-2 flex justify-between items-center">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition-colors flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4 text-orange-400" />}
              <span>Extract Job Keywords</span>
            </button>

            <button
              type="button"
              onClick={handleRunAnalysis}
              disabled={analyzing || !selectedResumeId}
              className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-extrabold text-xs shadow-lg shadow-orange-500/20 flex items-center gap-2 disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing Compatibility...</span>
                </>
              ) : (
                <>
                  <span>Analyze Resume & Match</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Extracted Information Display */}
        {extractedJob && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Extracted Job Intelligence
            </h3>

            <div>
              <div className="text-xs text-zinc-400 font-semibold mb-1">Detected Required Skills:</div>
              <div className="flex flex-wrap gap-1.5">
                {extractedJob.requiredSkills.map((s, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded bg-orange-950/80 border border-orange-800 text-orange-300 text-xs font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs text-zinc-400 font-semibold mb-1">Key Responsibilities:</div>
              <ul className="list-disc list-inside text-xs text-zinc-300 space-y-1">
                {extractedJob.responsibilities.slice(0, 4).map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function NewJobPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-10 text-center text-xs text-zinc-400">Loading job form...</div>}>
      <NewJobContent />
    </Suspense>
  );
}

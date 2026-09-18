'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MatchScoreRing } from '@/components/MatchScoreRing';
import { Sparkles, AlertTriangle, CheckCircle2, XCircle, HelpCircle, ArrowRight, Check, ShieldAlert, Zap } from 'lucide-react';
import { MatchAnalysis, MissingKeywordDetail, ResumeIssue } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AnalysisResultPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [analysis, setAnalysis] = useState<MatchAnalysis & { id: string; userConfirmedSkills?: string[] } | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [resumeName, setResumeName] = useState('');
  const [userConfirmed, setUserConfirmed] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingConfirmed, setSavingConfirmed] = useState(false);

  useEffect(() => {
    fetch(`/api/analyses/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.analysis) {
          setAnalysis(data.analysis);
          setJobTitle(data.analysis.job?.title || 'Target Role');
          setCompany(data.analysis.job?.company || 'Target Company');
          setResumeName(data.analysis.resume?.name || 'Uploaded Resume');
          setUserConfirmed(data.analysis.userConfirmedSkills || []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const toggleSkillConfirmation = async (skill: string) => {
    const updated = userConfirmed.includes(skill)
      ? userConfirmed.filter((s) => s !== skill)
      : [...userConfirmed, skill];

    setUserConfirmed(updated);
    setSavingConfirmed(true);

    try {
      await fetch(`/api/analyses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userConfirmedSkills: updated }),
      });
    } finally {
      setSavingConfirmed(false);
    }
  };

  const handleStartTailoring = () => {
    router.push(`/tailor/${id}`);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-zinc-400 font-mono">Evaluating resume keywords & sub-scores...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-white">Analysis record not found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="text-xs font-bold text-orange-500 uppercase tracking-wider">ATS Compatibility Analysis</div>
          <h1 className="text-3xl font-extrabold text-white mt-0.5">{jobTitle}</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Matched against <span className="text-white font-semibold">{company}</span> using resume <span className="text-zinc-200 font-semibold">{resumeName}</span>
          </p>
        </div>

        <button
          onClick={handleStartTailoring}
          className="px-8 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-extrabold text-sm shadow-xl shadow-orange-500/20 flex items-center gap-2 transition-transform transform hover:scale-105"
        >
          <Sparkles className="w-4 h-4 fill-black" />
          <span>AI Tailor Resume →</span>
        </button>
      </div>

      {/* Match Score & Sub-scores Section */}
      <div className="p-8 rounded-2xl bg-zinc-900/70 border border-zinc-800 shadow-2xl backdrop-blur-xl">
        <MatchScoreRing score={analysis.overallScore} categoryScores={analysis.categoryScores} />
      </div>

      {/* Mistake Detection ("Resume Issues") */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-orange-500" />
            Resume Issues ({analysis.resumeIssues.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.resumeIssues.map((issue: ResumeIssue) => (
            <div
              key={issue.id}
              className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                      issue.severity === 'HIGH'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : issue.severity === 'MEDIUM'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {issue.severity} SEVERITY
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono">{issue.location}</span>
                </div>

                <h3 className="text-sm font-bold text-white mt-2">{issue.title}</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{issue.explanation}</p>
              </div>

              <div className="pt-3 mt-3 border-t border-zinc-800/80 text-xs">
                <span className="font-bold text-orange-400">Suggested Fix: </span>
                <span className="text-zinc-300">{issue.suggestedFix}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Keyword Intelligence Section */}
      <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          Keyword Intelligence
        </h2>

        {/* Categories */}
        <div className="space-y-4">
          {/* Matching Keywords */}
          <div>
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
              ✓ Matching Keywords Detected ({analysis.matchingKeywords.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.matchingKeywords.map((kw, idx) => (
                <span key={idx} className="px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-medium">
                  ✓ {kw}
                </span>
              ))}
            </div>
          </div>

          {/* Missing Keywords Details */}
          <div>
            <div className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">
              × Missing Keywords ({analysis.missingKeywords.length})
            </div>
            <div className="space-y-3">
              {analysis.missingKeywords.map((detail: MissingKeywordDetail, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-rose-400 text-sm">× {detail.keyword}</span>
                    <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 font-mono text-[10px]">
                      Importance: {detail.importance}
                    </span>
                  </div>
                  <div className="text-zinc-400 italic">Job Evidence: "{detail.evidence}"</div>
                  <div className="text-zinc-300">
                    <span className="font-semibold text-orange-400">Recommendation: </span>
                    {detail.recommendation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Skill Gap Analysis Section */}
      <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Skill Gap & User Skill Confirmation
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            If you possess hands-on experience with any missing skill, check the box below to allow AI to safely incorporate it into your tailored resume.
          </p>
        </div>

        <div className="space-y-3">
          {analysis.missingSkills.map((skill) => {
            const confirmed = userConfirmed.includes(skill);
            return (
              <div
                key={skill}
                onClick={() => toggleSkillConfirmation(skill)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  confirmed
                    ? 'bg-orange-950/40 border-orange-500/80 text-white'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                      confirmed ? 'bg-orange-500 border-orange-500 text-black' : 'border-zinc-700'
                    }`}
                  >
                    {confirmed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <span className="font-bold text-sm text-white">{skill}</span>
                    <span className="text-xs text-zinc-500 block">Required by job description</span>
                  </div>
                </div>

                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">
                  {confirmed ? 'I Have This Skill ✓' : 'Click to Confirm Experience'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary Bottom Action Bar */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-orange-950/50 via-zinc-900 to-violet-950/50 border border-orange-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white">Ready to tailor your resume?</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            AI will optimize bullet points and incorporate your {userConfirmed.length} confirmed skill(s) with full change tracking.
          </p>
        </div>

        <button
          onClick={handleStartTailoring}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-extrabold text-sm shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 transition-transform transform hover:scale-105"
        >
          <span>Proceed to AI Resume Tailor</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

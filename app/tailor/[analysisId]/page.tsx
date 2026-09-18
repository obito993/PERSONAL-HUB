'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Check, X, Edit3, Undo2, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { ParsedResume, ResumeChange } from '@/types';

interface PageProps {
  params: Promise<{ analysisId: string }>;
}

export default function TailorResumePage({ params }: PageProps) {
  const { analysisId } = use(params);
  const router = useRouter();

  const [tailoredResumeId, setTailoredResumeId] = useState<string | null>(null);
  const [tailoredContent, setTailoredContent] = useState<ParsedResume | null>(null);
  const [originalContent, setOriginalContent] = useState<ParsedResume | null>(null);
  const [changes, setChanges] = useState<ResumeChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(true);

  useEffect(() => {
    async function initTailoring() {
      try {
        const res = await fetch('/api/tailor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ analysisId }),
        });

        const data = await res.json();
        if (data.tailoredResume) {
          setTailoredResumeId(data.tailoredResume.id);
          setTailoredContent(data.tailoredResume.content);
          setChanges(data.tailoredResume.changes || []);
        }

        // Fetch original resume for side-by-side comparison
        const analysisRes = await fetch(`/api/analyses/${analysisId}`);
        const analysisData = await analysisRes.json();
        if (analysisData.analysis?.resume?.structuredData) {
          setOriginalContent(analysisData.analysis.resume.structuredData);
        }
      } catch (err) {
        console.error('Tailoring init error:', err);
      } finally {
        setGenerating(false);
        setLoading(false);
      }
    }

    initTailoring();
  }, [analysisId]);

  const updateChangeStatus = (changeId: string, status: 'accepted' | 'rejected') => {
    setChanges((prev) =>
      prev.map((c) => (c.id === changeId ? { ...c, status } : c))
    );
  };

  const handleProceedToBuilder = async () => {
    if (tailoredResumeId) {
      // Save accepted changes state
      await fetch(`/api/tailor/${tailoredResumeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: tailoredContent, changes }),
      });

      router.push(`/builder/${tailoredResumeId}`);
    }
  };

  if (generating || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-6" />
        <h2 className="text-2xl font-extrabold text-white">AI Tailoring Resume...</h2>
        <p className="text-xs text-zinc-400 mt-2">
          Rewriting bullet points for maximum ATS impact while enforcing strict anti-hallucination guardrails.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="text-xs font-bold text-orange-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> AI Tailoring & Change Review
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">Review AI Suggestions</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Accept or reject individual modifications. Nothing is updated without your explicit approval.
          </p>
        </div>

        <button
          onClick={handleProceedToBuilder}
          className="px-8 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-extrabold text-sm shadow-xl shadow-orange-500/20 flex items-center gap-2 transition-transform transform hover:scale-105"
        >
          <span>Open Live Resume Builder & Export</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Workspace: Left Changes Stack, Right Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Granular Change Tracking Cards */}
        <div className="lg:col-span-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center justify-between">
            <span>Granular Change Log ({changes.length})</span>
            <span className="text-xs text-zinc-500 font-normal">Interactive diff review</span>
          </h2>

          {changes.map((change) => {
            const isAccepted = change.status === 'accepted';
            const isRejected = change.status === 'rejected';

            return (
              <motion.div
                key={change.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-xl border transition-all ${
                  isAccepted
                    ? 'bg-emerald-950/30 border-emerald-800/80'
                    : isRejected
                    ? 'bg-rose-950/20 border-rose-950 opacity-60'
                    : 'bg-zinc-900/80 border-zinc-800'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase font-mono tracking-wider ${
                      change.type === 'ADDED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : change.type === 'REWRITTEN'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : change.type === 'REORDERED'
                        ? 'bg-violet-950 text-violet-300 border border-violet-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    [{change.type}] {change.section}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateChangeStatus(change.id, 'accepted')}
                      className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 ${
                        isAccepted
                          ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-emerald-600 hover:text-white'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" /> Accept
                    </button>
                    <button
                      onClick={() => updateChangeStatus(change.id, 'rejected')}
                      className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 ${
                        isRejected
                          ? 'bg-rose-600 text-white'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-rose-600 hover:text-white'
                      }`}
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mt-3 text-xs">
                  {change.originalText && (
                    <div className="p-2.5 rounded bg-zinc-950/80 border border-zinc-800 text-zinc-400 line-through">
                      <span className="text-[10px] font-bold text-zinc-500 block uppercase">Original:</span>
                      {change.originalText}
                    </div>
                  )}
                  <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800 text-emerald-300">
                    <span className="text-[10px] font-bold text-emerald-400 block uppercase">Tailored Revision:</span>
                    {change.newText}
                  </div>
                  <div className="text-[11px] text-zinc-400 italic pt-1">
                    <span className="font-semibold text-orange-400">Rationale: </span>
                    {change.reason}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Right Column: Tailored Resume Content Preview */}
        <div className="lg:col-span-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Tailored Resume Live Preview
          </h2>

          <div className="p-6 rounded-2xl bg-white text-zinc-900 text-xs space-y-4 shadow-xl font-sans min-h-[500px]">
            <div className="border-b border-zinc-300 pb-3">
              <h3 className="text-lg font-bold text-zinc-900">{tailoredContent?.contact.name}</h3>
              <p className="text-zinc-600 font-medium">{tailoredContent?.contact.email} | {tailoredContent?.contact.phone}</p>
            </div>

            <div>
              <div className="font-bold text-orange-600 uppercase tracking-wider text-[11px] mb-1">Tailored Summary</div>
              <p className="text-zinc-800 leading-relaxed">{tailoredContent?.summary}</p>
            </div>

            <div>
              <div className="font-bold text-orange-600 uppercase tracking-wider text-[11px] mb-1">Optimized Technical Skills</div>
              <p className="text-zinc-800">{tailoredContent?.skills.technical.join(', ')}</p>
            </div>

            <div>
              <div className="font-bold text-orange-600 uppercase tracking-wider text-[11px] mb-2">Refined Experience</div>
              <div className="space-y-3">
                {tailoredContent?.experience.map((exp, idx) => (
                  <div key={idx}>
                    <div className="font-bold text-zinc-900">{exp.title} — {exp.company}</div>
                    <ul className="list-disc list-inside text-zinc-700 space-y-1 mt-1">
                      {exp.bullets.map((b, bIdx) => (
                        <li key={bIdx}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

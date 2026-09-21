'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { HelpCircle, ArrowLeft, Save, CheckCircle2, Sparkles, MessageSquare, Lightbulb } from 'lucide-react';
import { InterviewQuestionData } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function InterviewPracticeWorkspace({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [session, setSession] = useState<{ id: string; jobTitle: string; company: string; questions: InterviewQuestionData[] } | null>(null);
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/interview/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.session) {
          setSession(data.session);
          const initialAnswers: { [key: string]: string } = {};
          data.session.questions.forEach((q: any) => {
            initialAnswers[q.id] = q.userAnswer || '';
          });
          setAnswers(initialAnswers);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleSaveAnswers = async () => {
    if (!session) return;
    setSaving(true);
    try {
      const payload = Object.keys(answers).map((qId) => ({
        id: qId,
        userAnswer: answers[qId],
      }));

      await fetch(`/api/interview/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionAnswers: payload }),
      });

      setNotification('Practice answers saved!');
      setTimeout(() => setNotification(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !session) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-zinc-400 font-mono">Loading practice workspace...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-6">
        <div>
          <button
            onClick={() => router.push('/interview')}
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Prep Sessions
          </button>
          <h1 className="text-2xl font-extrabold text-white">Interview Practice Workspace</h1>
          <p className="text-xs text-orange-400 font-medium mt-0.5">
            Target Role: {session.jobTitle} at {session.company}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {notification && <span className="text-xs text-emerald-400 font-medium animate-pulse">{notification}</span>}
          <button
            onClick={handleSaveAnswers}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-extrabold text-xs shadow-lg shadow-orange-500/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>{saving ? 'Saving...' : 'Save Practice Answers'}</span>
          </button>
        </div>
      </div>

      {/* Questions Stack */}
      <div className="space-y-6">
        {session.questions.map((q, idx) => (
          <motion.div
            key={q.id || idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4 shadow-xl"
          >
            <div className="flex justify-between items-start gap-4">
              <h3 className="text-base font-bold text-white leading-snug">
                Q{idx + 1}. {q.question}
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase font-mono tracking-wider ${
                  q.category === 'Technical'
                    ? 'bg-violet-950 text-violet-300 border border-violet-800'
                    : q.category === 'Behavioral'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : q.category === 'Situational'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-zinc-800 text-zinc-300'
                }`}
              >
                {q.category}
              </span>
            </div>

            {/* Rationale & Structure Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-1">
                <div className="font-bold text-orange-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                  <Lightbulb className="w-3.5 h-3.5" /> Why They Ask This
                </div>
                <p className="text-zinc-400 leading-relaxed">{q.rationale}</p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-1">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" /> Suggested Answer Structure
                </div>
                <p className="text-zinc-400 leading-relaxed">{q.structure}</p>
              </div>
            </div>

            {/* Interactive Practice Field */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
                Your Practice Answer
              </label>
              <textarea
                rows={4}
                placeholder="Draft your answer here (e.g. using STAR framework context, task, action, result)..."
                value={answers[q.id || ''] || ''}
                onChange={(e) => setAnswers({ ...answers, [q.id || '']: e.target.value })}
                className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white leading-relaxed focus:outline-none focus:border-orange-500"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

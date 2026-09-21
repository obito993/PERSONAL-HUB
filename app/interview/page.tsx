'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HelpCircle, Plus, Eye, Trash2, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface SessionSummary {
  id: string;
  jobTitle: string;
  company: string;
  createdAt: string;
  questions: any[];
}

export default function InterviewPrepListPage() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/interview')
      .then((res) => (res.ok ? res.json() : { sessions: [] }))
      .then((data) => {
        setSessions(data.sessions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this interview prep session?')) return;
    await fetch(`/api/interview/${id}`, { method: 'DELETE' });
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-zinc-400 font-mono">Loading interview sessions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <HelpCircle className="w-7 h-7 text-orange-500" />
            Interview Preparation Workspace
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Tailored HR, Technical, Behavioral, and Situational interview questions with practice fields
          </p>
        </div>

        <Link
          href="/jobs/new"
          className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-extrabold text-sm shadow-xl shadow-orange-500/20 flex items-center gap-2 transition-transform transform hover:scale-105"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Prep Session</span>
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800 border-dashed">
          <HelpCircle className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No interview prep sessions created</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
            Analyze a job description to generate role-specific interview questions and practice your answers.
          </p>
          <div className="mt-6">
            <Link
              href="/jobs/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 text-black font-bold text-xs"
            >
              Analyze Job Posting <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((session) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between shadow-lg"
            >
              <div>
                <h3 className="font-bold text-white text-base leading-tight">{session.jobTitle}</h3>
                <p className="text-xs text-orange-400 font-medium mt-0.5">{session.company}</p>

                <div className="text-xs text-zinc-400 mt-4 space-y-1 border-t border-zinc-800/80 pt-3">
                  <div>{session.questions?.length || 0} Customized Questions</div>
                  <div className="text-[11px] text-zinc-500">
                    Created {new Date(session.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 pt-3 border-t border-zinc-800/60">
                <Link
                  href={`/interview/${session.id}`}
                  className="flex-1 py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Practice Workspace</span>
                </Link>

                <button
                  onClick={() => handleDelete(session.id)}
                  className="p-2 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

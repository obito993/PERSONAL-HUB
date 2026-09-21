'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, Plus, Eye, Trash2, Sparkles, Download, ArrowRight } from 'lucide-react';

interface CoverLetterSummary {
  id: string;
  company: string;
  jobTitle: string;
  style: string;
  createdAt: string;
}

export default function CoverLettersPage() {
  const [letters, setLetters] = useState<CoverLetterSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cover-letters')
      .then((res) => (res.ok ? res.json() : { coverLetters: [] }))
      .then((data) => {
        setLetters(data.coverLetters || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cover letter?')) return;
    await fetch(`/api/cover-letters/${id}`, { method: 'DELETE' });
    setLetters((prev) => prev.filter((l) => l.id !== id));
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-zinc-400 font-mono">Loading cover letters...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-7 h-7 text-orange-500" />
            Cover Letters
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Job-specific cover letters generated from your Master Profile and target job postings
          </p>
        </div>

        <Link
          href="/jobs/new"
          className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-extrabold text-sm shadow-xl shadow-orange-500/20 flex items-center gap-2 transition-transform transform hover:scale-105"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Generate New Cover Letter</span>
        </Link>
      </div>

      {letters.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800 border-dashed">
          <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No cover letters generated yet</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
            Analyze a target job posting to automatically generate a tailored cover letter in your preferred tone.
          </p>
          <div className="mt-6">
            <Link
              href="/jobs/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 text-black font-bold text-xs"
            >
              Paste Job Description <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {letters.map((letter) => (
            <motion.div
              key={letter.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-white text-base leading-tight">{letter.jobTitle}</h3>
                    <p className="text-xs text-orange-400 font-medium mt-0.5">{letter.company}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-300 font-mono">
                    {letter.style}
                  </span>
                </div>

                <div className="text-xs text-zinc-500 mt-4 border-t border-zinc-800/80 pt-3">
                  Created {new Date(letter.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 pt-3 border-t border-zinc-800/60">
                <Link
                  href={`/cover-letters/${letter.id}`}
                  className="flex-1 py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View / Edit</span>
                </Link>

                <button
                  onClick={() => handleDelete(letter.id)}
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

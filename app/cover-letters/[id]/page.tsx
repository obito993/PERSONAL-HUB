'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FileText, Download, Save, ArrowLeft, Sparkles } from 'lucide-react';
import { exportToDocx, triggerPrintPdf } from '@/lib/export/export-utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CoverLetterDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [letter, setLetter] = useState<{ id: string; company: string; jobTitle: string; style: string; content: string } | null>(null);
  const [content, setContent] = useState('');
  const [style, setStyle] = useState('Professional');
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/cover-letters/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.coverLetter) {
          setLetter(data.coverLetter);
          setContent(data.coverLetter.content);
          setStyle(data.coverLetter.style || 'Professional');
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/cover-letters/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, style }),
      });
      setNotification('Cover letter updated!');
      setTimeout(() => setNotification(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handlePdfExport = () => {
    triggerPrintPdf('cover-letter-preview-content');
  };

  if (loading || !letter) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-zinc-400 font-mono">Loading cover letter editor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-6">
        <div>
          <button
            onClick={() => router.push('/cover-letters')}
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Cover Letters
          </button>
          <h1 className="text-2xl font-extrabold text-white">{letter.jobTitle}</h1>
          <p className="text-xs text-orange-400 font-medium">Cover Letter for {letter.company}</p>
        </div>

        <div className="flex items-center gap-3">
          {notification && <span className="text-xs text-emerald-400 font-medium">{notification}</span>}

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            onClick={handlePdfExport}
            className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-black text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-orange-500/20"
          >
            <Download className="w-3.5 h-3.5 stroke-[3]" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Editor & Preview Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor Left */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Tone & Style</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white"
            >
              {['Professional', 'Concise', 'Modern', 'Formal', 'Entry-level'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <label className="block text-xs font-semibold text-zinc-300 mb-2">Edit Cover Letter Text</label>
            <textarea
              rows={18}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white leading-relaxed font-sans"
            />
          </div>
        </div>

        {/* Live Printable Preview Right */}
        <div className="lg:col-span-6 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 flex items-start justify-center">
          <div
            className="bg-white text-zinc-900 p-8 rounded shadow-xl max-w-[210mm] w-full min-h-[297mm] text-xs leading-relaxed font-sans"
            id="cover-letter-preview-content"
          >
            <div className="border-b border-zinc-200 pb-3 mb-4">
              <h2 className="text-lg font-bold text-zinc-900 uppercase">Cover Letter</h2>
              <div className="text-[11px] text-zinc-600 font-semibold">{letter.jobTitle} — {letter.company}</div>
            </div>

            <div className="whitespace-pre-wrap font-sans text-zinc-800 leading-normal">
              {content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, PlusCircle, ArrowRight, Eye, Trash2 } from 'lucide-react';
import { ComicPanel } from '@/components/ui/comic/ComicPanel';

export default function MyResumesPage() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/resumes')
      .then((res) => (res.ok ? res.json() : { resumes: [] }))
      .then((data) => {
        setResumes(data.resumes || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b-2 border-orange-500/20 pb-6">
        <div>
          <span className="font-mono text-xs font-black text-orange-500 uppercase tracking-widest">
            MY RESUMES LAB
          </span>
          <h1 className="text-3xl font-black uppercase text-white">UPLOADED & TAILORED BUILDS</h1>
        </div>
        <Link
          href="/resumes/create"
          data-cursor="CREATE"
          className="inline-flex items-center gap-2 rounded-xl border-2 border-orange-500 bg-orange-500 px-6 py-3 font-black text-black text-xs uppercase shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:bg-orange-400 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ UPLOAD OR BUILD NEW</span>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 bg-zinc-900 animate-pulse rounded-xl border border-zinc-800" />
          ))}
        </div>
      ) : resumes.length === 0 ? (
        <ComicPanel panelTag="EMPTY RESUME REPOSITORY" title="NO RESUMES STORED YET">
          <div className="py-8 text-center">
            <FileText className="h-12 w-12 text-orange-400 mx-auto mb-3" />
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Upload an existing resume or import your Master Profile to generate your first ATS-friendly resume build.
            </p>
            <div className="mt-6">
              <Link
                href="/resumes/create"
                className="inline-flex items-center gap-2 rounded border-2 border-orange-500 bg-orange-500 px-6 py-2.5 font-black text-black text-xs uppercase"
              >
                <span>CREATE FIRST RESUME</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </ComicPanel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resumes.map((r, i) => (
            <ComicPanel key={r.id} panelTag={`RESUME 0${i + 1}`} title={r.name}>
              <div className="mt-2 text-xs font-mono text-zinc-400">
                Created: {new Date(r.createdAt).toLocaleDateString()}
              </div>
              <div className="mt-6 flex items-center gap-2">
                <Link
                  href={`/resumes/new`}
                  className="flex-1 py-2 text-center rounded border border-orange-500/40 bg-orange-500/10 text-orange-400 font-black text-xs uppercase hover:bg-orange-500 hover:text-black transition-colors"
                >
                  RE-EXTRACT / EDIT
                </Link>
              </div>
            </ComicPanel>
          ))}
        </div>
      )}
    </div>
  );
}

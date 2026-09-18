'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { History, Search, ArrowUpDown, Eye, Trash2, Sparkles, ExternalLink } from 'lucide-react';

interface HistoryItem {
  id: string;
  overallScore: number;
  createdAt: string;
  resume: { id: string; name: string };
  jobDescription: { title: string; company: string };
}

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analyses')
      .then((res) => (res.ok ? res.json() : { analyses: [] }))
      .then((data) => {
        setItems(data.analyses || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this analysis record?')) return;

    await fetch(`/api/analyses/${id}`, { method: 'DELETE' });
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const filteredItems = items
    .filter(
      (item) =>
        item.jobDescription.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.jobDescription.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.resume.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'score') return b.overallScore - a.overallScore;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-zinc-400 font-mono">Loading analysis history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <History className="w-7 h-7 text-orange-500" />
            Analysis History
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Review, re-tailor, or export past job match reports</p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search title, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
            />
          </div>

          {/* Sort Toggle */}
          <button
            onClick={() => setSortBy(sortBy === 'date' ? 'score' : 'date')}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-medium flex items-center gap-1.5 hover:bg-zinc-800 transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-orange-400" />
            <span>Sort by {sortBy === 'date' ? 'Date' : 'Match Score'}</span>
          </button>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800">
          <p className="text-sm font-bold text-white">No analysis records match your query.</p>
          <p className="text-xs text-zinc-400 mt-1">Start a new analysis to build your history.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-white text-base leading-tight">{item.jobDescription.title}</h3>
                    <p className="text-xs text-orange-400 font-medium mt-0.5">{item.jobDescription.company}</p>
                  </div>
                  <span className="text-xl font-black text-white bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800">
                    {item.overallScore}%
                  </span>
                </div>

                <div className="text-xs text-zinc-400 mt-4 space-y-1 border-t border-zinc-800/80 pt-3">
                  <div>
                    <span className="text-zinc-500">Resume: </span>
                    <span className="text-zinc-200 font-medium">{item.resume.name}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Date: </span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 pt-3 border-t border-zinc-800/60">
                <Link
                  href={`/analysis/${item.id}`}
                  className="flex-1 py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Report</span>
                </Link>

                <Link
                  href={`/tailor/${item.id}`}
                  className="flex-1 py-2 px-3 rounded-lg bg-orange-500 hover:bg-orange-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-black" />
                  <span>Tailor</span>
                </Link>

                <button
                  onClick={() => handleDelete(item.id)}
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

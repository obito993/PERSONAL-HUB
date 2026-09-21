'use client';

import React, { useState } from 'react';
import { Palette, Sparkles, Copy, Check, RefreshCw } from 'lucide-react';
import { sound } from '@/lib/sound';

export default function CreatePage() {
  const [topic, setTopic] = useState('Frontend Engineering & AI');
  const [generatedIdeas, setGeneratedIdeas] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateIdeas = () => {
    if (!topic.trim()) return;
    const list = [
      `🚀 "How I Built a Superhero Productivity Hub in 24 Hours Using Next.js"`,
      `💡 "5 Hidden TypeScript Tricks Every Engineer Needs to Master Today"`,
      `🔥 "Stop Over-Engineering Your SaaS MVP: Here's the Client-First Blueprint"`,
      `🧠 "Mastering Focus Sprints: How Pomodoro & Editorial Design Boost Speed"`
    ];
    setGeneratedIdeas(list);
    sound.playLevelUp();
  };

  const copyIdea = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    sound.playPop();
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="bg-white comic-border-lg p-6 sm:p-8 shadow-comic space-y-4">
        <div className="flex items-center gap-2">
          <span className="comic-sticker comic-sticker-purple">
            CREATIVE LAB
          </span>
          <span className="text-xs font-mono font-bold bg-[#FFD83D] comic-border-sm px-2 py-0.5">
            CONTENT ENGINE
          </span>
        </div>

        <h1 className="font-black text-4xl sm:text-6xl uppercase tracking-tight">
          THE CREATIVE LAB
        </h1>

        <p className="font-extrabold text-gray-700 text-sm sm:text-base">
          Generate viral post hooks, YouTube titles, blog ideas, and color palettes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Generator Form */}
        <div className="bg-white comic-border-lg p-6 shadow-comic space-y-4">
          <h2 className="font-black text-lg border-b-2 border-black pb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#B9A7FF]" />
            <span>CONTENT & HOOK GENERATOR</span>
          </h2>

          <div>
            <label className="block text-xs font-black mb-1 uppercase">Enter Topic / Niche</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="comic-input w-full text-sm"
            />
          </div>

          <button
            onClick={generateIdeas}
            className="btn-comic btn-comic-purple w-full py-2.5 text-xs flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>GENERATE VIRAL HOOKS & TITLES</span>
          </button>
        </div>

        {/* Results */}
        <div className="comic-card-yellow p-6 space-y-4">
          <h3 className="font-black text-base uppercase border-b-2 border-black pb-2">
            GENERATED IDEAS & HOOKS
          </h3>

          <div className="space-y-3">
            {generatedIdeas.length === 0 ? (
              <div className="text-xs font-black text-gray-700 text-center py-8">
                ENTER A TOPIC ON THE LEFT TO GENERATE CREATIVE IDEAS
              </div>
            ) : (
              generatedIdeas.map((idea, idx) => (
                <div key={idx} className="p-3 bg-white comic-border-sm flex items-center justify-between gap-2 text-xs font-bold">
                  <span>{idea}</span>
                  <button
                    onClick={() => copyIdea(idea, idx)}
                    className="btn-comic btn-comic-white p-1.5 text-[10px]"
                  >
                    {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

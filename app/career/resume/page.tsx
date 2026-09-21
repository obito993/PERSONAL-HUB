'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { sound } from '@/lib/sound';

export default function ResumeAnalyzerPage() {
  const [resumeText, setResumeText] = useState('');
  const [targetJobText, setTargetJobText] = useState('');
  const [analysis, setAnalysis] = useState<{
    estimateScore: number;
    foundKeywords: string[];
    missingKeywords: string[];
    actionVerbsCount: number;
    formattingWarnings: string[];
    suggestions: string[];
  } | null>(null);

  const analyzeResume = () => {
    if (!resumeText.trim()) return;

    const lowerResume = resumeText.toLowerCase();
    const lowerJob = targetJobText.toLowerCase();

    const KEYWORDS = ['react', 'typescript', 'next.js', 'sql', 'python', 'api', 'git', 'node', 'ui', 'ux', 'agile', 'aws', 'docker', 'system design'];
    const ACTION_VERBS = ['built', 'architected', 'developed', 'led', 'designed', 'optimized', 'scaled', 'implemented', 'reduced', 'increased', 'managed'];

    const found = KEYWORDS.filter(k => lowerResume.includes(k));
    const missing = KEYWORDS.filter(k => !lowerResume.includes(k));
    
    let verbsFound = 0;
    ACTION_VERBS.forEach(v => {
      if (lowerResume.includes(v)) verbsFound++;
    });

    const warnings: string[] = [];
    if (!lowerResume.includes('education')) warnings.push('Missing explicit "Education" section header');
    if (!lowerResume.includes('experience')) warnings.push('Missing explicit "Work Experience" section header');
    if (resumeText.length < 500) warnings.push('Resume content appears too short (< 100 words)');

    const score = Math.min(95, Math.max(35, found.length * 5 + verbsFound * 4 + 40));

    setAnalysis({
      estimateScore: score,
      foundKeywords: found,
      missingKeywords: missing.slice(0, 6),
      actionVerbsCount: verbsFound,
      formattingWarnings: warnings,
      suggestions: [
        'Use quantified bullet points (e.g., "Improved page load by 35%")',
        'Include exact skill keywords matching the target job description',
        'Ensure clean, single-column formatting for optimal readability'
      ]
    });

    sound.playLevelUp();
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="bg-white comic-border-lg p-6 shadow-comic flex items-center justify-between gap-4">
        <div>
          <Link href="/career" className="text-xs font-black hover:underline flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO CAREER MISSION</span>
          </Link>
          <h1 className="font-black text-3xl sm:text-5xl uppercase tracking-tight flex items-center gap-2">
            <FileText className="w-8 h-8 text-[#B9A7FF]" />
            <span>RESUME COMPATIBILITY ESTIMATOR</span>
          </h1>
        </div>
        <span className="comic-sticker comic-sticker-purple text-xs hidden sm:inline">
          ESTIMATOR ENGINE
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Form Input */}
        <div className="bg-white comic-border-lg p-6 shadow-comic space-y-4">
          <div>
            <label className="block text-xs font-black mb-1 uppercase">Paste Resume Content</label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your full resume text here..."
              rows={8}
              className="comic-input w-full font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-black mb-1 uppercase">Target Job Description (Optional)</label>
            <textarea
              value={targetJobText}
              onChange={(e) => setTargetJobText(e.target.value)}
              placeholder="Paste job description..."
              rows={4}
              className="comic-input w-full font-mono text-xs"
            />
          </div>

          <button
            onClick={analyzeResume}
            className="btn-comic btn-comic-purple w-full py-2.5 text-xs flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>RUN COMPATIBILITY ESTIMATE</span>
          </button>
        </div>

        {/* Results Panel */}
        <div className="comic-card-yellow p-6 space-y-4">
          {analysis ? (
            <div className="space-y-4 font-mono font-bold text-xs">
              <div className="border-b-2 border-black pb-2 flex justify-between items-center">
                <span className="font-sans font-black text-base">COMPATIBILITY ESTIMATE</span>
                <span className="bg-[#FF5A5F] text-white comic-border-sm text-sm font-black px-2 py-0.5">
                  {analysis.estimateScore}%
                </span>
              </div>

              <div>
                <span className="text-black font-black font-sans">KEYWORDS FOUND:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {analysis.foundKeywords.map(k => (
                    <span key={k} className="bg-green-200 border border-black px-1.5 py-0.5 text-[10px]">
                      ✓ {k}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-black font-black font-sans">RECOMMENDED KEYWORDS TO ADD:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {analysis.missingKeywords.map(k => (
                    <span key={k} className="bg-red-200 border border-black px-1.5 py-0.5 text-[10px]">
                      + {k}
                    </span>
                  ))}
                </div>
              </div>

              {analysis.formattingWarnings.length > 0 && (
                <div className="p-3 bg-red-100 comic-border-sm space-y-1">
                  <div className="font-sans font-black text-red-800 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>FORMATTING WARNINGS</span>
                  </div>
                  {analysis.formattingWarnings.map((w, i) => (
                    <div key={i} className="text-[11px] text-red-900">• {w}</div>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t-2 border-black">
                <div className="font-sans font-black mb-1">IMPROVEMENT SUGGESTIONS:</div>
                {analysis.suggestions.map((s, i) => (
                  <div key={i} className="text-[11px] font-sans">• {s}</div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-xs font-black text-gray-700 text-center py-12">
              PASTE YOUR RESUME TEXT ON THE LEFT TO RUN ESTIMATION
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

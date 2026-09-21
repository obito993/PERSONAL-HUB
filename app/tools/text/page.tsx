'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, FileText, Type, Eraser, Copy, Check } from 'lucide-react';
import { sound } from '@/lib/sound';

const TEXT_THEMES = {
  'word-counter': {
    name: 'Word & Character Counter',
    heroIdentity: 'THE COUNT HERO',
    issueNo: '#009',
    hexColor: '#14B8A6',
    bgColorClass: 'bg-[#14B8A6]',
    textColorClass: 'text-white',
    tagline: '"PRECISION & MEASUREMENT SUPERHERO — COUNT EVERY WORD & SYMBOL."',
    icon: FileText,
  },
  'case-converter': {
    name: 'Case Converter',
    heroIdentity: 'THE TYPO HERO',
    issueNo: '#010',
    hexColor: '#F43F5E',
    bgColorClass: 'bg-[#F43F5E]',
    textColorClass: 'text-white',
    tagline: '"TYPOGRAPHY-POWERED COMIC HERO — UPPER, LOWER & CODE CASE MAGIC."',
    icon: Type,
  },
  'text-cleaner': {
    name: 'Duplicate & Space Cleaner',
    heroIdentity: 'THE CLEANER',
    issueNo: '#011',
    hexColor: '#84CC16',
    bgColorClass: 'bg-[#84CC16]',
    textColorClass: 'text-black',
    tagline: '"DIGITAL CLEANUP SUPERHERO — PURGE DUPLICATES & EXTRA SPACES."',
    icon: Eraser,
  },
};

function TextToolsContent() {
  const searchParams = useSearchParams();
  const requestedTool = searchParams.get('tool') as keyof typeof TEXT_THEMES || 'word-counter';

  const [activeTab, setActiveTab] = useState<keyof typeof TEXT_THEMES>(
    TEXT_THEMES[requestedTool] ? requestedTool : 'word-counter'
  );

  useEffect(() => {
    const t = searchParams.get('tool') as keyof typeof TEXT_THEMES;
    if (t && TEXT_THEMES[t]) {
      setActiveTab(t);
    }
  }, [searchParams]);

  const currentTheme = TEXT_THEMES[activeTab] || TEXT_THEMES['word-counter'];
  const ThemeIcon = currentTheme.icon;

  const [text, setText] = useState('Welcome to your Personal Hub! Paste your content here to format, clean, convert case, or analyze word statistics.');
  const [copied, setCopied] = useState(false);

  const copyText = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    sound.playPop();
    setTimeout(() => setCopied(false), 2000);
  };

  // Metrics
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s+/g, '').length;
  const sentences = text.trim() ? text.split(/[.!?]+/).filter(Boolean).length : 0;
  const paragraphs = text.trim() ? text.split(/\n+/).filter(Boolean).length : 0;
  const readingTime = Math.ceil(words / 200);

  // Case transforms
  const toUpper = () => setText(text.toUpperCase());
  const toLower = () => setText(text.toLowerCase());
  const toTitle = () => setText(text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase()));
  const toCamel = () => setText(text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase()));
  const toKebab = () => setText(text.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, ''));
  const toSnake = () => setText(text.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, ''));

  // Clean transforms
  const removeExtraSpaces = () => setText(text.replace(/[ \t]+/g, ' ').replace(/^\s+|\s+$/gm, ''));
  const removeDuplicates = () => {
    const lines = text.split('\n');
    const unique = Array.from(new Set(lines));
    setText(unique.join('\n'));
  };

  return (
    <div className="space-y-8 py-6">
      {/* Hero Banner */}
      <div 
        className="comic-border-lg p-6 sm:p-8 shadow-comic-lg space-y-4 rounded-2xl relative overflow-hidden transition-all duration-300"
        style={{
          backgroundColor: currentTheme.hexColor,
          color: currentTheme.textColorClass === 'text-white' ? '#FFFFFF' : '#000000',
        }}
      >
        <div className="flex items-center justify-between">
          <Link 
            href="/tools" 
            className="text-xs font-black hover:underline flex items-center gap-1.5 bg-black text-white px-3 py-1 rounded-lg border border-white shadow-[2px_2px_0_#000]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO TOOLBOX</span>
          </Link>
          <span className="bg-black text-white font-mono font-black text-xs px-3 py-1 border border-white rounded-lg">
            ISSUE {currentTheme.issueNo}
          </span>
        </div>

        <div className="space-y-1">
          <div className="font-mono text-xs font-black uppercase tracking-widest opacity-90">
            {currentTheme.heroIdentity}
          </div>
          <h1 className="font-black text-3xl sm:text-5xl uppercase tracking-tight flex items-center gap-3">
            <ThemeIcon className="w-9 h-9 stroke-[2.8]" />
            <span>{currentTheme.name}</span>
          </h1>
          <p className="font-bold text-xs sm:text-sm italic opacity-95">
            {currentTheme.tagline}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(TEXT_THEMES).map(([key, theme]) => (
          <button
            key={key}
            onClick={() => {
              setActiveTab(key as keyof typeof TEXT_THEMES);
              sound.playPop();
            }}
            className={`btn-comic text-xs px-4 py-2 font-black transition-all ${
              activeTab === key ? 'scale-105 shadow-comic-md border-2 border-black' : 'btn-comic-white'
            }`}
            style={{
              backgroundColor: activeTab === key ? theme.hexColor : undefined,
              color: activeTab === key ? (theme.textColorClass === 'text-white' ? '#FFFFFF' : '#000000') : undefined,
            }}
          >
            ISSUE {theme.issueNo}: {theme.name.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Main Workspace */}
      <div 
        className="bg-white comic-border-lg shadow-comic-lg p-6 sm:p-8 rounded-2xl space-y-6"
        style={{
          borderTopWidth: '8px',
          borderTopColor: currentTheme.hexColor,
        }}
      >
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-black uppercase">TEXT CANVAS</label>
            <button
              onClick={() => copyText(text)}
              className="btn-comic btn-comic-white px-3 py-1 text-xs font-black flex items-center gap-1"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'COPIED!' : 'COPY TEXT'}</span>
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            className="comic-input w-full font-mono text-sm"
          />
        </div>

        {/* Count Hero Stats */}
        {activeTab === 'word-counter' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 font-mono font-bold">
            <div className="bg-[#14B8A6] text-white p-3 comic-border-sm rounded-xl text-center">
              <div className="text-2xl font-black">{words}</div>
              <div className="text-[10px] uppercase font-sans font-black">WORDS</div>
            </div>
            <div className="bg-[#14B8A6] text-white p-3 comic-border-sm rounded-xl text-center">
              <div className="text-2xl font-black">{chars}</div>
              <div className="text-[10px] uppercase font-sans font-black">CHARS</div>
            </div>
            <div className="bg-[#14B8A6] text-white p-3 comic-border-sm rounded-xl text-center">
              <div className="text-2xl font-black">{charsNoSpaces}</div>
              <div className="text-[10px] uppercase font-sans font-black">NO SPACES</div>
            </div>
            <div className="bg-[#14B8A6] text-white p-3 comic-border-sm rounded-xl text-center">
              <div className="text-2xl font-black">{sentences}</div>
              <div className="text-[10px] uppercase font-sans font-black">SENTENCES</div>
            </div>
            <div className="bg-[#14B8A6] text-white p-3 comic-border-sm rounded-xl text-center">
              <div className="text-2xl font-black">{paragraphs}</div>
              <div className="text-[10px] uppercase font-sans font-black">PARAGRAPHS</div>
            </div>
            <div className="bg-[#14B8A6] text-white p-3 comic-border-sm rounded-xl text-center">
              <div className="text-2xl font-black">~{readingTime}m</div>
              <div className="text-[10px] uppercase font-sans font-black">READ TIME</div>
            </div>
          </div>
        )}

        {/* Typo Hero Case Transforms */}
        {activeTab === 'case-converter' && (
          <div className="flex flex-wrap gap-2">
            <button onClick={toUpper} className="btn-comic bg-[#F43F5E] text-white text-xs px-3 py-2 font-black">UPPERCASE</button>
            <button onClick={toLower} className="btn-comic bg-[#F43F5E] text-white text-xs px-3 py-2 font-black">lowercase</button>
            <button onClick={toTitle} className="btn-comic bg-[#F43F5E] text-white text-xs px-3 py-2 font-black">Title Case</button>
            <button onClick={toCamel} className="btn-comic bg-[#F43F5E] text-white text-xs px-3 py-2 font-black">camelCase</button>
            <button onClick={toKebab} className="btn-comic bg-[#F43F5E] text-white text-xs px-3 py-2 font-black">kebab-case</button>
            <button onClick={toSnake} className="btn-comic bg-[#F43F5E] text-white text-xs px-3 py-2 font-black">snake_case</button>
          </div>
        )}

        {/* Cleaner Actions */}
        {activeTab === 'text-cleaner' && (
          <div className="flex flex-wrap gap-3">
            <button onClick={removeExtraSpaces} className="btn-comic bg-[#84CC16] text-black text-xs px-4 py-2 font-black">
              REMOVE EXTRA SPACES
            </button>
            <button onClick={removeDuplicates} className="btn-comic bg-[#84CC16] text-black text-xs px-4 py-2 font-black">
              REMOVE DUPLICATE LINES
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TextToolsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-black">⚡ LOADING TEXT TOOLS...</div>}>
      <TextToolsContent />
    </Suspense>
  );
}

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Code, FileCode, Lock, Fingerprint, Copy, Check } from 'lucide-react';
import { sound } from '@/lib/sound';

const DEV_THEMES = {
  'json-formatter': {
    name: 'JSON Formatter',
    heroIdentity: 'THE CODE HERO',
    issueNo: '#012',
    hexColor: '#3B82F6',
    bgColorClass: 'bg-[#3B82F6]',
    textColorClass: 'text-white',
    tagline: '"FUTURISTIC CODING SUPERHERO — MAKE THE CHAOS READABLE."',
    icon: Code,
  },
  base64: {
    name: 'Base64',
    heroIdentity: 'THE ENCODER',
    issueNo: '#013',
    hexColor: '#00D2FF',
    bgColorClass: 'bg-[#00D2FF]',
    textColorClass: 'text-black',
    tagline: '"DIGITAL TRANSFORMATION SUPERHERO — ENCODE & DECODE RAW STRINGS."',
    icon: FileCode,
  },
  hash: {
    name: 'SHA Hash',
    heroIdentity: 'THE HASH GUARDIAN',
    issueNo: '#014',
    hexColor: '#4338CA',
    bgColorClass: 'bg-[#4338CA]',
    textColorClass: 'text-white',
    tagline: '"MYSTERIOUS CYBERSECURITY GUARDIAN — CRYPTOGRAPHIC SHA-256 HASHES."',
    icon: Lock,
  },
  uuid: {
    name: 'UUID Generator',
    heroIdentity: 'THE IDENTITY HERO',
    issueNo: '#015',
    hexColor: '#EAB308',
    bgColorClass: 'bg-[#EAB308]',
    textColorClass: 'text-black',
    tagline: '"IDENTITY & UNIQUENESS SUPERHERO — BULK RFC4122 v4 IDENTIFIERS."',
    icon: Fingerprint,
  },
};

function DeveloperToolsContent() {
  const searchParams = useSearchParams();
  const requestedTool = searchParams.get('tool') as keyof typeof DEV_THEMES || 'json-formatter';

  const [activeTab, setActiveTab] = useState<keyof typeof DEV_THEMES>(
    DEV_THEMES[requestedTool] ? requestedTool : 'json-formatter'
  );

  useEffect(() => {
    const t = searchParams.get('tool') as keyof typeof DEV_THEMES;
    if (t && DEV_THEMES[t]) {
      setActiveTab(t);
    }
  }, [searchParams]);

  const currentTheme = DEV_THEMES[activeTab] || DEV_THEMES['json-formatter'];
  const ThemeIcon = currentTheme.icon;

  // State
  const [jsonInput, setJsonInput] = useState('{"hero":"Code Hero","status":"Active","power":100}');
  const [jsonOutput, setJsonOutput] = useState('');

  const [base64Input, setBase64Input] = useState('Hello Deion Hub!');
  const [base64Output, setBase64Output] = useState('');

  const [hashInput, setHashInput] = useState('DeionHubSecurity2026');
  const [hashResult, setHashResult] = useState('');

  const [uuidList, setUuidList] = useState<string[]>([]);
  const [uuidCount, setUuidCount] = useState(5);

  const [copied, setCopied] = useState(false);

  const copyText = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    sound.playPop();
    setTimeout(() => setCopied(false), 2000);
  };

  // Actions
  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonOutput(JSON.stringify(parsed, null, 2));
    } catch {
      setJsonOutput('❌ Invalid JSON payload.');
    }
  };

  const encodeB64 = () => {
    try {
      setBase64Output(btoa(base64Input));
    } catch {
      setBase64Output('❌ Encoding error');
    }
  };

  const decodeB64 = () => {
    try {
      setBase64Output(atob(base64Input));
    } catch {
      setBase64Output('❌ Invalid Base64 string');
    }
  };

  const generateHashes = async () => {
    const encoder = new TextEncoder();
    const data = encoder.encode(hashInput);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    setHashResult(hashHex);
  };

  const generateUuids = () => {
    const list: string[] = [];
    for (let i = 0; i < uuidCount; i++) {
      list.push(crypto.randomUUID());
    }
    setUuidList(list);
  };

  useEffect(() => {
    if (activeTab === 'hash') generateHashes();
    if (activeTab === 'uuid') generateUuids();
    if (activeTab === 'base64') encodeB64();
    if (activeTab === 'json-formatter') formatJson();
  }, [activeTab]);

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
        {Object.entries(DEV_THEMES).map(([key, theme]) => (
          <button
            key={key}
            onClick={() => {
              setActiveTab(key as keyof typeof DEV_THEMES);
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

      {/* Workspace Body */}
      <div 
        className="bg-white comic-border-lg shadow-comic-lg p-6 sm:p-8 rounded-2xl"
        style={{
          borderTopWidth: '8px',
          borderTopColor: currentTheme.hexColor,
        }}
      >
        {activeTab === 'json-formatter' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <button onClick={formatJson} className="btn-comic bg-[#3B82F6] text-white text-xs px-4 py-2 font-black">PRETTIFY JSON</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              <div>
                <label className="block font-sans text-xs font-black mb-1 uppercase">RAW JSON INPUT</label>
                <textarea value={jsonInput} onChange={(e) => setJsonInput(e.target.value)} rows={10} className="comic-input w-full" />
              </div>
              <div>
                <label className="block font-sans text-xs font-black mb-1 uppercase">FORMATTED OUTPUT</label>
                <textarea value={jsonOutput} readOnly rows={10} className="comic-input w-full bg-gray-900 text-green-400 font-mono" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'base64' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <button onClick={encodeB64} className="btn-comic bg-[#00D2FF] text-black text-xs px-4 py-2 font-black">ENCODE TO BASE64</button>
              <button onClick={decodeB64} className="btn-comic bg-[#00D2FF] text-black text-xs px-4 py-2 font-black">DECODE BASE64</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              <div>
                <label className="block font-sans text-xs font-black mb-1 uppercase">PLAIN TEXT</label>
                <textarea value={base64Input} onChange={(e) => setBase64Input(e.target.value)} rows={8} className="comic-input w-full" />
              </div>
              <div>
                <label className="block font-sans text-xs font-black mb-1 uppercase">BASE64 OUTPUT</label>
                <textarea value={base64Output} readOnly rows={8} className="comic-input w-full bg-gray-900 text-cyan-300 font-mono" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hash' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black mb-1 uppercase">Enter Plaintext String</label>
              <input value={hashInput} onChange={(e) => { setHashInput(e.target.value); generateHashes(); }} className="comic-input w-full text-base font-mono" />
            </div>

            <div className="bg-[#4338CA] text-white p-6 comic-border-md rounded-xl space-y-2 font-mono">
              <div className="text-xs uppercase font-sans font-black">SHA-256 CRYPTOGRAPHIC HASH</div>
              <div className="text-sm font-black break-all">{hashResult || 'Generating...'}</div>
            </div>
          </div>
        )}

        {activeTab === 'uuid' && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <button onClick={generateUuids} className="btn-comic bg-[#EAB308] text-black text-xs px-4 py-2 font-black">GENERATE NEW UUIDS</button>
              <input type="number" value={uuidCount} onChange={(e) => setUuidCount(Number(e.target.value))} min={1} max={50} className="comic-input w-20 text-center text-xs font-bold" />
            </div>

            <div className="bg-gray-900 text-yellow-400 p-6 comic-border-md rounded-xl space-y-2 font-mono text-xs">
              {uuidList.map((id, idx) => (
                <div key={idx} className="flex justify-between items-center py-1 border-b border-gray-800">
                  <span>{id}</span>
                  <button onClick={() => copyText(id)} className="text-white text-[10px] bg-black px-2 py-0.5 border border-gray-700 rounded hover:bg-yellow-400 hover:text-black">COPY</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DeveloperToolsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-black">⚡ LOADING DEVELOPER TOOLS...</div>}>
      <DeveloperToolsContent />
    </Suspense>
  );
}

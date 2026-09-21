'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Ruler, Binary, RefreshCw } from 'lucide-react';
import { sound } from '@/lib/sound';

const CONVERTER_THEMES = {
  units: {
    name: 'Unit Converters',
    heroIdentity: 'THE TRANSFORMER',
    issueNo: '#007',
    hexColor: '#06B6D4',
    bgColorClass: 'bg-[#06B6D4]',
    textColorClass: 'text-black',
    tagline: '"REALITY-CONVERTING SUPERHERO — MEASURE & TRANSFORM ANYTHING."',
    icon: Ruler,
  },
  'number-sys': {
    name: 'Number System Converters',
    heroIdentity: 'THE NUMBER MAGE',
    issueNo: '#008',
    hexColor: '#EC4899',
    bgColorClass: 'bg-[#EC4899]',
    textColorClass: 'text-white',
    tagline: '"DIGITAL MATHEMATICS SUPERHERO — BINARY, HEX, OCTAL & DECIMAL MAGIC."',
    icon: Binary,
  },
};

function ConvertersContent() {
  const searchParams = useSearchParams();
  const requestedTool = searchParams.get('tool') as keyof typeof CONVERTER_THEMES || 'units';

  const [activeTab, setActiveTab] = useState<keyof typeof CONVERTER_THEMES>(
    CONVERTER_THEMES[requestedTool] ? requestedTool : 'units'
  );

  useEffect(() => {
    const t = searchParams.get('tool') as keyof typeof CONVERTER_THEMES;
    if (t && CONVERTER_THEMES[t]) {
      setActiveTab(t);
    }
  }, [searchParams]);

  const currentTheme = CONVERTER_THEMES[activeTab] || CONVERTER_THEMES.units;
  const ThemeIcon = currentTheme.icon;

  // Unit converter state
  const [val, setVal] = useState('100');
  const [unitType, setUnitType] = useState<'length' | 'weight' | 'data'>('length');

  // Number system state
  const [decimalVal, setDecimalVal] = useState('42');

  const num = parseFloat(val) || 0;
  const dec = parseInt(decimalVal, 10) || 0;

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
        {Object.entries(CONVERTER_THEMES).map(([key, theme]) => (
          <button
            key={key}
            onClick={() => {
              setActiveTab(key as keyof typeof CONVERTER_THEMES);
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

      {/* Body */}
      <div 
        className="bg-white comic-border-lg shadow-comic-lg p-6 sm:p-8 rounded-2xl"
        style={{
          borderTopWidth: '8px',
          borderTopColor: currentTheme.hexColor,
        }}
      >
        {activeTab === 'units' && (
          <div className="space-y-6">
            <div className="flex gap-2">
              {(['length', 'weight', 'data'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setUnitType(t)}
                  className={`btn-comic text-xs px-3 py-1 font-black uppercase ${unitType === t ? 'bg-[#06B6D4] text-black' : 'btn-comic-white'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-black mb-1 uppercase">Enter Value ({unitType === 'length' ? 'Meters' : unitType === 'weight' ? 'Kilograms' : 'Gigabytes'})</label>
              <input
                type="number"
                value={val}
                onChange={(e) => setVal(e.target.value)}
                className="comic-input w-full max-w-md text-lg font-bold"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono font-bold text-sm">
              {unitType === 'length' && (
                <>
                  <div className="bg-[#06B6D4]/20 p-4 border-2 border-black rounded-xl">Feet: {(num * 3.28084).toFixed(2)} ft</div>
                  <div className="bg-[#06B6D4]/20 p-4 border-2 border-black rounded-xl">Inches: {(num * 39.3701).toFixed(2)} in</div>
                  <div className="bg-[#06B6D4]/20 p-4 border-2 border-black rounded-xl">Kilometers: {(num / 1000).toFixed(3)} km</div>
                </>
              )}
              {unitType === 'weight' && (
                <>
                  <div className="bg-[#06B6D4]/20 p-4 border-2 border-black rounded-xl">Pounds (lbs): {(num * 2.20462).toFixed(2)} lbs</div>
                  <div className="bg-[#06B6D4]/20 p-4 border-2 border-black rounded-xl">Ounces (oz): {(num * 35.274).toFixed(2)} oz</div>
                  <div className="bg-[#06B6D4]/20 p-4 border-2 border-black rounded-xl">Grams: {(num * 1000).toLocaleString()} g</div>
                </>
              )}
              {unitType === 'data' && (
                <>
                  <div className="bg-[#06B6D4]/20 p-4 border-2 border-black rounded-xl">Megabytes (MB): {(num * 1024).toLocaleString()} MB</div>
                  <div className="bg-[#06B6D4]/20 p-4 border-2 border-black rounded-xl">Kilobytes (KB): {(num * 1024 * 1024).toLocaleString()} KB</div>
                  <div className="bg-[#06B6D4]/20 p-4 border-2 border-black rounded-xl">Terabytes (TB): {(num / 1024).toFixed(4)} TB</div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'number-sys' && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black mb-1 uppercase">Enter Decimal Number</label>
              <input
                type="number"
                value={decimalVal}
                onChange={(e) => setDecimalVal(e.target.value)}
                className="comic-input w-full max-w-md text-lg font-bold"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono font-bold text-sm">
              <div className="bg-[#EC4899] text-white p-5 comic-border-md rounded-xl space-y-1">
                <div className="text-xs uppercase text-white/80 font-sans font-black">BINARY (BASE 2)</div>
                <div className="text-xl font-black">{dec.toString(2)}</div>
              </div>
              <div className="bg-[#EC4899] text-white p-5 comic-border-md rounded-xl space-y-1">
                <div className="text-xs uppercase text-white/80 font-sans font-black">HEXADECIMAL (BASE 16)</div>
                <div className="text-xl font-black">0x{dec.toString(16).toUpperCase()}</div>
              </div>
              <div className="bg-[#EC4899] text-white p-5 comic-border-md rounded-xl space-y-1">
                <div className="text-xs uppercase text-white/80 font-sans font-black">OCTAL (BASE 8)</div>
                <div className="text-xl font-black">0o{dec.toString(8)}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ConvertersPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-black">⚡ LOADING CONVERTERS...</div>}>
      <ConvertersContent />
    </Suspense>
  );
}

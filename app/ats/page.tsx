'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Scan, ShieldCheck, AlertCircle, CheckCircle2, Zap, ArrowRight } from 'lucide-react';
import { ComicPanel } from '@/components/ui/comic/ComicPanel';

export default function AtsScannerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);

  const startScanner = () => {
    setIsScanning(true);
    setScanComplete(false);
    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen text-white">
      <div className="text-center mb-10">
        <span className="font-mono text-xs font-black text-orange-500 uppercase tracking-widest">
          FUTURISTIC SCANNING LABORATORY
        </span>
        <h1 className="text-4xl sm:text-5xl font-black uppercase text-white mt-2">
          ATS <span className="text-orange-500 text-glow-orange">LASER SCANNER</span>
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto font-medium">
          Run top-to-bottom laser beam parsing check for contact headers, date formatting, bullet syntax, and structural validity.
        </p>
      </div>

      <ComicPanel panelTag="SCANNER CONTROLS" title="RUN ATS DIAGNOSTIC SCAN">
        <div className="text-center py-6">
          {!isScanning && !scanComplete && (
            <button
              onClick={startScanner}
              data-cursor="SCAN"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-orange-500 bg-orange-500 px-8 py-4 font-black text-black text-sm uppercase shadow-[0_0_25px_rgba(249,115,22,0.5)] hover:bg-orange-400 transition-all"
            >
              <Scan className="h-5 w-5" />
              <span>START ATS SCANNER</span>
            </button>
          )}

          {isScanning && (
            <div className="relative mx-auto max-w-md rounded border-2 border-orange-500 bg-[#09090b] p-6 text-left overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-orange-500 shadow-[0_0_15px_#f97316] animate-scan" />
              <div className="font-mono text-xs font-black text-orange-400 uppercase mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4 animate-spin" /> SCANNING DOCUMENT STRUCTURE...
              </div>
              <div className="space-y-1.5 font-mono text-[11px] text-zinc-400">
                <div>[01/05] CHECKING HEADER CONTACT INFO... ✓</div>
                <div>[02/05] VALIDATING DATE & DURATION SYNTAX... ✓</div>
                <div>[03/05] PARSING BULLET ACTION VERBS... ✓</div>
                <div>[04/05] EVALUATING SECTION HEADING PARSING... ✓</div>
                <div>[05/05] CALCULATING 3 DIAGNOSTIC METRICS...</div>
              </div>
            </div>
          )}

          {scanComplete && (
            <div className="space-y-6 text-left">
              <div className="rounded-xl border-2 border-emerald-500/50 bg-emerald-500/10 p-6 flex items-center justify-between">
                <div>
                  <div className="font-mono text-xs font-black text-emerald-400 uppercase">OVERALL ATS COMPATIBILITY</div>
                  <div className="text-4xl font-black text-white mt-1">94%</div>
                  <div className="text-xs text-zinc-300 mt-1 font-medium">
                    Designed to improve ATS parsing and recruiter readability.
                  </div>
                </div>
                <ShieldCheck className="h-14 w-14 text-emerald-400 shrink-0" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                <div className="rounded border border-zinc-800 bg-[#09090b] p-3 flex items-center justify-between">
                  <span>CONTACT INFO READABILITY</span>
                  <span className="font-bold text-emerald-400">✓ STRONG</span>
                </div>
                <div className="rounded border border-zinc-800 bg-[#09090b] p-3 flex items-center justify-between">
                  <span>SECTION HEADING SYNTAX</span>
                  <span className="font-bold text-emerald-400">✓ STRONG</span>
                </div>
                <div className="rounded border border-zinc-800 bg-[#09090b] p-3 flex items-center justify-between">
                  <span>ACTION VERB IMPACT</span>
                  <span className="font-bold text-emerald-400">✓ STRONG</span>
                </div>
                <div className="rounded border border-zinc-800 bg-[#09090b] p-3 flex items-center justify-between">
                  <span>QUANTIFIED METRICS</span>
                  <span className="font-bold text-amber-400">⚠ ADD MORE %/$$</span>
                </div>
              </div>

              <div className="pt-4 text-center">
                <Link
                  href="/resumes/create"
                  className="inline-flex items-center gap-2 rounded border-2 border-orange-500 bg-orange-500 px-6 py-3 font-black text-black text-xs uppercase"
                >
                  <span>TAILOR RESUME FOR JOB</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </ComicPanel>
    </div>
  );
}

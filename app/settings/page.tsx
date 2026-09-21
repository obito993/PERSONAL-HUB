'use client';

import React, { useState } from 'react';
import { Settings, ShieldCheck, Moon, Bell, Cpu, ArrowRight } from 'lucide-react';
import { ComicPanel } from '@/components/ui/comic/ComicPanel';

export default function SettingsPage() {
  const [motionReduced, setMotionReduced] = useState(false);
  const [aiGuardrails, setAiGuardrails] = useState(true);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen text-white">
      <div className="text-center mb-10">
        <span className="font-mono text-xs font-black text-orange-500 uppercase tracking-widest">
          FUTURISTIC CONTROL PANEL
        </span>
        <h1 className="text-4xl font-black uppercase text-white mt-2">
          SYSTEM <span className="text-orange-500 text-glow-orange">SETTINGS</span>
        </h1>
      </div>

      <div className="space-y-6">
        <ComicPanel panelTag="PREFERENCES 01" title="AI GUARDRAILS & ACCESSIBILITY">
          <div className="space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between p-3 rounded bg-zinc-950 border border-zinc-800">
              <div>
                <div className="font-bold text-white">ANTI-HALLUCINATION GUARDRAILS</div>
                <div className="text-[11px] text-zinc-400">Strictly enforce zero invented employers or credentials</div>
              </div>
              <input
                type="checkbox"
                checked={aiGuardrails}
                onChange={(e) => setAiGuardrails(e.target.checked)}
                className="h-4 w-4 accent-orange-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded bg-zinc-950 border border-zinc-800">
              <div>
                <div className="font-bold text-white">REDUCE UI MOTION</div>
                <div className="text-[11px] text-zinc-400">Simplify animations for prefers-reduced-motion accessibility</div>
              </div>
              <input
                type="checkbox"
                checked={motionReduced}
                onChange={(e) => setMotionReduced(e.target.checked)}
                className="h-4 w-4 accent-orange-500"
              />
            </div>
          </div>
        </ComicPanel>

        <ComicPanel panelTag="PREFERENCES 02" title="ACCOUNT & SYSTEM INFORMATION">
          <div className="font-mono text-xs text-zinc-400 space-y-2">
            <div>PLATFORM VERSION: <span className="text-orange-400 font-bold">2.0.0 (COMIC HQ)</span></div>
            <div>AI MODEL ENGINE: <span className="text-orange-400 font-bold">GEMINI 1.5 FLASH + LOCAL NLP</span></div>
            <div>DATABASE ENGINE: <span className="text-emerald-400 font-bold">PRISMA SQLITE CONNECTED</span></div>
          </div>
        </ComicPanel>
      </div>
    </div>
  );
}

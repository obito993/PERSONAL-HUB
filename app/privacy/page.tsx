'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="bg-white comic-border-lg p-6 sm:p-8 shadow-comic space-y-4">
        <Link href="/" className="text-xs font-black hover:underline flex items-center gap-1 mb-2">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO HUB</span>
        </Link>
        
        <div className="flex items-center gap-2">
          <span className="comic-sticker comic-sticker-yellow">
            DATA TRANSPARENCY
          </span>
        </div>

        <h1 className="font-black text-4xl sm:text-6xl uppercase tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-green-600" />
          <span>PRIVACY POLICY</span>
        </h1>
      </div>

      {/* Main Privacy Body */}
      <div className="bg-white comic-border-lg p-6 sm:p-8 shadow-comic space-y-6 font-sans leading-relaxed">
        
        <div className="speech-bubble text-sm font-extrabold bg-[#FFFDF5]">
          &quot;Your data belongs to you. Period.&quot;
        </div>

        <div className="space-y-4 text-xs sm:text-sm font-bold text-gray-800">
          <h2 className="font-black text-lg uppercase text-black border-b-2 border-black pb-1">1. Local-First Data Storage</h2>
          <p>
            Your Personal Hub is built on a 100% local-first architecture. All your tasks, habits, expenses, job applications, study notes, XP progress, and preferences are stored directly in your browser&apos;s <code className="bg-gray-100 px-1 border border-black">localStorage</code>. No personal data is transmitted to or stored on external servers.
          </p>

          <h2 className="font-black text-lg uppercase text-black border-b-2 border-black pb-1">2. Client-Side Tool Processing</h2>
          <p>
            All PDF operations, image resizing & compression, text utilities, developer formatters (JSON, Base64, SHA-256), and QR code generation are executed entirely client-side using JavaScript in your browser memory.
          </p>

          <h2 className="font-black text-lg uppercase text-black border-b-2 border-black pb-1">3. AI Service Queries</h2>
          <p>
            When using The Intelligence AI Hub, requests default to local execution via Ollama (http://localhost:11434) with zero external data transmission. If Ollama is unavailable and cloud fallbacks are enabled, requests are sent securely to configured cloud providers (Gemini/Groq) via HTTPS.
          </p>

          <h2 className="font-black text-lg uppercase text-black border-b-2 border-black pb-1">4. Clearing Your Data</h2>
          <p>
            You can clear all stored data at any time from the <Link href="/settings" className="underline text-[#FF5A5F]">Settings Page</Link> or by clearing your browser site data.
          </p>
        </div>

      </div>

    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, QrCode, Download, Share2, Copy, Check } from 'lucide-react';
import QRCode from 'qrcode';
import { sound } from '@/lib/sound';

export default function QrGeneratorPage() {
  const [text, setText] = useState('https://deionhub.com');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (text) {
      QRCode.toDataURL(text, { width: 300, margin: 2, color: { dark: '#000000', light: '#FFFFFF' } })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error(err));
    }
  }, [text]);

  const downloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = 'deion-hub-qr.png';
    a.click();
    sound.playPop();
  };

  return (
    <div className="space-y-8 py-6">
      {/* Hero Banner — Deep Purple Universe */}
      <div className="bg-[#6D28D9] text-white comic-border-lg p-6 sm:p-8 shadow-comic-lg space-y-4 rounded-2xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <Link 
            href="/tools" 
            className="text-xs font-black hover:underline flex items-center gap-1.5 bg-black text-white px-3 py-1 rounded-lg border border-white shadow-[2px_2px_0_#000]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO TOOLBOX</span>
          </Link>
          <span className="bg-black text-white font-mono font-black text-xs px-3 py-1 border border-white rounded-lg">
            ISSUE #016
          </span>
        </div>

        <div className="space-y-1">
          <div className="font-mono text-xs font-black uppercase tracking-widest text-purple-200">
            THE SIGNAL HERO
          </div>
          <h1 className="font-black text-3xl sm:text-5xl uppercase tracking-tight flex items-center gap-3">
            <QrCode className="w-9 h-9 stroke-[2.8]" />
            <span>QR Generator</span>
          </h1>
          <p className="font-bold text-xs sm:text-sm italic text-purple-100">
            &quot;COMMUNICATION & SIGNAL SUPERHERO — TRANSMIT DATA INSTANTLY.&quot;
          </p>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="bg-white comic-border-lg shadow-comic-lg p-6 sm:p-8 rounded-2xl border-t-8 border-[#6D28D9] grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black mb-1 uppercase">Enter URL or Payload</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="Enter URL, text, or Wi-Fi credentials..."
              className="comic-input w-full text-base font-medium"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={downloadQr}
              disabled={!qrDataUrl}
              className="btn-comic bg-[#6D28D9] text-white text-xs px-4 py-3 font-black flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>DOWNLOAD PNG</span>
            </button>
          </div>
        </div>

        {/* QR Preview Frame */}
        <div className="flex flex-col items-center justify-center p-6 bg-[#6D28D9]/10 comic-border-md rounded-2xl space-y-4">
          <div className="font-mono text-xs font-black uppercase text-gray-700">HIGH RESOLUTION SIGNAL PREVIEW</div>
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="Generated QR Code" className="w-48 h-48 border-4 border-black shadow-comic-md bg-white p-2" />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center font-black text-gray-400">GENERATING SIGNAL...</div>
          )}
        </div>
      </div>
    </div>
  );
}

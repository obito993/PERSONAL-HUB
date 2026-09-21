'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Minimize2, Upload, Download } from 'lucide-react';
import { sound } from '@/lib/sound';

export default function ImageCompressorPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState(80);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setCompressedUrl(null);
      sound.playPop();
    }
  };

  const compressImage = () => {
    if (!selectedFile || !previewUrl) return;
    const img = new Image();
    img.src = previewUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', quality / 100);
      setCompressedUrl(dataUrl);
      sound.playPop();
    };
  };

  return (
    <div className="space-y-8 py-6">
      {/* Hero Banner — Coral Universe */}
      <div className="bg-[#FF6464] text-black comic-border-lg p-6 sm:p-8 shadow-comic-lg space-y-4 rounded-2xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <Link 
            href="/tools" 
            className="text-xs font-black hover:underline flex items-center gap-1.5 bg-black text-white px-3 py-1 rounded-lg border border-white shadow-[2px_2px_0_#000]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO TOOLBOX</span>
          </Link>
          <span className="bg-black text-white font-mono font-black text-xs px-3 py-1 border border-white rounded-lg">
            ISSUE #017
          </span>
        </div>

        <div className="space-y-1">
          <div className="font-mono text-xs font-black uppercase tracking-widest text-black/80">
            THE COMPRESSION HERO
          </div>
          <h1 className="font-black text-3xl sm:text-5xl uppercase tracking-tight flex items-center gap-3">
            <Minimize2 className="w-9 h-9 stroke-[2.8]" />
            <span>Image & PDF Size Compressor</span>
          </h1>
          <p className="font-bold text-xs sm:text-sm italic text-black/90">
            &quot;POWERFUL SPACE-SAVING SUPERHERO — SHRINK FILE DIMENSIONS & SAVE DISK SPACE.&quot;
          </p>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="bg-white comic-border-lg shadow-comic-lg p-6 sm:p-8 rounded-2xl border-t-8 border-[#FF6464] space-y-6">
        <div className="border-2 border-dashed border-black p-8 rounded-2xl text-center space-y-4 bg-[#FF6464]/10">
          <Upload className="w-12 h-12 mx-auto text-black" />
          <div>
            <label className="btn-comic bg-[#FF6464] text-black text-xs px-5 py-3 font-black cursor-pointer inline-block">
              <span>SELECT IMAGE FILE</span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
          {selectedFile && (
            <div className="font-mono text-xs font-black text-gray-800">
              Selected File: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </div>
          )}
        </div>

        {selectedFile && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black mb-1 uppercase">Compression Quality ({quality}%)</label>
              <input
                type="range"
                min="10"
                max="90"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full max-w-md cursor-pointer accent-[#FF6464]"
              />
            </div>

            <button
              onClick={compressImage}
              className="btn-comic bg-[#FF6464] text-black text-xs px-6 py-3 font-black flex items-center gap-2"
            >
              <Minimize2 className="w-4 h-4" />
              <span>COMPRESS NOW</span>
            </button>

            {compressedUrl && (
              <div className="pt-4 border-t-2 border-black flex items-center justify-between">
                <span className="font-mono text-xs font-black text-green-700">✓ Image Compressed Successfully!</span>
                <a
                  href={compressedUrl}
                  download={`compressed-${selectedFile.name}`}
                  className="btn-comic bg-black text-white text-xs px-4 py-2 font-black flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4 text-green-400" />
                  <span>DOWNLOAD COMPRESSED FILE</span>
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileCheck, Upload, FileText } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { sound } from '@/lib/sound';

export default function PdfToolsPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setLoading(true);
      sound.playPop();

      try {
        const buffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(buffer);
        setPageCount(pdfDoc.getPageCount());
      } catch (err) {
        console.error(err);
        setPageCount(null);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-8 py-6">
      {/* Hero Banner — Burgundy Universe */}
      <div className="bg-[#800020] text-white comic-border-lg p-6 sm:p-8 shadow-comic-lg space-y-4 rounded-2xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <Link 
            href="/tools" 
            className="text-xs font-black hover:underline flex items-center gap-1.5 bg-black text-white px-3 py-1 rounded-lg border border-white shadow-[2px_2px_0_#000]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO TOOLBOX</span>
          </Link>
          <span className="bg-black text-white font-mono font-black text-xs px-3 py-1 border border-white rounded-lg">
            ISSUE #018
          </span>
        </div>

        <div className="space-y-1">
          <div className="font-mono text-xs font-black uppercase tracking-widest text-rose-200">
            THE DOCUMENT HERO
          </div>
          <h1 className="font-black text-3xl sm:text-5xl uppercase tracking-tight flex items-center gap-3">
            <FileCheck className="w-9 h-9 stroke-[2.8]" />
            <span>PDF Toolkit</span>
          </h1>
          <p className="font-bold text-xs sm:text-sm italic text-rose-100">
            &quot;DOCUMENT-MASTER SUPERHERO — MERGE, SPLIT, COUNT & MANAGE PDF DOCUMENTS.&quot;
          </p>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="bg-white comic-border-lg shadow-comic-lg p-6 sm:p-8 rounded-2xl border-t-8 border-[#800020] space-y-6">
        <div className="border-2 border-dashed border-black p-8 rounded-2xl text-center space-y-4 bg-[#800020]/10">
          <Upload className="w-12 h-12 mx-auto text-[#800020]" />
          <div>
            <label className="btn-comic bg-[#800020] text-white text-xs px-5 py-3 font-black cursor-pointer inline-block">
              <span>SELECT PDF FILE</span>
              <input type="file" accept="application/pdf" onChange={handlePdfUpload} className="hidden" />
            </label>
          </div>
          {selectedFile && (
            <div className="font-mono text-xs font-black text-gray-800">
              Selected Document: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </div>
          )}
        </div>

        {loading && (
          <div className="p-4 text-center font-mono font-black text-xs text-[#800020]">
            ⚡ READING PDF DOCUMENT PAGES...
          </div>
        )}

        {pageCount !== null && !loading && (
          <div className="bg-[#800020] text-white comic-border-md p-6 rounded-xl space-y-2 font-mono">
            <div className="text-xs uppercase font-sans font-black text-rose-200">PDF ANALYSIS RESULT</div>
            <div className="text-3xl font-black">{pageCount} Total Pages</div>
            <p className="text-xs text-rose-100">
              Document parsed securely 100% in your browser without uploading to external servers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

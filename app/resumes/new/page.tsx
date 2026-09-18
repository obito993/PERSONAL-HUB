'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, ArrowRight, Loader2, Edit3, Trash2 } from 'lucide-react';
import { ParsedResume } from '@/types';

export default function NewResumePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const [resumeId, setResumeId] = useState<string | null>(null);

  const handleFileChange = (selectedFile: File) => {
    setError('');
    // Validation
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'txt'].includes(ext || '')) {
      setError('Please select a valid PDF, DOCX, or TXT file.');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      return;
    }
    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/resumes', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to parse resume file.');
        setUploading(false);
        return;
      }

      setResumeId(data.resume.id);
      setParsedResume(data.resume.structuredData);
    } catch {
      setError('An unexpected error occurred during document parsing.');
    } finally {
      setUploading(false);
    }
  };

  const handleProceedToJob = () => {
    if (resumeId) {
      router.push(`/jobs/new?resumeId=${resumeId}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Upload Your Resume</h1>
        <p className="text-xs text-zinc-400 mt-1">Upload your PDF, DOCX, or TXT resume to convert it into structured JSON</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!parsedResume ? (
        <div className="space-y-6">
          {/* Drag & Drop Box */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`p-10 rounded-2xl border-2 border-dashed text-center transition-all ${
              dragActive
                ? 'border-orange-500 bg-orange-500/10'
                : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-zinc-800/80 flex items-center justify-center mx-auto text-orange-400 mb-4">
              <UploadCloud className="w-8 h-8" />
            </div>

            <h3 className="text-base font-bold text-white">Drag and drop your resume file</h3>
            <p className="text-xs text-zinc-400 mt-1">Supports PDF, DOCX, and TXT up to 10MB</p>

            <div className="mt-6">
              <label className="cursor-pointer px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition-colors inline-block">
                <span>Browse Files</span>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                />
              </label>
            </div>
          </div>

          {/* Selected File Card */}
          {file && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-orange-400" />
                <div>
                  <div className="text-sm font-bold text-white">{file.name}</div>
                  <div className="text-[11px] text-zinc-500">{(file.size / 1024).toFixed(1)} KB</div>
                </div>
              </div>

              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-extrabold text-xs shadow-lg shadow-orange-500/20 flex items-center gap-2 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Parsing Resume...</span>
                  </>
                ) : (
                  <>
                    <span>Extract & Process</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.div>
          )}
        </div>
      ) : (
        /* Parsed JSON Review & Edit Section */
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
          <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="font-semibold">Resume parsed successfully! Review your extracted details below.</span>
            </div>
            <button
              onClick={handleProceedToJob}
              className="px-5 py-2 rounded-xl bg-orange-500 text-black font-extrabold text-xs shadow-lg shadow-orange-500/20 flex items-center gap-1.5"
            >
              <span>Next: Paste Job Post</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-zinc-800 pb-3 flex items-center justify-between">
              <span>Extracted Resume Information</span>
              <span className="text-xs text-zinc-400 font-normal">Edit details if needed</span>
            </h2>

            {/* Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={parsedResume.contact.name}
                  onChange={(e) =>
                    setParsedResume({
                      ...parsedResume,
                      contact: { ...parsedResume.contact, name: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Email Address</label>
                <input
                  type="email"
                  value={parsedResume.contact.email}
                  onChange={(e) =>
                    setParsedResume({
                      ...parsedResume,
                      contact: { ...parsedResume.contact, email: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white"
                />
              </div>
            </div>

            {/* Summary */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Professional Summary</label>
              <textarea
                rows={3}
                value={parsedResume.summary}
                onChange={(e) => setParsedResume({ ...parsedResume, summary: e.target.value })}
                className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white"
              />
            </div>

            {/* Technical Skills */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Extracted Technical Skills</label>
              <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                {parsedResume.skills.technical.map((skill, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-200 text-xs font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Experience List */}
            <div>
              <label className="block text-xs text-zinc-400 mb-2 font-bold uppercase tracking-wider">Experience History</label>
              <div className="space-y-3">
                {parsedResume.experience.map((exp, idx) => (
                  <div key={exp.id || idx} className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs">
                    <div className="font-bold text-white">{exp.title} — {exp.company}</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">{exp.startDate} – {exp.endDate}</div>
                    <ul className="mt-2 list-disc list-inside text-zinc-400 space-y-0.5">
                      {exp.bullets.map((b, bIdx) => (
                        <li key={bIdx}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

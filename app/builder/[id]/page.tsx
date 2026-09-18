'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ResumeRenderer } from '@/components/templates/ResumeRenderer';
import { exportToDocx, triggerPrintPdf } from '@/lib/export/export-utils';
import {
  Download,
  FileText,
  Sliders,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Save,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Layout,
  Layers,
} from 'lucide-react';
import { ParsedResume, WorkExperience, Education, Project } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ResumeBuilderPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [resume, setResume] = useState<ParsedResume | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [fullscreen, setFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'contact' | 'summary' | 'skills' | 'experience' | 'education' | 'projects'>('contact');

  const [saving, setSaving] = useState(false);
  const [exportingDocx, setExportingDocx] = useState(false);
  const [saveNotification, setSaveNotification] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tailor/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.tailoredResume) {
          setResume(data.tailoredResume.content);
          setSelectedTemplate(data.tailoredResume.template || 'classic');
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!resume) return;
    setSaving(true);

    try {
      await fetch(`/api/tailor/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: resume, template: selectedTemplate }),
      });
      setSaveNotification('Draft auto-saved successfully!');
      setTimeout(() => setSaveNotification(''), 3000);
    } catch {
      setSaveNotification('Error saving draft.');
    } finally {
      setSaving(false);
    }
  };

  const handleDocxExport = async () => {
    if (!resume) return;
    setExportingDocx(true);
    try {
      await exportToDocx(resume, `${resume.contact.name || 'Tailored'}_Resume.docx`);
    } finally {
      setExportingDocx(false);
    }
  };

  const handlePdfExport = () => {
    triggerPrintPdf('resume-preview-content');
  };

  if (loading || !resume) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-zinc-400 font-mono">Loading live resume builder...</p>
      </div>
    );
  }

  const templatesList = [
    { id: 'classic', label: 'Classic' },
    { id: 'modern', label: 'Modern' },
    { id: 'minimal', label: 'Minimal' },
    { id: 'technical', label: 'Technical' },
    { id: 'dataanalyst', label: 'Data Analyst' },
    { id: 'professional', label: 'Professional' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Top Toolbar */}
      <div className="border-b border-zinc-800 bg-zinc-900/90 px-4 py-3 sticky top-16 z-40 flex flex-wrap items-center justify-between gap-4">
        {/* Template Selector Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 mr-2">
            <Layout className="w-4 h-4 text-orange-400" /> Template:
          </span>
          {templatesList.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTemplate(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                selectedTemplate === t.id
                  ? 'bg-orange-500 text-black shadow-md shadow-orange-500/20'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Action Controls & Export Buttons */}
        <div className="flex items-center gap-3">
          {saveNotification && (
            <span className="text-xs text-emerald-400 font-medium animate-pulse">{saveNotification}</span>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            onClick={handleDocxExport}
            disabled={exportingDocx}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-orange-400" />
            <span>{exportingDocx ? 'Generating DOCX...' : 'Download DOCX'}</span>
          </button>

          <button
            onClick={handlePdfExport}
            className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-black text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-orange-500/20 transition-all"
          >
            <Download className="w-3.5 h-3.5 stroke-[3]" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Editor Left, Live Preview Right */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left Form Editor */}
        <div className="lg:col-span-6 border-r border-zinc-800 bg-zinc-950 p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {/* Section Navigation Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-2 border-b border-zinc-800">
            {[
              { id: 'contact', label: 'Contact' },
              { id: 'summary', label: 'Summary' },
              { id: 'skills', label: 'Skills' },
              { id: 'experience', label: 'Experience' },
              { id: 'education', label: 'Education' },
              { id: 'projects', label: 'Projects' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-zinc-800 text-orange-400 border border-orange-500/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Contact */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Contact Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-zinc-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={resume.contact.name}
                    onChange={(e) => setResume({ ...resume, contact: { ...resume.contact, name: e.target.value } })}
                    className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={resume.contact.email}
                    onChange={(e) => setResume({ ...resume, contact: { ...resume.contact, email: e.target.value } })}
                    className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Phone</label>
                  <input
                    type="text"
                    value={resume.contact.phone}
                    onChange={(e) => setResume({ ...resume, contact: { ...resume.contact, phone: e.target.value } })}
                    className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Location</label>
                  <input
                    type="text"
                    value={resume.contact.location}
                    onChange={(e) => setResume({ ...resume, contact: { ...resume.contact, location: e.target.value } })}
                    className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Summary */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Professional Summary</h3>
              <textarea
                rows={6}
                value={resume.summary}
                onChange={(e) => setResume({ ...resume, summary: e.target.value })}
                className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white leading-relaxed"
              />
            </div>
          )}

          {/* Tab 3: Skills */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Skills Section</h3>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Technical Skills (comma separated)</label>
                <textarea
                  rows={4}
                  value={resume.skills.technical.join(', ')}
                  onChange={(e) =>
                    setResume({
                      ...resume,
                      skills: {
                        ...resume.skills,
                        technical: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      },
                    })
                  }
                  className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white"
                />
              </div>
            </div>
          )}

          {/* Tab 4: Experience */}
          {activeTab === 'experience' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Work History</h3>
                <button
                  onClick={() =>
                    setResume({
                      ...resume,
                      experience: [
                        ...resume.experience,
                        {
                          id: `exp-${Date.now()}`,
                          title: 'New Position',
                          company: 'Company Name',
                          startDate: '2023',
                          endDate: 'Present',
                          current: true,
                          bullets: ['Achieved high impact results.'],
                        },
                      ],
                    })
                  }
                  className="px-3 py-1.5 rounded bg-orange-500/20 text-orange-400 font-bold text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Experience
                </button>
              </div>

              {resume.experience.map((exp, idx) => (
                <div key={exp.id || idx} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-white">Entry #{idx + 1}</span>
                    <button
                      onClick={() =>
                        setResume({
                          ...resume,
                          experience: resume.experience.filter((_, i) => i !== idx),
                        })
                      }
                      className="text-zinc-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <input
                      type="text"
                      placeholder="Title"
                      value={exp.title}
                      onChange={(e) => {
                        const updated = [...resume.experience];
                        updated[idx].title = e.target.value;
                        setResume({ ...resume, experience: updated });
                      }}
                      className="p-2 rounded bg-zinc-950 border border-zinc-800 text-white"
                    />
                    <input
                      type="text"
                      placeholder="Company"
                      value={exp.company}
                      onChange={(e) => {
                        const updated = [...resume.experience];
                        updated[idx].company = e.target.value;
                        setResume({ ...resume, experience: updated });
                      }}
                      className="p-2 rounded bg-zinc-950 border border-zinc-800 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Bullet Points (one per line)</label>
                    <textarea
                      rows={3}
                      value={exp.bullets.join('\n')}
                      onChange={(e) => {
                        const updated = [...resume.experience];
                        updated[idx].bullets = e.target.value.split('\n');
                        setResume({ ...resume, experience: updated });
                      }}
                      className="w-full p-2.5 rounded bg-zinc-950 border border-zinc-800 text-xs text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 5 & 6: Education & Projects */}
          {(activeTab === 'education' || activeTab === 'projects') && (
            <div className="text-xs text-zinc-400 space-y-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">{activeTab} Details</h3>
              <p>Content automatically aligned and editable in the live document renderer.</p>
            </div>
          )}
        </div>

        {/* Right Live Document Preview */}
        <div className="lg:col-span-6 bg-zinc-900/50 p-6 flex flex-col items-center justify-start overflow-y-auto max-h-[calc(100vh-8rem)]">
          {/* Zoom controls */}
          <div className="w-full flex justify-end gap-2 mb-4">
            <button
              onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
              className="p-1.5 rounded bg-zinc-800 text-zinc-300 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-zinc-400 self-center">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
              className="p-1.5 rounded bg-zinc-800 text-zinc-300 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <div
            className="transition-transform transform origin-top shadow-2xl"
            style={{ transform: `scale(${zoomLevel / 100})` }}
          >
            <ResumeRenderer resume={resume} templateId={selectedTemplate} />
          </div>
        </div>
      </div>
    </div>
  );
}

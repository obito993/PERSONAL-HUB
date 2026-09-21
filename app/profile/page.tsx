'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Award,
  Sparkles,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  Layers,
  ShieldCheck,
  Globe,
  BookOpen,
  Heart,
  Users,
} from 'lucide-react';
import { MasterProfileData, UserCareerMode } from '@/types';

export default function MasterProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<MasterProfileData | null>(null);
  const [activeTab, setActiveTab] = useState<'personal' | 'experience' | 'education' | 'projects' | 'skills' | 'extras'>('personal');
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.profile) {
          setProfile(data.profile);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        setNotification('Master Profile saved! Your profile will serve as the source for all tailored versions.');
        setTimeout(() => setNotification(''), 4000);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-zinc-400 font-mono">Loading Master Profile Repository...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-orange-500/20 pb-6">
        <div>
          <div className="font-mono text-xs font-black text-orange-500 uppercase tracking-widest flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> PERMANENT MASTER PROFILE REPOSITORY
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase mt-1">SINGLE SOURCE OF TRUTH</h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl font-mono">
            Enter your professional details once. Tailored resumes generate separate versions and <span className="text-orange-400 font-bold">NEVER</span> overwrite your Master Profile.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {notification && <span className="text-xs text-emerald-400 font-bold font-mono animate-pulse">{notification}</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            data-cursor="SAVE"
            className="px-6 py-3.5 rounded-xl border-2 border-orange-500 bg-orange-500 text-black font-black text-xs uppercase shadow-[0_0_20px_rgba(249,115,22,0.4)] flex items-center gap-2 hover:bg-orange-400 transition-all"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>{saving ? 'SAVING PROFILE...' : 'SAVE MASTER PROFILE'}</span>
          </button>
        </div>
      </div>

      {/* User Mode Switcher Banner */}
      <div className="p-5 rounded-xl bg-[#0d0d12] comic-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-xs font-black text-orange-400 uppercase tracking-wider block">USER CAREER MODE</span>
          <p className="text-xs text-zinc-400 mt-0.5 font-medium">
            Adapts AI prioritization across Freshers, Experienced professionals, and Career Changers.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#09090b] p-1 rounded-lg border border-orange-500/30">
          {[
            { id: 'FRESHER', label: 'Fresher / Student' },
            { id: 'EXPERIENCED', label: 'Experienced' },
            { id: 'CAREER_CHANGER', label: 'Career Changer' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setProfile({ ...profile, userMode: mode.id as UserCareerMode })}
              className={`px-3.5 py-2 rounded text-xs font-mono font-black uppercase transition-all ${
                profile.userMode === mode.id
                  ? 'bg-orange-500 text-black shadow-[0_0_10px_rgba(249,115,22,0.4)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* 6-CHAPTER WORKSPACE TABS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Tabs Bar */}
        <div className="lg:col-span-3 space-y-1 font-mono">
          {[
            { id: 'personal', tag: 'CH 01', label: 'Who Are You?', icon: User },
            { id: 'experience', tag: 'CH 02', label: 'Where Have You Worked?', icon: Briefcase },
            { id: 'education', tag: 'CH 03', label: 'What Have You Learned?', icon: GraduationCap },
            { id: 'projects', tag: 'CH 04', label: 'What Have You Built?', icon: FolderGit2 },
            { id: 'skills', tag: 'CH 05', label: 'What Can You Do?', icon: Sparkles },
            { id: 'extras', tag: 'CH 06', label: 'Certifications & Awards', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded border text-xs font-black uppercase transition-all ${
                  active
                    ? 'border-orange-500 bg-orange-500/20 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.2)]'
                    : 'border-transparent text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-orange-400" />
                  <span>{tab.label}</span>
                </div>
                <span className="text-[10px] text-orange-500 font-bold">{tab.tag}</span>
              </button>
            );
          })}
        </div>

        {/* Active Tab Form Container */}
        <div className="lg:col-span-9 p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-6">
          {/* Tab 1: Personal */}
          {activeTab === 'personal' && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-white border-b border-zinc-800 pb-2">Personal & Target Role Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-zinc-400 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Target Job Title *</label>
                  <input
                    type="text"
                    value={profile.targetTitle}
                    onChange={(e) => setProfile({ ...profile, targetTitle: e.target.value })}
                    placeholder="e.g. Senior Data Analyst / Operations Manager"
                    className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Location</label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    placeholder="City, Country / Remote"
                    className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Years of Industry Experience</label>
                  <input
                    type="number"
                    value={profile.yearsOfExp}
                    onChange={(e) => setProfile({ ...profile, yearsOfExp: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Master Summary Statement</label>
                <textarea
                  rows={4}
                  value={profile.summary}
                  onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
                  className="w-full p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* Tab 2: Experience */}
          {activeTab === 'experience' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <h2 className="text-base font-bold text-white">Work & Internship History ({profile.experience.length})</h2>
                <button
                  onClick={() =>
                    setProfile({
                      ...profile,
                      experience: [
                        ...profile.experience,
                        {
                          id: `exp-${Date.now()}`,
                          title: 'Position Title',
                          company: 'Company / Organization',
                          startDate: '2022',
                          endDate: 'Present',
                          current: true,
                          bullets: ['Achieved measurable results.'],
                        },
                      ],
                    })
                  }
                  className="px-3.5 py-1.5 rounded-lg bg-orange-500/20 text-orange-400 font-bold text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Experience Entry
                </button>
              </div>

              {profile.experience.map((exp, idx) => (
                <div key={exp.id || idx} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-white">Position #{idx + 1}</span>
                    <button
                      onClick={() =>
                        setProfile({
                          ...profile,
                          experience: profile.experience.filter((_, i) => i !== idx),
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
                        const updated = [...profile.experience];
                        updated[idx].title = e.target.value;
                        setProfile({ ...profile, experience: updated });
                      }}
                      className="p-2.5 rounded bg-zinc-900 border border-zinc-800 text-white"
                    />
                    <input
                      type="text"
                      placeholder="Company"
                      value={exp.company}
                      onChange={(e) => {
                        const updated = [...profile.experience];
                        updated[idx].company = e.target.value;
                        setProfile({ ...profile, experience: updated });
                      }}
                      className="p-2.5 rounded bg-zinc-900 border border-zinc-800 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Responsibilities & Achievements (one per line)</label>
                    <textarea
                      rows={3}
                      value={exp.bullets.join('\n')}
                      onChange={(e) => {
                        const updated = [...profile.experience];
                        updated[idx].bullets = e.target.value.split('\n');
                        setProfile({ ...profile, experience: updated });
                      }}
                      className="w-full p-2.5 rounded bg-zinc-900 border border-zinc-800 text-xs text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Education */}
          {activeTab === 'education' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <h2 className="text-base font-bold text-white">Education & Qualifications ({profile.education.length})</h2>
                <button
                  onClick={() =>
                    setProfile({
                      ...profile,
                      education: [
                        ...profile.education,
                        {
                          id: `edu-${Date.now()}`,
                          degree: 'Bachelor of Science',
                          field: 'Computer Science / Business',
                          institution: 'University Name',
                          startDate: '2018',
                          endDate: '2022',
                        },
                      ],
                    })
                  }
                  className="px-3.5 py-1.5 rounded-lg bg-orange-500/20 text-orange-400 font-bold text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Education
                </button>
              </div>

              {profile.education.map((edu, idx) => (
                <div key={edu.id || idx} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-white">Degree #{idx + 1}</span>
                    <button
                      onClick={() =>
                        setProfile({
                          ...profile,
                          education: profile.education.filter((_, i) => i !== idx),
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
                      placeholder="Degree"
                      value={edu.degree}
                      onChange={(e) => {
                        const updated = [...profile.education];
                        updated[idx].degree = e.target.value;
                        setProfile({ ...profile, education: updated });
                      }}
                      className="p-2.5 rounded bg-zinc-900 border border-zinc-800 text-white"
                    />
                    <input
                      type="text"
                      placeholder="Field of Study"
                      value={edu.field}
                      onChange={(e) => {
                        const updated = [...profile.education];
                        updated[idx].field = e.target.value;
                        setProfile({ ...profile, education: updated });
                      }}
                      className="p-2.5 rounded bg-zinc-900 border border-zinc-800 text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 4 & 5: Projects & Skills */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-white border-b border-zinc-800 pb-2">Projects & Portfolios</h2>
              <p className="text-xs text-zinc-400">Projects allow Freshers and Experienced professionals to showcase hands-on results.</p>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-white border-b border-zinc-800 pb-2">Master Skill Matrix</h2>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Technical Skills & Domain Knowledge (comma separated)</label>
                <textarea
                  rows={4}
                  value={profile.skills.technical.join(', ')}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      skills: {
                        ...profile.skills,
                        technical: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                        all: Array.from(new Set([...e.target.value.split(',').map((s) => s.trim()).filter(Boolean), ...profile.skills.soft])),
                      },
                    })
                  }
                  className="w-full p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white leading-relaxed"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

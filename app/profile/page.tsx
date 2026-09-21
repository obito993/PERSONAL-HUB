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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="text-xs font-bold text-orange-500 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Permanent Master Profile
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">Single Source of Truth</h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Enter your professional details once. Tailored resumes generate separate versions and <span className="text-orange-400 font-semibold">NEVER</span> overwrite your Master Profile.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {notification && <span className="text-xs text-emerald-400 font-medium animate-pulse">{notification}</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-extrabold text-sm shadow-xl shadow-orange-500/20 flex items-center gap-2 transition-transform transform hover:scale-105"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>{saving ? 'Saving...' : 'Save Master Profile'}</span>
          </button>
        </div>
      </div>

      {/* User Mode Switcher Banner */}
      <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">Career Profile Mode</span>
          <p className="text-xs text-zinc-400 mt-0.5">
            Adapts AI prioritization across Freshers, Experienced professionals, and Career Changers.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          {[
            { id: 'FRESHER', label: 'Fresher / Student' },
            { id: 'EXPERIENCED', label: 'Experienced' },
            { id: 'CAREER_CHANGER', label: 'Career Changer' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setProfile({ ...profile, userMode: mode.id as UserCareerMode })}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                profile.userMode === mode.id
                  ? 'bg-orange-500 text-black shadow-md shadow-orange-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Workspace Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Tabs Bar */}
        <div className="lg:col-span-3 space-y-1">
          {[
            { id: 'personal', label: 'Personal & Career', icon: User },
            { id: 'experience', label: 'Work History', icon: Briefcase },
            { id: 'education', label: 'Education & Honors', icon: GraduationCap },
            { id: 'projects', label: 'Projects & Portfolios', icon: FolderGit2 },
            { id: 'skills', label: 'Skills & Tools', icon: Sparkles },
            { id: 'extras', label: 'Certifications & Extras', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-zinc-800 text-orange-400 border border-orange-500/30'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
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

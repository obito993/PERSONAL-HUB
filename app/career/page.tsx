'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Calendar, 
  Building, 
  MapPin, 
  DollarSign, 
  ExternalLink, 
  Trash2, 
  Edit3, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  FileText, 
  ChevronRight,
  Target,
  Award,
  Filter,
  Layers,
  X
} from 'lucide-react';
import { storage, ApplicationItem } from '@/lib/storage';
import { sound } from '@/lib/sound';

export interface ExtendedApplication {
  id: string;
  company: string;
  role: string;
  location: string;
  workMode?: 'Remote' | 'Hybrid' | 'On-site';
  jobType?: 'Full-time' | 'Contract' | 'Internship';
  status: 'WISHLIST' | 'APPLIED' | 'ASSESSMENT' | 'INTERVIEW' | 'OFFER' | 'REJECTED';
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  dateApplied: string;
  deadline?: string;
  salary?: string;
  jobUrl?: string;
  recruiter?: string;
  email?: string;
  phone?: string;
  source?: string;
  notes?: string;
  nextAction?: string;
  interviewDate?: string;
  assessmentDate?: string;
  timeline?: { title: string; date: string; type: string }[];
}

const KANBAN_COLUMNS: { key: ExtendedApplication['status']; label: string; color: string }[] = [
  { key: 'WISHLIST', label: 'WISHLIST', color: 'bg-gray-100 text-black border-black' },
  { key: 'APPLIED', label: 'APPLIED', color: 'bg-[#5DADE2] text-black border-black' },
  { key: 'ASSESSMENT', label: 'ASSESSMENT', color: 'bg-[#B9A7FF] text-black border-black' },
  { key: 'INTERVIEW', label: 'INTERVIEW', color: 'bg-[#FFD83D] text-black border-black' },
  { key: 'OFFER', label: 'OFFER', color: 'bg-green-400 text-black border-black' },
  { key: 'REJECTED', label: 'REJECTED', color: 'bg-red-400 text-white border-black' },
];

function CareerBoardContent() {
  const [apps, setApps] = useState<ExtendedApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState('ALL');

  // Add / Edit Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<ExtendedApplication | null>(null);

  // Form State
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('Remote');
  const [workMode, setWorkMode] = useState<'Remote' | 'Hybrid' | 'On-site'>('Remote');
  const [jobType, setJobType] = useState<'Full-time' | 'Contract' | 'Internship'>('Full-time');
  const [status, setStatus] = useState<ExtendedApplication['status']>('APPLIED');
  const [priority, setPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [salary, setSalary] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [recruiter, setRecruiter] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [deadline, setDeadline] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [notes, setNotes] = useState('');

  // Career AI Assistant State
  const [aiMode, setAiMode] = useState<'MATCH' | 'PREP' | 'STAR' | 'BULLETS' | 'COVER'>('PREP');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    // Fetch applications from server & storage fallback
    fetch('/api/career/applications')
      .then(r => r.json())
      .then(data => {
        if (data.applications && data.applications.length > 0) {
          const mapped: ExtendedApplication[] = data.applications.map((a: any) => ({
            id: a.id,
            company: a.company,
            role: a.role,
            location: a.location || 'Remote',
            workMode: 'Remote',
            jobType: 'Full-time',
            status: a.status as ExtendedApplication['status'],
            priority: 'MEDIUM',
            dateApplied: new Date(a.dateApplied || a.createdAt).toISOString().split('T')[0],
            salary: a.salary || '',
            jobUrl: a.jobUrl || '',
            recruiter: a.recruiter || '',
            notes: a.notes || '',
            nextAction: 'Prepare for next stage',
            timeline: [
              { title: 'Application Created', date: new Date(a.createdAt).toLocaleDateString(), type: 'APPLIED' }
            ]
          }));
          setApps(mapped);
        } else {
          loadStorageApps();
        }
      })
      .catch(() => loadStorageApps());
  }, []);

  const loadStorageApps = () => {
    const saved = storage.getApplications();
    const mapped: ExtendedApplication[] = saved.map(a => ({
      id: a.id,
      company: a.company,
      role: a.role,
      location: a.location,
      workMode: 'Remote',
      jobType: 'Full-time',
      status: a.status as ExtendedApplication['status'],
      priority: 'MEDIUM',
      dateApplied: a.date,
      salary: '$120,000 / yr',
      jobUrl: a.jobUrl,
      notes: a.notes,
      nextAction: 'Prepare resume & technical review',
      timeline: [{ title: 'Application Submitted', date: a.date, type: a.status }]
    }));
    setApps(mapped);
  };

  // Add / Save Application
  const handleSaveApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;

    sound.playPop();

    const newApp: ExtendedApplication = {
      id: 'app_' + Date.now(),
      company,
      role,
      location,
      workMode,
      jobType,
      status,
      priority,
      dateApplied: new Date().toISOString().split('T')[0],
      deadline,
      salary,
      jobUrl,
      recruiter,
      email,
      phone,
      notes,
      nextAction,
      timeline: [{ title: `Status set to ${status}`, date: new Date().toLocaleDateString(), type: status }]
    };

    setApps(prev => [newApp, ...prev]);

    // Save to server
    try {
      await fetch('/api/career/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApp)
      });
    } catch (e) {
      console.error(e);
    }

    resetForm();
    setShowAddModal(false);
  };

  // Status Change / Move Column
  const handleStatusChange = async (appId: string, newStatus: ExtendedApplication['status']) => {
    sound.playPop();
    setApps(prev => prev.map(a => {
      if (a.id === appId) {
        const updatedTimeline = [...(a.timeline || []), { title: `Status changed to ${newStatus}`, date: new Date().toLocaleDateString(), type: newStatus }];
        return { ...a, status: newStatus, timeline: updatedTimeline };
      }
      return a;
    }));

    try {
      await fetch('/api/career/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appId, status: newStatus })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteApp = async (id: string) => {
    sound.playPop();
    setApps(prev => prev.filter(a => a.id !== id));
    if (selectedApp?.id === id) setSelectedApp(null);

    try {
      await fetch(`/api/career/applications?id=${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }
  };

  const resetForm = () => {
    setCompany('');
    setRole('');
    setLocation('Remote');
    setStatus('APPLIED');
    setSalary('');
    setJobUrl('');
    setNotes('');
    setNextAction('');
  };

  // OpenAI Career AI Action
  const handleCareerAi = async (mode: typeof aiMode) => {
    setAiMode(mode);
    setLoadingAi(true);
    sound.playPop();

    const targetApp = selectedApp || apps[0] || { company: 'Target Company', role: 'Software Engineer', location: 'Remote' };

    const promptText = `
Role: Deion Hub Career AI Coach
Task: ${mode}
Company: ${targetApp.company}
Role: ${targetApp.role}
Location: ${targetApp.location}
Notes/Context: ${targetApp.notes || 'Full-stack software engineering position'}
Provide actionable, high-impact career advice, interview questions, or resume bullet improvements formatted in clean markdown.
    `;

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          mode: 'CAREER',
          prompt: promptText
        })
      });
      const data = await res.json();
      setAiResponse(data.result);
      sound.playLevelUp();
    } catch {
      setAiResponse(`⚡ [CAREER AI]: Top interview questions & STAR story frameworks prepared for ${targetApp.role} at ${targetApp.company}!`);
    } finally {
      setLoadingAi(false);
    }
  };

  // Filtered Applications
  const filteredApps = apps.filter(a => {
    const matchesQuery = a.company.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         a.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         a.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatusFilter === 'ALL' || a.status === selectedStatusFilter;
    const matchesPriority = selectedPriorityFilter === 'ALL' || a.priority === selectedPriorityFilter;
    return matchesQuery && matchesStatus && matchesPriority;
  });

  // Calculate Real Statistics
  const totalApps = apps.length;
  const countApplied = apps.filter(a => a.status === 'APPLIED').length;
  const countAssessment = apps.filter(a => a.status === 'ASSESSMENT').length;
  const countInterview = apps.filter(a => a.status === 'INTERVIEW').length;
  const countOffer = apps.filter(a => a.status === 'OFFER').length;
  const countRejected = apps.filter(a => a.status === 'REJECTED').length;

  return (
    <div className="space-y-8 py-6">

      {/* 1. Page Identity Banner */}
      <div className="bg-[#FF6B00] text-white comic-border-lg p-6 sm:p-8 shadow-comic-lg space-y-4 rounded-2xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-black text-white font-mono font-black text-xs px-3 py-1 border border-white rounded-lg">
              ★ ISSUE #004 ★
            </span>
            <span className="comic-sticker comic-sticker-yellow text-xs font-black">
              COMIC MISSION CONTROL × CAREER COMMAND CENTER
            </span>
          </div>

          <Link href="/career/resume" className="btn-comic bg-black text-white text-xs px-4 py-2 font-black flex items-center gap-1.5 border border-white">
            <FileText className="w-4 h-4 text-[#FFD83D]" />
            <span>RESUME ESTIMATOR</span>
          </Link>
        </div>

        <div className="space-y-1">
          <h1 className="font-black text-4xl sm:text-6xl uppercase tracking-tight flex items-center gap-3">
            <Briefcase className="w-10 h-10 stroke-[2.8]" />
            <span>THE MISSION BOARD</span>
          </h1>
          <p className="font-bold text-xs sm:text-base italic text-white/95">
            &quot;TRACK EVERY APPLICATION. PREPARE FOR EVERY NEXT MOVE.&quot;
          </p>
        </div>
      </div>

      {/* 2. Real Career Statistics & Upcoming Missions Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 font-mono font-bold">
        <div className="bg-white comic-border-sm p-3 rounded-xl text-center shadow-comic-sm">
          <div className="text-2xl font-black text-black">{totalApps}</div>
          <div className="text-[10px] font-sans font-black uppercase text-gray-600">TOTAL MISSIONS</div>
        </div>
        <div className="bg-[#5DADE2] text-black comic-border-sm p-3 rounded-xl text-center shadow-comic-sm">
          <div className="text-2xl font-black">{countApplied}</div>
          <div className="text-[10px] font-sans font-black uppercase">APPLIED</div>
        </div>
        <div className="bg-[#B9A7FF] text-black comic-border-sm p-3 rounded-xl text-center shadow-comic-sm">
          <div className="text-2xl font-black">{countAssessment}</div>
          <div className="text-[10px] font-sans font-black uppercase">ASSESSMENTS</div>
        </div>
        <div className="bg-[#FFD83D] text-black comic-border-sm p-3 rounded-xl text-center shadow-comic-sm">
          <div className="text-2xl font-black">{countInterview}</div>
          <div className="text-[10px] font-sans font-black uppercase">INTERVIEWS</div>
        </div>
        <div className="bg-green-400 text-black comic-border-sm p-3 rounded-xl text-center shadow-comic-sm">
          <div className="text-2xl font-black">{countOffer}</div>
          <div className="text-[10px] font-sans font-black uppercase">OFFERS</div>
        </div>
        <div className="bg-red-400 text-white comic-border-sm p-3 rounded-xl text-center shadow-comic-sm">
          <div className="text-2xl font-black">{countRejected}</div>
          <div className="text-[10px] font-sans font-black uppercase">REJECTED</div>
        </div>
      </div>

      {/* 3. Search & Toolbar Controls */}
      <div className="bg-white comic-border-lg p-5 rounded-2xl shadow-comic-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company, role, or location..."
            className="comic-input w-full text-xs pl-8 font-bold"
          />
          <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="comic-input text-xs font-black"
          >
            <option value="ALL">ALL STATUSES</option>
            {KANBAN_COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>

          <button
            onClick={() => { resetForm(); setShowAddModal(true); sound.playPop(); }}
            className="btn-comic bg-[#FF6B00] text-white text-xs px-5 py-2.5 font-black flex items-center gap-1.5 ml-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ ADD APPLICATION</span>
          </button>
        </div>
      </div>

      {/* 4. Kanban Board (6 Columns) */}
      <div className="overflow-x-auto pb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 min-w-[1200px] lg:min-w-0">
          {KANBAN_COLUMNS.map((col) => {
            const colApps = filteredApps.filter(a => a.status === col.key);

            return (
              <div key={col.key} className="bg-[#FFFDF5] comic-border-md p-4 rounded-2xl space-y-3 flex flex-col justify-between min-h-[500px]">
                <div>
                  {/* Column Header */}
                  <div className={`p-2.5 comic-border-sm rounded-xl font-black text-xs uppercase flex items-center justify-between mb-3 ${col.color}`}>
                    <span>{col.label}</span>
                    <span className="bg-black text-white px-2 py-0.5 rounded text-[10px] font-mono">
                      {colApps.length}
                    </span>
                  </div>

                  {/* Cards List */}
                  <div className="space-y-3">
                    {colApps.map((app) => (
                      <div
                        key={app.id}
                        onClick={() => { setSelectedApp(app); sound.playPop(); }}
                        className="bg-white comic-border-sm p-4 rounded-xl space-y-2 cursor-pointer hover:-translate-y-1 transition-all shadow-comic-sm hover:shadow-comic-md group relative"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-black text-gray-500 uppercase tracking-wider">
                            {app.workMode || 'Remote'}
                          </span>
                          {app.priority && (
                            <span className={`text-[9px] font-mono font-black px-1.5 py-0.2 border border-black rounded ${
                              app.priority === 'HIGH' ? 'bg-red-400 text-white' : 'bg-[#FFD83D] text-black'
                            }`}>
                              {app.priority}
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="font-black text-base uppercase text-black group-hover:text-[#FF6B00] transition-colors">
                            {app.company}
                          </h4>
                          <div className="text-xs font-bold text-gray-700">{app.role}</div>
                        </div>

                        <div className="text-[10px] font-mono font-bold text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span>{app.location}</span>
                        </div>

                        {app.salary && (
                          <div className="text-[10px] font-mono font-black text-green-700">
                            💰 {app.salary}
                          </div>
                        )}

                        {/* Move Column Selector */}
                        <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-[10px] font-mono font-bold" onClick={(e) => e.stopPropagation()}>
                          <span className="text-gray-400">STATUS:</span>
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusChange(app.id, e.target.value as ExtendedApplication['status'])}
                            className="bg-gray-100 border border-black text-[9px] font-black p-0.5 rounded cursor-pointer"
                          >
                            {KANBAN_COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                          </select>
                        </div>
                      </div>
                    ))}

                    {colApps.length === 0 && (
                      <div className="p-6 border-2 border-dashed border-gray-300 rounded-xl text-center text-gray-400 text-xs font-mono font-bold">
                        No missions in {col.label}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Career AI Companion Panel */}
      <div className="bg-white comic-border-lg p-6 rounded-2xl shadow-comic-lg space-y-4">
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#FF6B00]" />
            <h3 className="font-black text-xl uppercase">DEION CAREER AI MENTOR</h3>
          </div>
          <span className="comic-sticker comic-sticker-purple text-xs font-black">
            Ollama + Cloud
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => handleCareerAi('PREP')} disabled={loadingAi} className="btn-comic bg-[#FFD83D] text-black text-xs px-4 py-2 font-black">
            INTERVIEW PREP
          </button>
          <button onClick={() => handleCareerAi('STAR')} disabled={loadingAi} className="btn-comic bg-[#5DADE2] text-black text-xs px-4 py-2 font-black">
            STAR METHOD STORIES
          </button>
          <button onClick={() => handleCareerAi('BULLETS')} disabled={loadingAi} className="btn-comic bg-[#B9A7FF] text-black text-xs px-4 py-2 font-black">
            RESUME BULLET IMPACT
          </button>
          <button onClick={() => handleCareerAi('COVER')} disabled={loadingAi} className="btn-comic bg-[#2ECC71] text-black text-xs px-4 py-2 font-black">
            COVER LETTER DRAFT
          </button>
        </div>

        {aiResponse && (
          <div className="bg-[#FFFDF5] comic-border-sm p-4 rounded-xl text-xs font-mono whitespace-pre-wrap text-black leading-relaxed space-y-2">
            <div className="font-black text-[#FF6B00] uppercase font-sans text-sm">DEION AI ADVICE FOR YOUR ACTIVE MISSIONS:</div>
            <div>{aiResponse}</div>
          </div>
        )}
      </div>

      {/* 6. Add Application Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white comic-border-lg p-6 max-w-2xl w-full rounded-2xl space-y-4 max-h-[90vh] overflow-y-auto shadow-comic-lg">
            <div className="flex justify-between items-center border-b-2 border-black pb-2">
              <h3 className="font-black text-xl uppercase flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#FF6B00]" />
                <span>ADD NEW JOB MISSION</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveApplication} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold">
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1">Company Name *</label>
                  <input type="text" value={company} onChange={e => setCompany(e.target.value)} required placeholder="Stripe, Vercel, Linear..." className="comic-input w-full" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1">Role Title *</label>
                  <input type="text" value={role} onChange={e => setRole(e.target.value)} required placeholder="Senior Frontend Engineer" className="comic-input w-full" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1">Location</label>
                  <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Remote / San Francisco" className="comic-input w-full" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1">Initial Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value as any)} className="comic-input w-full font-black">
                    {KANBAN_COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1">Salary / CTC</label>
                  <input type="text" value={salary} onChange={e => setSalary(e.target.value)} placeholder="$140,000 / yr" className="comic-input w-full" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1">Job Listing URL</label>
                  <input type="url" value={jobUrl} onChange={e => setJobUrl(e.target.value)} placeholder="https://company.com/careers" className="comic-input w-full" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase mb-1">Mission Notes & Next Actions</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Recruiter contacts, interview rounds, prep notes..." className="comic-input w-full text-xs font-mono" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-comic btn-comic-white text-xs px-4 py-2 font-black">
                  CANCEL
                </button>
                <button type="submit" className="btn-comic bg-[#FF6B00] text-white text-xs px-6 py-2 font-black">
                  SAVE MISSION
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Application Details Side Panel Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white comic-border-lg p-6 max-w-xl w-full rounded-2xl space-y-4 shadow-comic-lg">
            <div className="flex justify-between items-center border-b-2 border-black pb-2">
              <div>
                <span className="comic-sticker bg-[#FF6B00] text-white text-[10px] font-black border border-black">
                  {selectedApp.status}
                </span>
                <h3 className="font-black text-2xl uppercase mt-1">{selectedApp.company}</h3>
                <div className="text-xs font-bold text-gray-600">{selectedApp.role} • {selectedApp.location}</div>
              </div>
              <button onClick={() => setSelectedApp(null)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-500">Date Applied:</span>
                <span className="font-black text-black">{selectedApp.dateApplied}</span>
              </div>
              {selectedApp.salary && (
                <div className="flex justify-between py-1 border-b border-gray-200">
                  <span className="text-gray-500">Salary / CTC:</span>
                  <span className="font-black text-green-700">{selectedApp.salary}</span>
                </div>
              )}
              {selectedApp.notes && (
                <div className="space-y-1 py-1">
                  <span className="text-gray-500 block">Mission Notes:</span>
                  <div className="bg-[#FFFDF5] comic-border-sm p-3 text-black">{selectedApp.notes}</div>
                </div>
              )}
            </div>

            {/* Mission Timeline */}
            <div className="space-y-2 pt-2 border-t-2 border-black">
              <h4 className="font-black text-xs uppercase flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#FF6B00]" />
                <span>MISSION TIMELINE</span>
              </h4>
              <div className="space-y-1 text-[11px] font-mono">
                {selectedApp.timeline?.map((t, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 border border-black rounded">
                    <span>✓ {t.title}</span>
                    <span className="text-gray-500 text-[10px]">{t.date}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button onClick={() => handleDeleteApp(selectedApp.id)} className="btn-comic bg-red-500 text-white text-xs px-3 py-2 font-black flex items-center gap-1">
                <Trash2 className="w-3.5 h-3.5" />
                <span>DELETE</span>
              </button>

              {selectedApp.jobUrl && (
                <a href={selectedApp.jobUrl} target="_blank" rel="noopener noreferrer" className="btn-comic bg-[#5DADE2] text-black text-xs px-4 py-2 font-black flex items-center gap-1">
                  <span>OPEN JOB URL</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function MissionBoardPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-black">⚡ LOADING THE MISSION BOARD...</div>}>
      <CareerBoardContent />
    </Suspense>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Plus,
  Calendar,
  DollarSign,
  Building,
  CheckCircle2,
  Clock,
  Trash2,
  Layers,
  LayoutGrid,
  List,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { JobApplicationData, ApplicationStatus } from '@/types';

export default function ApplicationTrackerPage() {
  const [applications, setApplications] = useState<JobApplicationData[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // New Application Form State
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>('APPLIED');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetch('/api/tracker')
      .then((res) => (res.ok ? res.json() : { applications: [] }))
      .then((data) => {
        setApplications(data.applications || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !jobTitle) return;

    const res = await fetch('/api/tracker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company, jobTitle, location, salary, status, notes }),
    });

    const data = await res.json();
    if (data.application) {
      setApplications([data.application, ...applications]);
      setShowAddModal(false);
      setCompany('');
      setJobTitle('');
      setLocation('');
      setSalary('');
      setNotes('');
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: ApplicationStatus) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    );

    await fetch(`/api/tracker/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application record?')) return;
    await fetch(`/api/tracker/${id}`, { method: 'DELETE' });
    setApplications((prev) => prev.filter((a) => a.id !== id));
  };

  const statusColumns: { id: ApplicationStatus; label: string; color: string }[] = [
    { id: 'SAVED', label: 'Saved', color: 'border-zinc-700 bg-zinc-900/50' },
    { id: 'APPLIED', label: 'Applied', color: 'border-blue-800/80 bg-blue-950/20' },
    { id: 'SCREENING', label: 'Screening', color: 'border-amber-800/80 bg-amber-950/20' },
    { id: 'INTERVIEW', label: 'Interview', color: 'border-orange-800/80 bg-orange-950/20' },
    { id: 'TECHNICAL', label: 'Technical Round', color: 'border-violet-800/80 bg-violet-950/20' },
    { id: 'OFFER', label: 'Offer Received 🎉', color: 'border-emerald-800/80 bg-emerald-950/30' },
    { id: 'REJECTED', label: 'Rejected', color: 'border-rose-900/50 bg-rose-950/10' },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-zinc-400 font-mono">Loading application tracker...</p>
      </div>
    );
  }

  const interviewCount = applications.filter(
    (a) => a.status === 'INTERVIEW' || a.status === 'TECHNICAL'
  ).length;
  const offerCount = applications.filter((a) => a.status === 'OFFER').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-orange-500" />
            Job Application Tracker
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Manage target roles, interview schedules, and offers in one place</p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'kanban' ? 'bg-orange-500 text-black font-bold' : 'text-zinc-400'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Kanban
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'table' ? 'bg-orange-500 text-black font-bold' : 'text-zinc-400'
              }`}
            >
              <List className="w-3.5 h-3.5" /> Table
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-extrabold text-xs shadow-lg shadow-orange-500/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Add Job Application</span>
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <div className="text-[11px] text-zinc-400 font-medium uppercase">Total Applications</div>
          <div className="text-2xl font-black text-white mt-1">{applications.length}</div>
        </div>
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <div className="text-[11px] text-zinc-400 font-medium uppercase">Active Interviews</div>
          <div className="text-2xl font-black text-orange-400 mt-1">{interviewCount}</div>
        </div>
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <div className="text-[11px] text-zinc-400 font-medium uppercase">Offers Received</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{offerCount}</div>
        </div>
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <div className="text-[11px] text-zinc-400 font-medium uppercase">Applied This Month</div>
          <div className="text-2xl font-black text-blue-400 mt-1">{applications.length}</div>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 overflow-x-auto pb-4">
          {statusColumns.map((col) => {
            const columnApps = applications.filter((a) => a.status === col.id);
            return (
              <div key={col.id} className={`p-3 rounded-2xl border ${col.color} space-y-3 min-w-[200px]`}>
                <div className="flex justify-between items-center text-xs font-bold text-white px-1">
                  <span>{col.label}</span>
                  <span className="bg-zinc-900 px-2 py-0.5 rounded-full text-[10px] text-zinc-400 font-mono">
                    {columnApps.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {columnApps.map((app) => (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-2 shadow-md hover:border-zinc-700 transition-all"
                    >
                      <div className="flex justify-between items-start gap-1">
                        <div>
                          <div className="font-bold text-white leading-tight">{app.jobTitle}</div>
                          <div className="text-orange-400 text-[11px] font-medium">{app.company}</div>
                        </div>
                        <button
                          onClick={() => app.id && handleDelete(app.id)}
                          className="text-zinc-600 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {app.location && <div className="text-[11px] text-zinc-500">{app.location}</div>}
                      {app.salary && <div className="text-[11px] text-emerald-400 font-mono">{app.salary}</div>}

                      {/* Status Dropdown */}
                      <select
                        value={app.status}
                        onChange={(e) => app.id && handleUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                        className="w-full mt-2 p-1 bg-zinc-900 border border-zinc-800 rounded text-[10px] text-zinc-300"
                      >
                        {statusColumns.map((sc) => (
                          <option key={sc.id} value={sc.id}>
                            {sc.label}
                          </option>
                        ))}
                      </select>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 overflow-hidden">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 uppercase font-bold border-b border-zinc-800">
              <tr>
                <th className="p-4">Company</th>
                <th className="p-4">Job Title</th>
                <th className="p-4">Location</th>
                <th className="p-4">Status</th>
                <th className="p-4">Applied Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-zinc-900/50">
                  <td className="p-4 font-bold text-white">{app.company}</td>
                  <td className="p-4 text-orange-400 font-medium">{app.jobTitle}</td>
                  <td className="p-4 text-zinc-400">{app.location || 'Remote'}</td>
                  <td className="p-4 font-semibold">{app.status}</td>
                  <td className="p-4 text-zinc-500">{new Date(app.dateApplied).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => app.id && handleDelete(app.id)} className="text-zinc-500 hover:text-rose-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-white">Add Job Application</h3>
            <form onSubmit={handleCreateApplication} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Stripe, Google"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="Software Engineer / Data Analyst"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="New York / Remote"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Salary Range</label>
                  <input
                    type="text"
                    placeholder="$120,000 / yr"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-orange-500 text-black font-bold"
                >
                  Save Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

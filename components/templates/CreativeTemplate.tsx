import React from 'react';
import { ParsedResume } from '@/types';

interface TemplateProps {
  resume: ParsedResume;
}

export const CreativeTemplate: React.FC<TemplateProps> = ({ resume }) => {
  return (
    <div className="bg-white text-zinc-900 p-8 shadow-sm font-sans max-w-[210mm] min-h-[297mm] mx-auto text-sm relative" id="resume-preview-content">
      {/* ATS Warning Banner */}
      <div className="mb-4 p-2 rounded bg-amber-50 border border-amber-200 text-[10px] text-amber-800 flex items-center justify-between no-print">
        <span>⚠️ Creative Template: Contains visual accent columns. ATS parsing compatibility may vary.</span>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white p-6 rounded-xl mb-6 shadow-md">
        <h1 className="text-3xl font-extrabold tracking-tight">{resume.contact.name || 'Creative Professional'}</h1>
        <p className="text-violet-200 text-xs font-semibold uppercase tracking-widest mt-1">Design & Creative Specialist</p>
        <div className="flex flex-wrap gap-4 text-xs text-violet-100 mt-3 border-t border-violet-500/50 pt-3">
          {resume.contact.email && <span>{resume.contact.email}</span>}
          {resume.contact.phone && <span>{resume.contact.phone}</span>}
          {resume.contact.location && <span>{resume.contact.location}</span>}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 space-y-5">
          {resume.summary && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-violet-700 border-b border-zinc-200 pb-1 mb-2">Profile Overview</h2>
              <p className="text-xs text-zinc-700 leading-relaxed">{resume.summary}</p>
            </div>
          )}

          {resume.experience && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-violet-700 border-b border-zinc-200 pb-1 mb-3">Work History</h2>
              <div className="space-y-4">
                {resume.experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline font-bold text-xs">
                      <span className="text-zinc-900">{exp.title} <span className="text-violet-600 font-normal">@ {exp.company}</span></span>
                      <span className="text-zinc-500 font-normal">{exp.startDate} – {exp.endDate}</span>
                    </div>
                    <ul className="list-disc list-inside text-xs text-zinc-700 space-y-1 mt-1">
                      {exp.bullets.map((b, idx) => (
                        <li key={idx}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="col-span-4 space-y-5 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-violet-700 mb-2">Skillsets</h2>
            <div className="flex flex-wrap gap-1">
              {resume.skills.all.map((s, idx) => (
                <span key={idx} className="bg-white border border-zinc-200 text-zinc-800 text-[11px] px-2 py-0.5 rounded shadow-xs">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {resume.education && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-violet-700 mb-2">Education</h2>
              {resume.education.map((edu) => (
                <div key={edu.id} className="text-xs mb-2">
                  <div className="font-bold text-zinc-900">{edu.degree}</div>
                  <div className="text-zinc-600">{edu.institution}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

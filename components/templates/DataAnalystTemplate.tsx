import React from 'react';
import { ParsedResume } from '@/types';

interface TemplateProps {
  resume: ParsedResume;
}

export const DataAnalystTemplate: React.FC<TemplateProps> = ({ resume }) => {
  return (
    <div className="bg-white text-zinc-900 p-8 shadow-sm font-sans max-w-[210mm] min-h-[297mm] mx-auto text-sm" id="resume-preview-content">
      {/* Header */}
      <div className="bg-zinc-900 text-white p-5 rounded mb-5">
        <h1 className="text-2xl font-bold tracking-tight">{resume.contact.name || 'Data Professional'}</h1>
        <p className="text-orange-400 text-xs font-semibold uppercase mt-0.5 tracking-wider">
          Data & Analytics Specialist
        </p>
        <div className="flex flex-wrap gap-4 text-xs text-zinc-300 mt-2 border-t border-zinc-700 pt-2">
          {resume.contact.email && <span>{resume.contact.email}</span>}
          {resume.contact.phone && <span>{resume.contact.phone}</span>}
          {resume.contact.location && <span>{resume.contact.location}</span>}
        </div>
      </div>

      {/* Metrics & Highlight Cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-orange-50 border border-orange-200 p-2.5 rounded text-center">
          <div className="text-xs font-bold text-orange-700">CORE TOOLSET</div>
          <div className="text-[11px] text-zinc-700 font-semibold mt-1">
            {resume.skills.technical.slice(0, 3).join(' • ') || 'SQL • Python • Excel'}
          </div>
        </div>
        <div className="bg-zinc-50 border border-zinc-200 p-2.5 rounded text-center">
          <div className="text-xs font-bold text-zinc-700">EXPERIENCE</div>
          <div className="text-[11px] text-zinc-700 font-semibold mt-1">
            {resume.experience.length} Industry Roles
          </div>
        </div>
        <div className="bg-violet-50 border border-violet-200 p-2.5 rounded text-center">
          <div className="text-xs font-bold text-violet-700">DOMAIN</div>
          <div className="text-[11px] text-zinc-700 font-semibold mt-1">
            Analytics & ETL
          </div>
        </div>
      </div>

      {/* Summary */}
      {resume.summary && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-1 mb-2">Summary</h2>
          <p className="text-xs text-zinc-700">{resume.summary}</p>
        </div>
      )}

      {/* Experience */}
      {resume.experience && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-1 mb-3">Professional History</h2>
          <div className="space-y-4">
            {resume.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline font-bold text-xs">
                  <span className="text-zinc-900">{exp.title} — <span className="text-orange-600 font-semibold">{exp.company}</span></span>
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

      {/* Education */}
      {resume.education && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-1 mb-2">Education & Credentials</h2>
          {resume.education.map((edu) => (
            <div key={edu.id} className="flex justify-between text-xs">
              <span className="font-bold text-zinc-900">{edu.degree} in {edu.field} ({edu.institution})</span>
              <span className="text-zinc-500">{edu.startDate} – {edu.endDate}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

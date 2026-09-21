import React from 'react';
import { ParsedResume } from '@/types';

interface TemplateProps {
  resume: ParsedResume;
}

export const HealthcareTemplate: React.FC<TemplateProps> = ({ resume }) => {
  return (
    <div className="bg-white text-zinc-900 p-8 shadow-sm font-sans max-w-[210mm] min-h-[297mm] mx-auto text-sm" id="resume-preview-content">
      {/* Header with Clinical Accent */}
      <div className="border-l-4 border-emerald-600 pl-4 mb-5">
        <h1 className="text-2xl font-bold text-zinc-900">{resume.contact.name || 'Healthcare Professional'}</h1>
        <p className="text-emerald-700 font-semibold text-xs uppercase tracking-wider mt-0.5">Clinical & Healthcare Professional</p>
        <div className="text-xs text-zinc-600 flex flex-wrap gap-3 mt-1">
          {resume.contact.email && <span>{resume.contact.email}</span>}
          {resume.contact.phone && <span>{resume.contact.phone}</span>}
          {resume.contact.location && <span>{resume.contact.location}</span>}
        </div>
      </div>

      {/* Summary */}
      {resume.summary && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b border-zinc-200 pb-1 mb-2">Patient Care Profile</h2>
          <p className="text-xs text-zinc-700 leading-relaxed">{resume.summary}</p>
        </div>
      )}

      {/* Skills & Clinical Competencies */}
      <div className="mb-5 bg-emerald-50/50 p-3 rounded border border-emerald-100">
        <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1">Clinical Competencies</h2>
        <div className="text-xs text-zinc-800">{resume.skills.all.join(' • ')}</div>
      </div>

      {/* Experience */}
      {resume.experience && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b border-zinc-200 pb-1 mb-3">Clinical Experience</h2>
          <div className="space-y-4">
            {resume.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline font-bold text-xs">
                  <span className="text-zinc-900">{exp.title} — <span className="text-emerald-700">{exp.company}</span></span>
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

      {/* Education & Certifications */}
      {resume.education && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b border-zinc-200 pb-1 mb-2">Education & Credentials</h2>
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

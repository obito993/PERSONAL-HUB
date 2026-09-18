import React from 'react';
import { ParsedResume } from '@/types';

interface TemplateProps {
  resume: ParsedResume;
}

export const ProfessionalTemplate: React.FC<TemplateProps> = ({ resume }) => {
  return (
    <div className="bg-white text-zinc-900 p-8 shadow-sm font-serif max-w-[210mm] min-h-[297mm] mx-auto text-sm leading-relaxed" id="resume-preview-content">
      {/* Header */}
      <div className="text-center border-b border-zinc-300 pb-4 mb-5">
        <h1 className="text-3xl font-normal tracking-wide text-zinc-900 uppercase">
          {resume.contact.name || 'Executive Candidate'}
        </h1>
        <div className="text-xs text-zinc-600 font-sans mt-2 flex justify-center gap-4">
          {resume.contact.email && <span>{resume.contact.email}</span>}
          {resume.contact.phone && <span>{resume.contact.phone}</span>}
          {resume.contact.location && <span>{resume.contact.location}</span>}
        </div>
      </div>

      {/* Executive Summary */}
      {resume.summary && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-800 font-sans border-b border-zinc-200 pb-1 mb-2">
            Executive Summary
          </h2>
          <p className="text-xs text-zinc-800 italic">{resume.summary}</p>
        </div>
      )}

      {/* Core Competencies */}
      {resume.skills.all.length > 0 && (
        <div className="mb-5 font-sans">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-800 border-b border-zinc-200 pb-1 mb-2">
            Core Competencies
          </h2>
          <div className="text-xs text-zinc-700 leading-normal">
            {resume.skills.all.join(' • ')}
          </div>
        </div>
      )}

      {/* Professional Experience */}
      {resume.experience && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-800 font-sans border-b border-zinc-200 pb-1 mb-3">
            Professional Experience
          </h2>
          <div className="space-y-4 font-sans">
            {resume.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline font-bold text-xs">
                  <span>{exp.title}, <span className="font-normal italic text-zinc-700">{exp.company}</span></span>
                  <span className="text-zinc-500 font-normal">{exp.startDate} – {exp.endDate}</span>
                </div>
                <ul className="list-disc list-inside text-xs text-zinc-700 space-y-1 mt-1 font-serif">
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
        <div className="font-sans">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-800 border-b border-zinc-200 pb-1 mb-2">
            Education
          </h2>
          {resume.education.map((edu) => (
            <div key={edu.id} className="flex justify-between text-xs">
              <span className="font-bold text-zinc-900">{edu.degree} in {edu.field} — {edu.institution}</span>
              <span className="text-zinc-500">{edu.startDate} – {edu.endDate}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

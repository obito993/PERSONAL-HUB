import React from 'react';
import { ParsedResume } from '@/types';

interface TemplateProps {
  resume: ParsedResume;
}

export const AcademicTemplate: React.FC<TemplateProps> = ({ resume }) => {
  return (
    <div className="bg-white text-zinc-900 p-8 shadow-sm font-serif max-w-[210mm] min-h-[297mm] mx-auto text-sm leading-relaxed" id="resume-preview-content">
      {/* Header */}
      <div className="text-center border-b border-zinc-300 pb-4 mb-5">
        <h1 className="text-2xl font-bold uppercase tracking-wider text-zinc-900">
          {resume.contact.name || 'Academic Candidate'}
        </h1>
        <div className="text-xs text-zinc-600 font-sans mt-1 flex justify-center gap-3">
          {resume.contact.email && <span>{resume.contact.email}</span>}
          {resume.contact.phone && <span>{resume.contact.phone}</span>}
          {resume.contact.location && <span>{resume.contact.location}</span>}
        </div>
      </div>

      {/* Education First for Academic Layout */}
      {resume.education && (
        <div className="mb-5 font-sans">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-800 border-b border-zinc-200 pb-1 mb-2">
            Education & Academic Credentials
          </h2>
          {resume.education.map((edu) => (
            <div key={edu.id} className="mb-2">
              <div className="flex justify-between font-bold text-xs text-zinc-900">
                <span>{edu.degree} in {edu.field}</span>
                <span className="text-zinc-500 font-normal">{edu.startDate} – {edu.endDate}</span>
              </div>
              <div className="text-xs text-zinc-600 italic">{edu.institution}</div>
            </div>
          ))}
        </div>
      )}

      {/* Research & Projects */}
      {resume.projects && (
        <div className="mb-5 font-serif">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-800 font-sans border-b border-zinc-200 pb-1 mb-2">
            Research & Scholarly Projects
          </h2>
          {resume.projects.map((proj) => (
            <div key={proj.id} className="mb-3">
              <div className="font-bold text-xs text-zinc-900">{proj.title}</div>
              <p className="text-xs text-zinc-700 italic">{proj.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Experience */}
      {resume.experience && (
        <div className="mb-5 font-sans">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-800 border-b border-zinc-200 pb-1 mb-2">
            Teaching & Professional Experience
          </h2>
          {resume.experience.map((exp) => (
            <div key={exp.id} className="mb-3">
              <div className="flex justify-between font-bold text-xs">
                <span>{exp.title} — <span className="font-normal italic">{exp.company}</span></span>
                <span className="text-zinc-500 font-normal">{exp.startDate} – {exp.endDate}</span>
              </div>
              <ul className="list-disc list-inside text-xs text-zinc-700 space-y-0.5 mt-1 font-serif">
                {exp.bullets.map((b, idx) => (
                  <li key={idx}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

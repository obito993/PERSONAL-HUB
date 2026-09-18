import React from 'react';
import { ParsedResume } from '@/types';

interface TemplateProps {
  resume: ParsedResume;
}

export const TechnicalTemplate: React.FC<TemplateProps> = ({ resume }) => {
  return (
    <div className="bg-white text-zinc-900 p-8 shadow-sm font-sans max-w-[210mm] min-h-[297mm] mx-auto text-sm" id="resume-preview-content">
      {/* Header */}
      <div className="border-b-2 border-zinc-900 pb-3 mb-4">
        <h1 className="text-2xl font-bold text-zinc-900">{resume.contact.name || 'Developer Candidate'}</h1>
        <div className="text-xs text-zinc-600 flex flex-wrap gap-3 mt-1 font-mono">
          {resume.contact.email && <span>email: {resume.contact.email}</span>}
          {resume.contact.phone && <span>phone: {resume.contact.phone}</span>}
          {resume.contact.github && <span>github: {resume.contact.github}</span>}
        </div>
      </div>

      {/* Structured Technical Skills Box */}
      <div className="bg-zinc-50 border border-zinc-200 rounded p-3 mb-5 text-xs font-mono">
        <div className="font-bold text-zinc-900 mb-1 border-b border-zinc-200 pb-1 text-orange-600">TECHNICAL ARCHITECTURE & SKILLS</div>
        <div className="grid grid-cols-2 gap-2 mt-1">
          <div>
            <span className="font-bold text-zinc-700">Languages & Core: </span>
            <span className="text-zinc-600">{resume.skills.technical.slice(0, 6).join(', ')}</span>
          </div>
          <div>
            <span className="font-bold text-zinc-700">Tools & Infra: </span>
            <span className="text-zinc-600">{resume.skills.tools.join(', ') || 'Git, Docker, Linux, AWS'}</span>
          </div>
        </div>
      </div>

      {/* Experience */}
      {resume.experience && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-1 mb-3">Technical Experience</h2>
          <div className="space-y-4">
            {resume.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-zinc-900 text-xs">{exp.title} <span className="font-normal text-zinc-600">@ {exp.company}</span></span>
                  <span className="text-xs text-zinc-500 font-mono">{exp.startDate} – {exp.endDate}</span>
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

      {/* Technical Projects */}
      {resume.projects && resume.projects.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-1 mb-2">Projects & Systems Built</h2>
          <div className="space-y-3">
            {resume.projects.map((proj) => (
              <div key={proj.id} className="border-l-2 border-orange-500 pl-3">
                <div className="font-bold text-xs text-zinc-900">{proj.title}</div>
                <p className="text-xs text-zinc-700">{proj.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {resume.education && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-1 mb-2">Education</h2>
          {resume.education.map((edu) => (
            <div key={edu.id} className="flex justify-between text-xs">
              <span className="font-bold text-zinc-900">{edu.degree} in {edu.field} ({edu.institution})</span>
              <span className="text-zinc-500 font-mono">{edu.startDate} – {edu.endDate}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

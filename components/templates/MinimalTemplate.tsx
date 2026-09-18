import React from 'react';
import { ParsedResume } from '@/types';

interface TemplateProps {
  resume: ParsedResume;
}

export const MinimalTemplate: React.FC<TemplateProps> = ({ resume }) => {
  return (
    <div className="bg-white text-zinc-900 p-8 shadow-sm font-mono max-w-[210mm] min-h-[297mm] mx-auto text-xs leading-relaxed" id="resume-preview-content">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900">
          {resume.contact.name || 'CANDIDATE NAME'}
        </h1>
        <div className="text-[11px] text-zinc-500 mt-1 flex flex-wrap gap-3">
          {resume.contact.email && <span>{resume.contact.email}</span>}
          {resume.contact.phone && <span>{resume.contact.phone}</span>}
          {resume.contact.location && <span>{resume.contact.location}</span>}
        </div>
      </div>

      <hr className="border-zinc-200 mb-5" />

      {/* Summary */}
      {resume.summary && (
        <div className="mb-6">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">01 // SUMMARY</div>
          <p className="text-zinc-800 font-sans text-xs">{resume.summary}</p>
        </div>
      )}

      {/* Skills */}
      {resume.skills.all.length > 0 && (
        <div className="mb-6">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">02 // SKILLS</div>
          <p className="text-zinc-800 font-sans text-xs">{resume.skills.all.join(' • ')}</p>
        </div>
      )}

      {/* Experience */}
      {resume.experience && resume.experience.length > 0 && (
        <div className="mb-6">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">03 // EXPERIENCE</div>
          <div className="space-y-4">
            {resume.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between text-xs font-bold text-zinc-900">
                  <span>{exp.title} @ {exp.company}</span>
                  <span className="text-zinc-400 font-normal">{exp.startDate} - {exp.endDate}</span>
                </div>
                <ul className="mt-1 font-sans text-xs text-zinc-700 space-y-1 pl-4 list-disc">
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
      {resume.education && resume.education.length > 0 && (
        <div>
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">04 // EDUCATION</div>
          {resume.education.map((edu) => (
            <div key={edu.id} className="flex justify-between text-xs font-sans">
              <span className="font-bold text-zinc-800">{edu.degree} in {edu.field} — {edu.institution}</span>
              <span className="text-zinc-400">{edu.startDate} - {edu.endDate}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

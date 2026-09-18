import React from 'react';
import { ParsedResume } from '@/types';

interface TemplateProps {
  resume: ParsedResume;
}

export const ClassicTemplate: React.FC<TemplateProps> = ({ resume }) => {
  return (
    <div className="bg-white text-zinc-900 p-8 shadow-sm font-sans max-w-[210mm] min-h-[297mm] mx-auto text-sm leading-relaxed" id="resume-preview-content">
      {/* Header */}
      <div className="border-b-2 border-zinc-900 pb-4 mb-5 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 uppercase">
          {resume.contact.name || 'Candidate Name'}
        </h1>
        <div className="flex flex-wrap justify-center gap-2 text-xs text-zinc-600 mt-1">
          {resume.contact.email && <span>{resume.contact.email}</span>}
          {resume.contact.phone && <span>• {resume.contact.phone}</span>}
          {resume.contact.location && <span>• {resume.contact.location}</span>}
          {resume.contact.linkedin && <span>• {resume.contact.linkedin}</span>}
          {resume.contact.github && <span>• {resume.contact.github}</span>}
        </div>
      </div>

      {/* Summary */}
      {resume.summary && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-orange-600 border-b border-zinc-200 pb-1 mb-2">
            Professional Summary
          </h2>
          <p className="text-zinc-700 text-xs leading-normal">{resume.summary}</p>
        </div>
      )}

      {/* Technical Skills */}
      {(resume.skills.technical.length > 0 || resume.skills.soft.length > 0) && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-orange-600 border-b border-zinc-200 pb-1 mb-2">
            Core Competencies & Skills
          </h2>
          <div className="text-xs space-y-1">
            {resume.skills.technical.length > 0 && (
              <div>
                <span className="font-semibold text-zinc-900">Technical Skills: </span>
                <span className="text-zinc-700">{resume.skills.technical.join(', ')}</span>
              </div>
            )}
            {resume.skills.soft.length > 0 && (
              <div>
                <span className="font-semibold text-zinc-900">Soft Skills & Methodologies: </span>
                <span className="text-zinc-700">{resume.skills.soft.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Work Experience */}
      {resume.experience && resume.experience.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-orange-600 border-b border-zinc-200 pb-1 mb-2">
            Professional Experience
          </h2>
          <div className="space-y-4">
            {resume.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-zinc-900 text-xs">{exp.title}</span>
                  <span className="text-xs text-zinc-500 font-medium">
                    {exp.startDate} – {exp.endDate}
                  </span>
                </div>
                <div className="text-xs text-zinc-700 font-semibold mb-1">
                  {exp.company} {exp.location ? `| ${exp.location}` : ''}
                </div>
                <ul className="list-disc list-inside text-xs text-zinc-700 space-y-0.5">
                  {exp.bullets.map((bullet, idx) => (
                    <li key={idx} className="leading-snug">
                      <span className="-ml-1">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {resume.projects && resume.projects.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-orange-600 border-b border-zinc-200 pb-1 mb-2">
            Key Projects
          </h2>
          <div className="space-y-3">
            {resume.projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-zinc-900 text-xs">{proj.title}</span>
                  {proj.technologies.length > 0 && (
                    <span className="text-xs text-zinc-500 italic">
                      [{proj.technologies.join(', ')}]
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-700">{proj.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {resume.education && resume.education.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-orange-600 border-b border-zinc-200 pb-1 mb-2">
            Education
          </h2>
          <div className="space-y-2">
            {resume.education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline">
                <div>
                  <span className="font-bold text-zinc-900 text-xs">
                    {edu.degree} in {edu.field}
                  </span>
                  <div className="text-xs text-zinc-600">{edu.institution}</div>
                </div>
                <span className="text-xs text-zinc-500 font-medium">
                  {edu.startDate} – {edu.endDate}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

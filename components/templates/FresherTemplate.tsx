import React from 'react';
import { ParsedResume } from '@/types';

interface TemplateProps {
  resume: ParsedResume;
}

export const FresherTemplate: React.FC<TemplateProps> = ({ resume }) => {
  return (
    <div className="bg-white text-zinc-900 p-8 shadow-sm font-sans max-w-[210mm] min-h-[297mm] mx-auto text-sm leading-relaxed" id="resume-preview-content">
      {/* Header */}
      <div className="border-b-2 border-orange-500 pb-4 mb-5 text-center">
        <h1 className="text-2xl font-bold uppercase tracking-tight text-zinc-900">
          {resume.contact.name || 'Graduate / Fresher Candidate'}
        </h1>
        <div className="flex flex-wrap justify-center gap-2 text-xs text-zinc-600 mt-1">
          {resume.contact.email && <span>{resume.contact.email}</span>}
          {resume.contact.phone && <span>• {resume.contact.phone}</span>}
          {resume.contact.location && <span>• {resume.contact.location}</span>}
          {resume.contact.github && <span>• {resume.contact.github}</span>}
        </div>
      </div>

      {/* Objective / Summary */}
      {resume.summary && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-orange-600 border-b border-zinc-200 pb-1 mb-2">
            Career Objective
          </h2>
          <p className="text-zinc-700 text-xs leading-normal">{resume.summary}</p>
        </div>
      )}

      {/* Education First for Freshers */}
      {resume.education && resume.education.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-orange-600 border-b border-zinc-200 pb-1 mb-2">
            Education & Academic Background
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

      {/* Academic & Personal Projects */}
      {resume.projects && resume.projects.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-orange-600 border-b border-zinc-200 pb-1 mb-2">
            Key Projects & Portfolios
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

      {/* Core Competencies & Skills */}
      <div className="mb-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-orange-600 border-b border-zinc-200 pb-1 mb-2">
          Skills & Certifications
        </h2>
        <div className="text-xs text-zinc-700">{resume.skills.all.join(' • ')}</div>
      </div>

      {/* Experience / Internships */}
      {resume.experience && resume.experience.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-orange-600 border-b border-zinc-200 pb-1 mb-2">
            Internships & Leadership Experience
          </h2>
          <div className="space-y-3">
            {resume.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between font-bold text-xs text-zinc-900">
                  <span>{exp.title} — {exp.company}</span>
                  <span className="text-zinc-500 font-normal">{exp.startDate} – {exp.endDate}</span>
                </div>
                <ul className="list-disc list-inside text-xs text-zinc-700 space-y-0.5 mt-1">
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
  );
};

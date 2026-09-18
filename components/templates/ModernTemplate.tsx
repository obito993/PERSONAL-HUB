import React from 'react';
import { ParsedResume } from '@/types';

interface TemplateProps {
  resume: ParsedResume;
}

export const ModernTemplate: React.FC<TemplateProps> = ({ resume }) => {
  return (
    <div className="bg-white text-zinc-900 p-8 shadow-sm font-sans max-w-[210mm] min-h-[297mm] mx-auto text-sm" id="resume-preview-content">
      {/* Top Accent Line */}
      <div className="h-2 bg-gradient-to-r from-orange-500 via-amber-500 to-violet-600 rounded-t mb-6" />

      {/* Header */}
      <div className="flex justify-between items-start border-b border-zinc-200 pb-5 mb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            {resume.contact.name || 'Candidate Name'}
          </h1>
          <p className="text-orange-600 font-semibold text-xs mt-1 uppercase tracking-wide">
            {resume.experience[0]?.title || 'Professional Candidate'}
          </p>
        </div>
        <div className="text-right text-xs text-zinc-600 space-y-0.5">
          {resume.contact.email && <div>{resume.contact.email}</div>}
          {resume.contact.phone && <div>{resume.contact.phone}</div>}
          {resume.contact.location && <div>{resume.contact.location}</div>}
          {resume.contact.linkedin && <div className="text-zinc-500">{resume.contact.linkedin}</div>}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column (Main) */}
        <div className="col-span-8 space-y-5">
          {resume.summary && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2 flex items-center gap-2">
                <span className="w-1.5 h-3 bg-orange-500 rounded-sm" />
                Profile
              </h2>
              <p className="text-xs text-zinc-700 leading-relaxed">{resume.summary}</p>
            </div>
          )}

          {resume.experience && resume.experience.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-3 bg-orange-500 rounded-sm" />
                Experience
              </h2>
              <div className="space-y-4">
                {resume.experience.map((exp) => (
                  <div key={exp.id} className="relative pl-3 border-l border-zinc-200">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-zinc-900 text-xs">{exp.title}</span>
                      <span className="text-[11px] text-orange-600 font-medium">{exp.startDate} – {exp.endDate}</span>
                    </div>
                    <div className="text-xs text-zinc-600 font-medium mb-1">{exp.company}</div>
                    <ul className="list-disc list-inside text-xs text-zinc-700 space-y-1">
                      {exp.bullets.map((bullet, idx) => (
                        <li key={idx} className="leading-normal">{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="col-span-4 space-y-5 border-l border-zinc-100 pl-4">
          {/* Skills */}
          {resume.skills.technical.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2">Technical Skills</h2>
              <div className="flex flex-wrap gap-1">
                {resume.skills.technical.map((skill, idx) => (
                  <span key={idx} className="bg-zinc-100 text-zinc-800 text-[11px] px-2 py-0.5 rounded font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {resume.education && resume.education.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2">Education</h2>
              <div className="space-y-2">
                {resume.education.map((edu) => (
                  <div key={edu.id}>
                    <div className="font-semibold text-xs text-zinc-900">{edu.degree}</div>
                    <div className="text-[11px] text-zinc-600">{edu.institution}</div>
                    <div className="text-[10px] text-zinc-400">{edu.startDate} – {edu.endDate}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {resume.projects && resume.projects.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2">Projects</h2>
              <div className="space-y-2">
                {resume.projects.map((proj) => (
                  <div key={proj.id}>
                    <div className="font-semibold text-xs text-zinc-900">{proj.title}</div>
                    <p className="text-[11px] text-zinc-600 leading-tight">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

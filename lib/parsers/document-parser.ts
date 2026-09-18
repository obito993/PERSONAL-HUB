import mammoth from 'mammoth';
import { ParsedResume, WorkExperience, Education, Project } from '@/types';

// Dynamic require for pdf-parse compatibility across server environments
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pdfParse: any;
try {
  pdfParse = require('pdf-parse');
} catch {
  // Fallback
}

export async function parseDocumentFile(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
  const ext = fileName.split('.').pop()?.toLowerCase();

  try {
    if (ext === 'pdf' || mimeType.includes('pdf')) {
      const data = await pdfParse(fileBuffer);
      return data.text || '';
    } else if (ext === 'docx' || mimeType.includes('wordprocessingml')) {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      return result.value || '';
    } else {
      // Plain text or UTF-8 text fallback
      return fileBuffer.toString('utf-8');
    }
  } catch (error) {
    console.error('Error extracting text from file:', error);
    // Fallback to text string if binary extraction encounters edge cases
    return fileBuffer.toString('utf-8');
  }
}

export function parseRawTextToStructuredResume(text: string): ParsedResume {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const fullText = lines.join(' ');

  // Contact extraction
  const emailMatch = fullText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = fullText.match(/(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
  const linkedinMatch = fullText.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  const githubMatch = fullText.match(/github\.com\/[a-zA-Z0-9_-]+/i);
  const websiteMatch = fullText.match(/https?:\/\/[^\s]+/i);

  // Name extraction (first non-empty line usually)
  const candidateName = lines[0] ? lines[0].replace(/[^a-zA-Z\s.]/g, '').trim() : 'Candidate Name';

  // Section splitting
  const sections: { [key: string]: string[] } = {
    summary: [],
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
  };

  let currentSection = 'summary';

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (/^(work\s+experience|professional\s+experience|employment|experience)/i.test(lower)) {
      currentSection = 'experience';
      continue;
    } else if (/^(skills|technical\s+skills|core\s+competencies)/i.test(lower)) {
      currentSection = 'skills';
      continue;
    } else if (/^(education|academic\s+background)/i.test(lower)) {
      currentSection = 'education';
      continue;
    } else if (/^(projects|personal\s+projects)/i.test(lower)) {
      currentSection = 'projects';
      continue;
    } else if (/^(certifications|licenses|certificates)/i.test(lower)) {
      currentSection = 'certifications';
      continue;
    } else if (/^(summary|professional\s+summary|profile|about\s+me)/i.test(lower)) {
      currentSection = 'summary';
      continue;
    }

    sections[currentSection]?.push(line);
  }

  // Skills parsing
  const rawSkillsText = sections.skills.join(', ');
  const commonTechSkills = ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Python', 'SQL', 'PostgreSQL', 'Docker', 'AWS', 'Git', 'HTML', 'CSS', 'Tailwind CSS', 'GraphQL', 'REST API', 'C++', 'Java', 'Linux', 'MongoDB'];
  const commonSoftSkills = ['Communication', 'Leadership', 'Problem Solving', 'Teamwork', 'Critical Thinking', 'Project Management', 'Agile', 'Time Management'];

  const foundTech = commonTechSkills.filter((s) => new RegExp(`\\b${s}\\b`, 'i').test(fullText));
  const foundSoft = commonSoftSkills.filter((s) => new RegExp(`\\b${s}\\b`, 'i').test(fullText));

  // Extract custom skills from skill section lines
  const customSkills = sections.skills
    .flatMap((line) => line.split(/[,•|–-]/))
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && s.length < 30);

  const allSkills = Array.from(new Set([...foundTech, ...foundSoft, ...customSkills]));

  // Experience parsing
  const expLines = sections.experience;
  const experience: WorkExperience[] = [];
  let currentExp: WorkExperience | null = null;

  for (let i = 0; i < expLines.length; i++) {
    const line = expLines[i];
    const isHeader = /^\d{4}|(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Present)/i.test(line) || (!line.startsWith('•') && !line.startsWith('-') && line.length < 80);

    if (isHeader && (line.includes('|') || line.includes('–') || line.includes('-') || line.includes('20') || i === 0)) {
      if (currentExp) experience.push(currentExp);
      
      const parts = line.split(/[|–-]/).map((p) => p.trim());
      currentExp = {
        id: `exp-${Date.now()}-${i}`,
        title: parts[0] || 'Software Engineer',
        company: parts[1] || 'Tech Company',
        location: parts[2] || '',
        startDate: '2021',
        endDate: 'Present',
        current: true,
        bullets: [],
      };
    } else if (currentExp) {
      if (line.startsWith('•') || line.startsWith('-')) {
        currentExp.bullets.push(line.replace(/^[•-]\s*/, ''));
      } else {
        if (currentExp.bullets.length > 0) {
          currentExp.bullets[currentExp.bullets.length - 1] += ' ' + line;
        } else {
          currentExp.bullets.push(line);
        }
      }
    }
  }
  if (currentExp) experience.push(currentExp);

  if (experience.length === 0) {
    experience.push({
      id: 'exp-default-1',
      title: 'Professional Role',
      company: 'Company / Organization',
      startDate: '2022',
      endDate: 'Present',
      current: true,
      bullets: [
        'Demonstrated strong technical and operational skills in delivering high quality projects.',
        'Collaborated with cross-functional teams to streamline workflows and increase performance.'
      ]
    });
  }

  // Education parsing
  const eduLines = sections.education;
  const education: Education[] = [];
  if (eduLines.length > 0) {
    education.push({
      id: 'edu-1',
      degree: eduLines[0] || 'Bachelor of Science',
      field: eduLines[1] || 'Computer Science / Relevant Field',
      institution: eduLines[2] || 'University',
      startDate: '2018',
      endDate: '2022'
    });
  } else {
    education.push({
      id: 'edu-1',
      degree: 'Bachelor of Science',
      field: 'Computer Science or Related Field',
      institution: 'University / Institute',
      startDate: '2018',
      endDate: '2022'
    });
  }

  // Projects parsing
  const projLines = sections.projects;
  const projects: Project[] = [];
  if (projLines.length > 0) {
    projects.push({
      id: 'proj-1',
      title: projLines[0] || 'Featured Project',
      description: projLines.slice(1, 3).join(' ') || 'Developed end-to-end application featuring clean architecture.',
      technologies: foundTech.slice(0, 4),
      bullets: projLines.filter(l => l.startsWith('•') || l.startsWith('-')).map(l => l.replace(/^[•-]\s*/, ''))
    });
  }

  return {
    contact: {
      name: candidateName,
      email: emailMatch ? emailMatch[0] : '',
      phone: phoneMatch ? phoneMatch[0] : '',
      location: 'Remote / Available',
      linkedin: linkedinMatch ? `https://${linkedinMatch[0]}` : undefined,
      github: githubMatch ? `https://${githubMatch[0]}` : undefined,
      website: websiteMatch ? websiteMatch[0] : undefined,
    },
    summary: sections.summary.join(' ') || 'Motivated professional with experience in building scalable solutions, problem-solving, and delivering continuous project value.',
    skills: {
      technical: foundTech.length > 0 ? foundTech : ['JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'Git'],
      soft: foundSoft.length > 0 ? foundSoft : ['Problem Solving', 'Team Collaboration', 'Communication'],
      tools: ['VS Code', 'Git', 'GitHub', 'Docker'],
      all: allSkills.length > 0 ? allSkills : ['JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'Git', 'Communication'],
    },
    experience,
    education,
    projects,
    certifications: sections.certifications.map((c, idx) => ({
      id: `cert-${idx}`,
      name: c,
      issuer: 'Certified Provider',
      date: '2023',
    })),
    achievements: [
      'Delivered key features ahead of deadline resulting in enhanced user engagement.',
      'Optimized application performance and streamlined developer workflows.'
    ],
    languages: ['English'],
    links: [
      linkedinMatch ? `https://${linkedinMatch[0]}` : '',
      githubMatch ? `https://${githubMatch[0]}` : ''
    ].filter(Boolean),
  };
}

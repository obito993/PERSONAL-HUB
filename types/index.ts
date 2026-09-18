export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface WorkExperience {
  id: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface Education {
  id: string;
  degree: string;
  field: string;
  institution: string;
  location?: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  url?: string;
  technologies: string[];
  bullets: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface ParsedResume {
  contact: ContactInfo;
  summary: string;
  skills: {
    technical: string[];
    soft: string[];
    tools: string[];
    all: string[];
  };
  experience: WorkExperience[];
  education: Education[];
  projects: Project[];
  certifications: Certification[];
  achievements: string[];
  languages: string[];
  links: string[];
}

export interface ParsedJob {
  title: string;
  company: string;
  description: string;
  url?: string;
  requiredSkills: string[];
  preferredSkills: string[];
  technicalSkills: string[];
  softSkills: string[];
  responsibilities: string[];
  educationRequirements: string[];
  experienceRequirements: string[];
  tools: string[];
  importantKeywords: string[];
}

export interface CategoryScores {
  skills: number;
  keywords: number;
  experience: number;
  education: number;
  responsibilities: number;
}

export interface MissingKeywordDetail {
  keyword: string;
  importance: 'HIGH' | 'MEDIUM' | 'LOW';
  evidence: string;
  inResume: boolean;
  recommendation: string;
}

export interface ResumeIssue {
  id: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  explanation: string;
  location: string;
  suggestedFix: string;
}

export interface MatchAnalysis {
  overallScore: number;
  categoryScores: CategoryScores;
  matchingSkills: string[];
  missingSkills: string[];
  partialSkills: string[];
  matchingKeywords: string[];
  missingKeywords: MissingKeywordDetail[];
  partialKeywords: string[];
  resumeIssues: ResumeIssue[];
  recommendations: string[];
  userConfirmedSkills?: string[];
}

export interface ResumeChange {
  id: string;
  type: 'ADDED' | 'REMOVED' | 'REWRITTEN' | 'REORDERED';
  section: string;
  originalText: string;
  newText: string;
  reason: string;
  status: 'accepted' | 'rejected' | 'pending';
}

export interface UserSession {
  id: string;
  email: string;
  name: string;
}

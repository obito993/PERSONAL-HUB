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

export type UserCareerMode = 'FRESHER' | 'EXPERIENCED' | 'CAREER_CHANGER';

export interface MasterProfileData {
  id?: string;
  userId?: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  website?: string;
  
  targetTitle: string;
  userMode: UserCareerMode;
  industry?: string;
  yearsOfExp: number;
  summary: string;
  
  experience: WorkExperience[];
  education: Education[];
  projects: Project[];
  skills: {
    technical: string[];
    soft: string[];
    tools: string[];
    all: string[];
  };
  certifications: Certification[];
  awards: string[];
  achievements: string[];
  volunteer: string[];
  leadership: string[];
  publications: string[];
  languages: string[];
  interests: string[];
}

export interface ParsedJob {
  title: string;
  company: string;
  description: string;
  url?: string;
  industry?: string;
  seniority?: string;
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

export interface DiagnosticMetrics {
  jobMatchScore: number;
  atsCompatibilityScore: number;
  resumeQualityScore: number;
  overallScore: number;
}

export interface MatchAnalysis {
  id?: string;
  jobMatchScore: number;
  atsCompatibilityScore: number;
  resumeQualityScore: number;
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
  job?: ParsedJob;
  resume?: { id: string; name: string };
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

export interface CoverLetterData {
  id?: string;
  jobDescriptionId?: string;
  company: string;
  jobTitle: string;
  style: 'Professional' | 'Concise' | 'Modern' | 'Formal' | 'Entry-level';
  content: string;
  createdAt?: string;
}

export interface InterviewQuestionData {
  id?: string;
  category: 'HR' | 'Technical' | 'Behavioral' | 'Situational';
  question: string;
  rationale: string;
  structure: string;
  userAnswer?: string;
}

export interface InterviewSessionData {
  id?: string;
  jobDescriptionId?: string;
  jobTitle: string;
  company: string;
  questions: InterviewQuestionData[];
  createdAt?: string;
}

export type ApplicationStatus =
  | 'SAVED'
  | 'APPLIED'
  | 'SCREENING'
  | 'INTERVIEW'
  | 'TECHNICAL'
  | 'OFFER'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface JobApplicationData {
  id?: string;
  jobDescriptionId?: string;
  tailoredResumeId?: string;
  coverLetterId?: string;
  company: string;
  jobTitle: string;
  location?: string;
  jobUrl?: string;
  salary?: string;
  status: ApplicationStatus;
  dateApplied: string;
  interviewDate?: string;
  followUpDate?: string;
  recruiter?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSession {
  id: string;
  email: string;
  name: string;
}

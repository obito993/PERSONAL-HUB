import { generateAIText } from './service';
import {
  ParsedResume,
  ParsedJob,
  ResumeChange,
  InterviewQuestionData,
} from '@/types';

export class AIService {
  // 1. Job Description Analyzer using AI Router
  public static async analyzeJobDescription(
    title: string,
    company: string,
    description: string,
    url?: string
  ): Promise<ParsedJob> {
    try {
      const prompt = `
Analyze the following job description for the title "${title}" at "${company}".
Extract structured job requirements:

Return JSON with format:
{
  "title": "${title}",
  "company": "${company}",
  "description": ${JSON.stringify(description)},
  "url": "${url || ''}",
  "industry": "Industry category",
  "seniority": "Seniority level",
  "requiredSkills": ["skill1", "skill2"],
  "preferredSkills": ["skill1"],
  "technicalSkills": ["skill1"],
  "softSkills": ["skill1"],
  "responsibilities": ["duty1"],
  "educationRequirements": ["requirement"],
  "experienceRequirements": ["requirement"],
  "tools": ["tool1"],
  "importantKeywords": ["keyword1"]
}

Job Description:
${description}`;

      const resText = await generateAIText({
        prompt,
        mode: 'CAREER',
      });

      const cleanJson = resText.result.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return {
        title: parsed.title || title,
        company: parsed.company || company,
        description: parsed.description || description,
        url: parsed.url || url,
        requiredSkills: parsed.requiredSkills || [],
        preferredSkills: parsed.preferredSkills || [],
        technicalSkills: parsed.technicalSkills || [],
        softSkills: parsed.softSkills || [],
        responsibilities: parsed.responsibilities || [],
        educationRequirements: parsed.educationRequirements || [],
        experienceRequirements: parsed.experienceRequirements || [],
        tools: parsed.tools || [],
        importantKeywords: parsed.importantKeywords || [],
        industry: parsed.industry || 'General',
        seniority: parsed.seniority || 'Mid',
      };
    } catch (err) {
      console.error('[AIService] analyzeJobDescription error:', err);
      const words = description.split(/\s+/).filter(w => w.length > 3);
      return {
        title,
        company,
        description,
        url,
        requiredSkills: Array.from(new Set(words.slice(0, 8))),
        preferredSkills: [],
        technicalSkills: Array.from(new Set(words.slice(0, 5))),
        softSkills: ['Communication', 'Problem Solving', 'Teamwork'],
        responsibilities: ['Execute core deliverables for the position.'],
        educationRequirements: ["Bachelor's degree or equivalent experience"],
        experienceRequirements: ['Relevant industry experience'],
        tools: [],
        importantKeywords: Array.from(new Set(words.slice(0, 10))),
        industry: 'Technology',
        seniority: 'Mid-Level',
      };
    }
  }

  // 2. Resume Tailoring Engine using AI Router
  public static async tailorResume(
    resume: ParsedResume,
    job: ParsedJob
  ): Promise<{ tailoredResume: ParsedResume; changes: ResumeChange[]; matchScore: number }> {
    try {
      const prompt = `
Tailor the candidate's resume for the target job position at ${job.company} (${job.title}).
Job Required Skills: ${job.requiredSkills.join(', ')}
Job Keywords: ${job.importantKeywords.join(', ')}

Resume Summary: ${resume.summary}
Resume Experience: ${JSON.stringify(resume.experience)}

Return JSON:
{
  "tailoredSummary": "High impact summary aligned with job description",
  "recommendedSkills": ["skill1", "skill2"],
  "matchScore": 88
}`;

      const resText = await generateAIText({
        prompt,
        mode: 'CAREER',
      });

      const cleanJson = resText.result.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      const addedTechnical = parsed.recommendedSkills || [];
      const newTechnical = Array.from(new Set([...(resume.skills?.technical || []), ...addedTechnical]));
      const newSoft = resume.skills?.soft || [];
      const newTools = resume.skills?.tools || [];
      const newAll = Array.from(new Set([...newTechnical, ...newSoft, ...newTools]));

      const tailoredResume: ParsedResume = {
        ...resume,
        summary: parsed.tailoredSummary || resume.summary,
        skills: {
          technical: newTechnical,
          soft: newSoft,
          tools: newTools,
          all: newAll,
        },
      };

      return {
        tailoredResume,
        changes: [
          {
            id: `change_${Date.now()}`,
            type: 'REWRITTEN',
            section: 'summary',
            originalText: resume.summary,
            newText: tailoredResume.summary,
            reason: 'Aligned summary with key job metrics and keywords.',
            status: 'accepted',
          }
        ],
        matchScore: parsed.matchScore || 85,
      };
    } catch (err) {
      console.error('[AIService] tailorResume error:', err);
      return {
        tailoredResume: resume,
        changes: [],
        matchScore: 75,
      };
    }
  }

  // 3. Interview Coaching Generator using AI Router
  public static async generateInterviewQuestions(
    resume: ParsedResume,
    job: ParsedJob
  ): Promise<InterviewQuestionData[]> {
    try {
      const prompt = `Generate 5 targeted STAR interview questions for a ${job.title} position at ${job.company}.
Required skills: ${job.requiredSkills.join(', ')}

Return JSON array of objects:
[
  {
    "question": "Interview question",
    "category": "Behavioral",
    "rationale": "Why this is asked",
    "structure": "STAR structure suggestion"
  }
]`;

      const resText = await generateAIText({
        prompt,
        mode: 'CAREER',
      });

      const cleanJson = resText.result.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanJson) as InterviewQuestionData[];
    } catch (err) {
      console.error('[AIService] generateInterviewQuestions error:', err);
      return [
        {
          id: 'q1',
          question: `Tell me about a time you applied ${job.requiredSkills[0] || 'problem-solving'} to complete a critical project.`,
          category: 'Behavioral',
          rationale: 'Evaluates technical problem-solving ability under real deadlines.',
          structure: 'Situation: Project context; Task: Goal; Action: Technical implementation; Result: Latency / impact.',
        }
      ];
    }
  }
}

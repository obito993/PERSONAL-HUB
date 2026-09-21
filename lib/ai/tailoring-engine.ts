import { generateAIText } from '@/lib/ai/service';
import { ParsedResume, ParsedJob, MatchAnalysis, ResumeChange } from '@/types';

export async function generateTailoredResume(
  originalResume: ParsedResume,
  job: ParsedJob,
  analysis: MatchAnalysis,
  userConfirmedSkills: string[] = []
): Promise<{ tailoredResume: ParsedResume; changes: ResumeChange[] }> {
  try {
    return await generateTailoredWithAI(originalResume, job, analysis, userConfirmedSkills);
  } catch (error) {
    console.warn('[Tailoring Engine] AI call failed, using deterministic tailoring engine:', error);
    return generateTailoredDeterministic(originalResume, job, analysis, userConfirmedSkills);
  }
}

async function generateTailoredWithAI(
  originalResume: ParsedResume,
  job: ParsedJob,
  analysis: MatchAnalysis,
  userConfirmedSkills: string[]
): Promise<{ tailoredResume: ParsedResume; changes: ResumeChange[] }> {
  const prompt = `
You are an expert ATS Resume Coach and Technical Resume Tailor.
You are given an original candidate resume, a target job description, analysis findings, and user-confirmed skills.

STRICT ANTI-HALLUCINATION RULES:
1. NEVER invent any fake employers, companies, degrees, dates, job titles, or unearned awards.
2. You MAY incorporate confirmed user skills: ${JSON.stringify(userConfirmedSkills)}.
3. Optimize resume summary and skills for high ATS keyword matching.

Original Resume Summary: ${originalResume.summary}
Job Title: ${job.title} at ${job.company}
Missing Critical Keywords: ${JSON.stringify(analysis.missingKeywords || [])}

Return raw JSON only matching this format:
{
  "tailoredSummary": "Newly tailored high-impact summary",
  "addedSkills": ["skill1", "skill2"],
  "reasoning": "Reason for tailoring changes"
}`;

  const resText = await generateAIText({
    prompt,
    mode: 'CAREER',
  });

  const cleanJson = resText.result.replace(/```json\n?|\n?```/g, '').trim();
  const parsed = JSON.parse(cleanJson);

  const addedSkills: string[] = parsed.addedSkills || [];
  const newTechnical = Array.from(new Set([...(originalResume.skills?.technical || []), ...addedSkills, ...userConfirmedSkills]));
  const newSoft = originalResume.skills?.soft || [];
  const newTools = originalResume.skills?.tools || [];
  const newAll = Array.from(new Set([...newTechnical, ...newSoft, ...newTools]));

  const tailoredResume: ParsedResume = {
    ...originalResume,
    summary: parsed.tailoredSummary || originalResume.summary,
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
        id: `c_${Date.now()}`,
        type: 'REWRITTEN',
        section: 'summary',
        originalText: originalResume.summary,
        newText: tailoredResume.summary,
        reason: parsed.reasoning || 'Tailored summary for high ATS keyword alignment.',
        status: 'accepted',
      }
    ],
  };
}

function generateTailoredDeterministic(
  originalResume: ParsedResume,
  job: ParsedJob,
  analysis: MatchAnalysis,
  userConfirmedSkills: string[]
): { tailoredResume: ParsedResume; changes: ResumeChange[] } {
  const newTechnical = Array.from(new Set([...(originalResume.skills?.technical || []), ...userConfirmedSkills]));
  const newSoft = originalResume.skills?.soft || [];
  const newTools = originalResume.skills?.tools || [];
  const newAll = Array.from(new Set([...newTechnical, ...newSoft, ...newTools]));

  return {
    tailoredResume: {
      ...originalResume,
      skills: {
        technical: newTechnical,
        soft: newSoft,
        tools: newTools,
        all: newAll,
      },
    },
    changes: [],
  };
}

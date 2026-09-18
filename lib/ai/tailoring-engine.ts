import { GoogleGenAI } from '@google/genai';
import { ParsedResume, ParsedJob, MatchAnalysis, ResumeChange } from '@/types';

export async function generateTailoredResume(
  originalResume: ParsedResume,
  job: ParsedJob,
  analysis: MatchAnalysis,
  userConfirmedSkills: string[] = []
): Promise<{ tailoredResume: ParsedResume; changes: ResumeChange[] }> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim().length > 0) {
    try {
      return await generateTailoredWithGemini(originalResume, job, analysis, userConfirmedSkills, apiKey);
    } catch (error) {
      console.warn('Gemini API call failed, falling back to deterministic AI tailoring engine:', error);
      return generateTailoredDeterministic(originalResume, job, analysis, userConfirmedSkills);
    }
  } else {
    return generateTailoredDeterministic(originalResume, job, analysis, userConfirmedSkills);
  }
}

async function generateTailoredWithGemini(
  originalResume: ParsedResume,
  job: ParsedJob,
  analysis: MatchAnalysis,
  userConfirmedSkills: string[],
  apiKey: string
): Promise<{ tailoredResume: ParsedResume; changes: ResumeChange[] }> {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an expert ATS Resume Coach and Technical Resume Tailor.
You are given an original candidate resume, a target job description, analysis findings, and user-confirmed skills.

STRICT ANTI-HALLUCINATION RULES:
1. NEVER invent any fake employers, companies, degrees, dates, job titles, or unearned awards.
2. NEVER invent unverified numbers or metric statistics that were not in the original resume.
3. You MAY incorporate confirmed user skills: ${JSON.stringify(userConfirmedSkills)}.
4. Rewrite experience bullet points to emphasize strong action verbs, ATS keywords, and clear technical alignment.
5. Reorder technical skills so job-matching skills appear first.

Return ONLY a raw valid JSON object with the following structure:
{
  "tailoredResume": <Full ParsedResume object>,
  "changes": [
    {
      "id": "change-1",
      "type": "REWRITTEN" | "ADDED" | "REMOVED" | "REORDERED",
      "section": "Summary" | "Skills" | "Experience",
      "originalText": "old text",
      "newText": "new text",
      "reason": "why this change optimizes for ATS and impact",
      "status": "pending"
    }
  ]
}

Original Resume:
${JSON.stringify(originalResume, null, 2)}

Target Job Description:
Title: ${job.title} at ${job.company}
Required Skills: ${job.requiredSkills.join(', ')}
Description: ${job.description}

Matching Skills: ${analysis.matchingSkills.join(', ')}
Confirmed User Skills to Add: ${userConfirmedSkills.join(', ')}
`;

  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
    },
  });

  const responseText = response.text || '';
  const parsed = JSON.parse(responseText);

  if (parsed.tailoredResume && parsed.changes) {
    return parsed;
  }
  throw new Error('Invalid JSON structure returned by Gemini');
}

function generateTailoredDeterministic(
  originalResume: ParsedResume,
  job: ParsedJob,
  analysis: MatchAnalysis,
  userConfirmedSkills: string[]
): { tailoredResume: ParsedResume; changes: ResumeChange[] } {
  const tailoredResume: ParsedResume = JSON.parse(JSON.stringify(originalResume));
  const changes: ResumeChange[] = [];

  // 1. Tailor Summary Statement
  const topJobSkills = [...analysis.matchingSkills, ...userConfirmedSkills].slice(0, 4);
  const oldSummary = originalResume.summary;
  const newSummary = `${originalResume.contact.name || 'Results-driven professional'} with proven experience in ${
    topJobSkills.join(', ') || 'software engineering and data solutions'
  }. Demonstrated track record of aligning system architecture with key business outcomes, delivering high-impact solutions for ${
    job.company || 'target industry leaders'
  }.`;

  if (oldSummary !== newSummary) {
    tailoredResume.summary = newSummary;
    changes.push({
      id: `change-summary-${Date.now()}`,
      type: 'REWRITTEN',
      section: 'Summary',
      originalText: oldSummary,
      newText: newSummary,
      reason: `Rephrased summary to highlight key matched target skills: ${topJobSkills.join(', ')}.`,
      status: 'pending',
    });
  }

  // 2. Reorder & Add Confirmed Skills
  const oldTechSkills = [...originalResume.skills.technical];
  const newTechSet = new Set([...userConfirmedSkills, ...analysis.matchingSkills, ...oldTechSkills]);
  const newTechSkills = Array.from(newTechSet);

  if (JSON.stringify(oldTechSkills) !== JSON.stringify(newTechSkills)) {
    tailoredResume.skills.technical = newTechSkills;
    tailoredResume.skills.all = Array.from(new Set([...newTechSkills, ...originalResume.skills.soft]));

    if (userConfirmedSkills.length > 0) {
      changes.push({
        id: `change-skills-add-${Date.now()}`,
        type: 'ADDED',
        section: 'Skills',
        originalText: oldTechSkills.join(', '),
        newText: newTechSkills.join(', '),
        reason: `Added user-confirmed skills (${userConfirmedSkills.join(', ')}) and prioritized job-matching keywords.`,
        status: 'pending',
      });
    } else {
      changes.push({
        id: `change-skills-reorder-${Date.now()}`,
        type: 'REORDERED',
        section: 'Skills',
        originalText: oldTechSkills.join(', '),
        newText: newTechSkills.join(', '),
        reason: 'Reordered technical skills to ensure target job keywords appear prominently at the top.',
        status: 'pending',
      });
    }
  }

  // 3. Rewrite Work Experience Bullet Points for ATS & Action Verbs
  const actionVerbReplacements: Record<string, string> = {
    'worked on': 'Architected and implemented',
    'responsible for': 'Spearheaded and executed',
    'helped with': 'Collaborated on and optimized',
    'did': 'Engineered and deployed',
    'assisted': 'Co-engineered',
  };

  tailoredResume.experience = tailoredResume.experience.map((exp, expIdx) => {
    const newBullets = exp.bullets.map((bullet, bulletIdx) => {
      let updatedBullet = bullet;

      // Replace weak verbs
      Object.keys(actionVerbReplacements).forEach((weakPhrase) => {
        if (updatedBullet.toLowerCase().includes(weakPhrase)) {
          const regex = new RegExp(`\\b${weakPhrase}\\b`, 'gi');
          updatedBullet = updatedBullet.replace(regex, actionVerbReplacements[weakPhrase]);
        }
      });

      // Inject top matching skill if natural
      if (expIdx === 0 && bulletIdx === 0 && topJobSkills.length > 0 && !updatedBullet.includes(topJobSkills[0])) {
        updatedBullet = `${updatedBullet.replace(/\.$/, '')} utilizing ${topJobSkills[0]} and best-practice workflows.`;
      }

      if (updatedBullet !== bullet) {
        changes.push({
          id: `change-exp-${expIdx}-${bulletIdx}`,
          type: 'REWRITTEN',
          section: `Experience (${exp.company})`,
          originalText: bullet,
          newText: updatedBullet,
          reason: 'Enhanced bullet action verb impact and integrated target job technical keywords.',
          status: 'pending',
        });
      }

      return updatedBullet;
    });

    return { ...exp, bullets: newBullets };
  });

  return {
    tailoredResume,
    changes,
  };
}

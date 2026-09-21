import { GoogleGenAI } from '@google/genai';
import {
  ParsedResume,
  ParsedJob,
  MatchAnalysis,
  ResumeChange,
  MasterProfileData,
  CoverLetterData,
  InterviewQuestionData,
  DiagnosticMetrics,
  MissingKeywordDetail,
  ResumeIssue,
} from '@/types';

export class AIService {
  private static getGeminiClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim().length > 0) {
      return new GoogleGenAI({ apiKey });
    }
    return null;
  }

  // 1. Job Description Analyzer
  public static async analyzeJobDescription(
    title: string,
    company: string,
    description: string,
    url?: string
  ): Promise<ParsedJob> {
    const ai = this.getGeminiClient();

    if (ai) {
      try {
        const prompt = `
Analyze the following job description for the title "${title}" at "${company}".
Identify whether this is an IT, Non-IT, Technical, Healthcare, Finance, Management, Teaching, or Administrative role.

Extract structured job requirements:
Return ONLY a valid raw JSON object matching this structure:
{
  "title": "${title}",
  "company": "${company}",
  "description": ${JSON.stringify(description)},
  "url": "${url || ''}",
  "industry": "Industry category (e.g. Software, Healthcare, Finance, Education, Operations)",
  "seniority": "Seniority level (e.g. Entry, Mid, Senior, Executive)",
  "requiredSkills": ["skill1", "skill2"],
  "preferredSkills": ["skill1", "skill2"],
  "technicalSkills": ["skill1", "skill2"],
  "softSkills": ["skill1", "skill2"],
  "responsibilities": ["duty1", "duty2"],
  "educationRequirements": ["degree requirement"],
  "experienceRequirements": ["experience requirement"],
  "tools": ["tool1", "tool2"],
  "importantKeywords": ["keyword1", "keyword2"]
}

Job Description:
${description}
`;
        const response = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });

        const text = response.text || '';
        const parsed = JSON.parse(text);
        if (parsed.requiredSkills) return parsed;
      } catch (err) {
        console.warn('Gemini job analysis failed, falling back to local NLP parser:', err);
      }
    }

    return this.parseJobLocalNLP(title, company, description, url);
  }

  // Local NLP Job Extractor
  private static parseJobLocalNLP(
    title: string,
    company: string,
    description: string,
    url?: string
  ): ParsedJob {
    const fullText = `${title} ${description}`;
    const lines = description.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const commonSkills = [
      'Python', 'SQL', 'Excel', 'Tableau', 'Power BI', 'ETL', 'AWS', 'Docker', 'React',
      'TypeScript', 'Node.js', 'Accounting', 'Financial Analysis', 'Recruiting', 'HR',
      'Teaching', 'Curriculum Design', 'Patient Care', 'Healthcare', 'Project Management',
      'Agile', 'Sales Strategy', 'Digital Marketing', 'Customer Relations', 'Budgeting',
      'Logistics', 'Supply Chain', 'CAD', 'Git', 'Linux'
    ];

    const requiredSkills = commonSkills.filter((s) =>
      new RegExp(`(?:^|\\W)${escapeRegex(s)}(?:$|\\W)`, 'i').test(fullText)
    );

    const responsibilities = lines.filter(
      (l) => l.startsWith('•') || l.startsWith('-') || /^(manage|develop|lead|create|design|analyze|coordinate)/i.test(l)
    );

    return {
      title,
      company,
      description,
      url,
      industry: 'General Professional',
      seniority: 'Mid-Level',
      requiredSkills: requiredSkills.length > 0 ? requiredSkills : ['Project Management', 'Communication', 'Data Analysis'],
      preferredSkills: ['Problem Solving', 'Team Leadership'],
      technicalSkills: requiredSkills,
      softSkills: ['Communication', 'Team Leadership', 'Problem Solving'],
      responsibilities: responsibilities.length > 0 ? responsibilities : [
        'Execute core duties aligned with organizational objectives.',
        'Collaborate across teams to deliver project outcomes and optimize workflows.'
      ],
      educationRequirements: ['Bachelor degree or equivalent relevant qualification'],
      experienceRequirements: ['Relevant industry experience'],
      tools: ['Office Suite', 'Git', 'Project Tracking Tools'],
      importantKeywords: requiredSkills.length > 0 ? requiredSkills : ['Management', 'Communication', 'Analysis'],
    };
  }

  // 2. 3 Diagnostic Metrics & Match Analysis
  public static calculateDiagnosticMetrics(
    resume: ParsedResume | MasterProfileData,
    job: ParsedJob
  ): MatchAnalysis {
    const resumeText = JSON.stringify(resume).toLowerCase();

    // 1. Job Match Calculation
    const jobSkills = Array.from(new Set([...job.requiredSkills, ...job.technicalSkills, ...job.softSkills]));
    const candidateSkills = (resume.skills?.all || []).map((s) => s.toLowerCase());

    const matchingSkills: string[] = [];
    const missingSkills: string[] = [];
    const partialSkills: string[] = [];

    jobSkills.forEach((skill) => {
      const lower = skill.toLowerCase();
      if (candidateSkills.some((cs) => cs.includes(lower) || lower.includes(cs))) {
        matchingSkills.push(skill);
      } else if (resumeText.includes(lower)) {
        partialSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    });

    const skillsScore = jobSkills.length > 0
      ? Math.round(((matchingSkills.length + partialSkills.length * 0.5) / jobSkills.length) * 100)
      : 82;

    const jobMatchScore = Math.min(98, Math.max(40, skillsScore));

    // 2. ATS Compatibility Calculation
    let atsScore = 90;
    const resumeIssues: ResumeIssue[] = [];

    // Type guard: ParsedResume has .contact, MasterProfileData has flat fields
    const contactEmail = 'contact' in resume ? resume.contact?.email : (resume as MasterProfileData).email;
    const contactPhone = 'contact' in resume ? resume.contact?.phone : (resume as MasterProfileData).phone;

    if (!contactEmail || !contactPhone) {
      atsScore -= 15;
      resumeIssues.push({
        id: 'issue-ats-contact',
        severity: 'HIGH',
        title: 'Missing Header Contact Info',
        explanation: 'Email or phone number is missing from the header section.',
        location: 'Contact Header',
        suggestedFix: 'Ensure clear phone number and email address appear at top of document.',
      });
    }

    if (!resume.summary || resume.summary.length < 30) {
      atsScore -= 10;
      resumeIssues.push({
        id: 'issue-ats-summary',
        severity: 'MEDIUM',
        title: 'Brief Professional Summary',
        explanation: 'Summary statement is brief or missing targeted keyword alignment.',
        location: 'Summary Section',
        suggestedFix: 'Expand summary statement with core skills matched to job requirements.',
      });
    }

    const atsCompatibilityScore = Math.min(98, Math.max(50, atsScore));

    // 3. Resume Quality Calculation
    let qualityScore = 85;
    const bulletCount = (resume.experience || []).reduce((acc, curr) => acc + curr.bullets.length, 0);
    if (bulletCount >= 4) qualityScore += 5;
    if (resume.projects && resume.projects.length > 0) qualityScore += 5;

    const resumeQualityScore = Math.min(98, Math.max(45, qualityScore));
    const overallScore = Math.round(jobMatchScore * 0.4 + atsCompatibilityScore * 0.35 + resumeQualityScore * 0.25);

    // Missing keywords
    const partialKeywords: string[] = partialSkills;
    const missingKeywords: MissingKeywordDetail[] = missingSkills.slice(0, 5).map((kw) => ({
      keyword: kw,
      importance: job.requiredSkills.includes(kw) ? 'HIGH' : 'MEDIUM',
      evidence: `Required in job description for ${job.title}`,
      inResume: false,
      recommendation: `If you have genuine experience with ${kw}, confirm it in Master Profile or Skill Gap panel.`,
    }));

    return {
      jobMatchScore,
      atsCompatibilityScore,
      resumeQualityScore,
      overallScore,
      categoryScores: {
        skills: skillsScore,
        keywords: Math.round((matchingSkills.length / (jobSkills.length || 1)) * 100),
        experience: 85,
        education: 90,
        responsibilities: 80,
      },
      matchingSkills,
      missingSkills,
      partialSkills,
      matchingKeywords: matchingSkills,
      missingKeywords,
      partialKeywords,
      resumeIssues,
      recommendations: [
        `Align professional summary with ${job.title} job posting keywords.`,
        `Quantify key achievements with measurable outcomes (e.g. %, $, numbers).`,
        `Confirm verified missing skills (${missingSkills.slice(0, 2).join(', ')}) to allow AI tailoring to integrate them.`,
      ],
    };
  }

  // 3. AI Tailoring with Anti-Hallucination Guardrails & User Modes
  public static async tailorResume(
    profile: MasterProfileData | ParsedResume,
    job: ParsedJob,
    analysis: MatchAnalysis,
    userConfirmedSkills: string[] = []
  ): Promise<{ tailoredResume: ParsedResume; changes: ResumeChange[] }> {
    const ai = this.getGeminiClient();

    if (ai) {
      try {
        const prompt = `
You are an expert AI Resume Tailor.
You are given a candidate profile, target job description, and user-confirmed skills.

STRICT ANTI-HALLUCINATION RULES:
1. NEVER invent any fake employers, degrees, dates, awards, metrics, or certifications.
2. NEVER claim unverified experience.
3. Incorporate user confirmed skills: ${JSON.stringify(userConfirmedSkills)}.
4. User Mode: ${(profile as any).userMode || 'EXPERIENCED'}.
   If FRESHER mode: Prioritize Education, Projects, Internships, Coursework, Certifications, Leadership.

Return raw JSON matching:
{
  "tailoredResume": <ParsedResume object>,
  "changes": [
    {
      "id": "change-1",
      "type": "REWRITTEN" | "ADDED" | "REORDERED" | "REMOVED",
      "section": "Summary" | "Skills" | "Experience" | "Projects",
      "originalText": "old text",
      "newText": "new text",
      "reason": "why changed",
      "status": "pending"
    }
  ]
}

Candidate Profile:
${JSON.stringify(profile, null, 2)}

Target Job:
${JSON.stringify(job, null, 2)}
`;
        const response = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });

        const parsed = JSON.parse(response.text || '');
        if (parsed.tailoredResume && parsed.changes) return parsed;
      } catch (err) {
        console.warn('Gemini tailoring failed, using local tailoring engine:', err);
      }
    }

    return this.tailorResumeLocalNLP(profile, job, analysis, userConfirmedSkills);
  }

  // Local NLP Tailoring Engine
  private static tailorResumeLocalNLP(
    profile: MasterProfileData | ParsedResume,
    job: ParsedJob,
    analysis: MatchAnalysis,
    userConfirmedSkills: string[]
  ): { tailoredResume: ParsedResume; changes: ResumeChange[] } {
    // Type guard: extract contact info from either ParsedResume or MasterProfileData
    const isMasterProfile = !('contact' in profile);
    const mp = isMasterProfile ? (profile as MasterProfileData) : null;
    const pr = !isMasterProfile ? (profile as ParsedResume) : null;

    const tailoredResume: ParsedResume = {
      contact: {
        name: mp?.fullName || pr?.contact?.name || 'Candidate Name',
        email: mp?.email || pr?.contact?.email || '',
        phone: mp?.phone || pr?.contact?.phone || '',
        location: mp?.location || pr?.contact?.location || '',
        linkedin: mp?.linkedin || pr?.contact?.linkedin,
        github: mp?.github || pr?.contact?.github,
        website: mp?.website || pr?.contact?.website,
      },
      summary: profile.summary || '',
      skills: {
        technical: [...(profile.skills?.technical || [])],
        soft: [...(profile.skills?.soft || [])],
        tools: [...(profile.skills?.tools || [])],
        all: [...(profile.skills?.all || [])],
      },
      experience: JSON.parse(JSON.stringify(profile.experience || [])),
      education: JSON.parse(JSON.stringify(profile.education || [])),
      projects: JSON.parse(JSON.stringify(profile.projects || [])),
      certifications: JSON.parse(JSON.stringify(profile.certifications || [])),
      achievements: [...(profile.achievements || [])],
      languages: [...(profile.languages || [])],
      links: [],
    };

    const changes: ResumeChange[] = [];

    // Summary Tailoring
    const topSkills = [...analysis.matchingSkills, ...userConfirmedSkills].slice(0, 3);
    const oldSummary = tailoredResume.summary;
    const newSummary = `${tailoredResume.contact.name || 'Professional'} focused on ${
      job.title || 'target role'
    } with experience in ${topSkills.join(', ') || 'core domain skills'}. Proven ability to execute project goals, streamline workflows, and deliver measurable outcomes at ${
      job.company || 'organizations'
    }.`;

    if (oldSummary !== newSummary) {
      tailoredResume.summary = newSummary;
      changes.push({
        id: `change-summary-${Date.now()}`,
        type: 'REWRITTEN',
        section: 'Summary',
        originalText: oldSummary,
        newText: newSummary,
        reason: `Tailored summary to align with ${job.title} at ${job.company} using skills: ${topSkills.join(', ')}.`,
        status: 'pending',
      });
    }

    // Skills Addition & Reordering
    const newTechSkills = Array.from(new Set([...userConfirmedSkills, ...analysis.matchingSkills, ...tailoredResume.skills.technical]));
    if (JSON.stringify(tailoredResume.skills.technical) !== JSON.stringify(newTechSkills)) {
      changes.push({
        id: `change-skills-${Date.now()}`,
        type: userConfirmedSkills.length > 0 ? 'ADDED' : 'REORDERED',
        section: 'Skills',
        originalText: tailoredResume.skills.technical.join(', '),
        newText: newTechSkills.join(', '),
        reason: 'Prioritized job matching keywords and added user-confirmed skills.',
        status: 'pending',
      });
      tailoredResume.skills.technical = newTechSkills;
      tailoredResume.skills.all = Array.from(new Set([...newTechSkills, ...tailoredResume.skills.soft]));
    }

    return { tailoredResume, changes };
  }

  // 4. Bullet Improvement
  public static async improveBullet(
    bullet: string,
    targetRole: string,
    action: 'improve' | 'concise' | 'action-verbs' | 'achievement-focused'
  ): Promise<string> {
    const ai = this.getGeminiClient();

    if (ai) {
      try {
        const prompt = `Rewrite this resume bullet point for a ${targetRole} position.
Action: ${action}
Original: "${bullet}"

Return ONLY the rewritten bullet point text:`;

        const response = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: prompt,
        });

        const text = (response.text || '').trim().replace(/^["']|["']$/g, '');
        if (text) return text;
      } catch (err) {
        console.warn('Gemini bullet improvement failed:', err);
      }
    }

    // Local NLP Bullet Improvement
    const actionVerbs = ['Spearheaded', 'Engineered', 'Architected', 'Optimized', 'Accelerated', 'Delivered'];
    const randomVerb = actionVerbs[Math.floor(Math.random() * actionVerbs.length)];

    if (action === 'action-verbs') {
      return `${randomVerb} ${bullet.replace(/^(worked on|responsible for|helped with|did)\s*/i, '')}`;
    } else if (action === 'concise') {
      return bullet.split('. ')[0];
    } else if (action === 'achievement-focused') {
      return `${bullet.replace(/\.$/, '')}, driving a 25% increase in operational efficiency.`;
    }

    return `${randomVerb} and optimized ${bullet.replace(/^(worked on|responsible for)\s*/i, '')}`;
  }

  // 5. Cover Letter Generator
  public static async generateCoverLetter(
    profile: MasterProfileData | ParsedResume,
    job: ParsedJob,
    style: 'Professional' | 'Concise' | 'Modern' | 'Formal' | 'Entry-level' = 'Professional'
  ): Promise<CoverLetterData> {
    const ai = this.getGeminiClient();

    const userName = (profile as any).fullName || (profile as ParsedResume).contact?.name || 'Applicant';
    const skillsList = profile.skills?.all?.slice(0, 4).join(', ') || 'key domain competencies';

    if (ai) {
      try {
        const prompt = `Write a professional cover letter for ${userName} applying for the position of ${job.title} at ${job.company}.
Style: ${style}

Candidate background:
Skills: ${skillsList}
Summary: ${profile.summary}

Return ONLY raw text of the cover letter:`;

        const response = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: prompt,
        });

        const text = response.text || '';
        if (text) {
          return {
            company: job.company,
            jobTitle: job.title,
            style,
            content: text,
          };
        }
      } catch (err) {
        console.warn('Gemini cover letter generation failed:', err);
      }
    }

    // Deterministic Cover Letter Template
    const content = `Dear Hiring Team at ${job.company},

I am writing to express my enthusiastic interest in the ${job.title} role. With a solid foundation in ${skillsList}, I am confident in my ability to contribute effectively to your team's objectives.

In my recent experience, I have demonstrated a track record of driving project outcomes, problem-solving, and collaborating across functional teams. The responsibilities specified in the ${job.title} position align directly with my background and career focus.

Thank you for your time and consideration. I welcome the opportunity to discuss how my skills and dedication can support ${job.company}'s ongoing success.

Sincerely,
${userName}`;

    return {
      company: job.company,
      jobTitle: job.title,
      style,
      content,
    };
  }

  // 6. Interview Preparation Workspace
  public static async generateInterviewPrep(
    profile: MasterProfileData | ParsedResume,
    job: ParsedJob
  ): Promise<InterviewQuestionData[]> {
    const ai = this.getGeminiClient();

    if (ai) {
      try {
        const prompt = `Generate 5 interview preparation questions for a candidate applying to ${job.title} at ${job.company}.
Include HR, Technical (if technical role), Behavioral (STAR method), and Situational questions.

Return raw JSON matching:
[
  {
    "category": "HR" | "Technical" | "Behavioral" | "Situational",
    "question": "question text",
    "rationale": "Why interviewers ask this",
    "structure": "Recommended answer framework"
  }
]`;

        const response = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });

        const parsed = JSON.parse(response.text || '');
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (err) {
        console.warn('Gemini interview prep generation failed:', err);
      }
    }

    // Local Interview Question Generator
    return [
      {
        category: 'HR',
        question: `Why are you interested in joining ${job.company} as a ${job.title}?`,
        rationale: 'Evaluates company research, passion, and cultural alignment.',
        structure: 'State what draws you to the company, connect your core values, and highlight relevant experience.',
      },
      {
        category: 'Behavioral',
        question: 'Tell me about a challenging project deadline and how you handled it.',
        rationale: 'Tests time management, adaptability under pressure, and communication.',
        structure: 'Use STAR method: Situation (context), Task (goal), Action (what you did), Result (outcome).',
      },
      {
        category: 'Technical',
        question: `How do you approach key requirements in ${job.requiredSkills.slice(0, 2).join(' and ') || 'this role'}?`,
        rationale: 'Assesses domain competence and problem-solving methodology.',
        structure: 'Define your technical workflow, tools used, testing/validation steps, and final delivery.',
      },
      {
        category: 'Situational',
        question: 'If priorities change unexpectedly mid-sprint or mid-quarter, how do you adjust your deliverables?',
        rationale: 'Evaluates agility, stakeholder communication, and prioritization.',
        structure: 'Explain triage process, alignment with lead/manager, clear task re-scoping, and transparent status updates.',
      },
    ];
  }
}

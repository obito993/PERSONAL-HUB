import { ParsedResume, ParsedJob, MatchAnalysis, ResumeIssue, MissingKeywordDetail } from '@/types';

export function parseJobDescriptionText(title: string, company: string, description: string, url?: string): ParsedJob {
  const fullText = `${title} ${description}`;
  const lines = description.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  const commonTech = [
    'Python', 'SQL', 'Excel', 'Tableau', 'Power BI', 'ETL', 'AWS', 'Docker', 'Kubernetes',
    'React', 'TypeScript', 'Next.js', 'Node.js', 'Java', 'C++', 'Go', 'Git', 'Linux',
    'PostgreSQL', 'MongoDB', 'Data Visualization', 'Machine Learning', 'Data Analysis', 'CI/CD', 'REST API'
  ];

  const commonSoft = [
    'Communication', 'Leadership', 'Problem Solving', 'Teamwork', 'Critical Thinking',
    'Project Management', 'Agile', 'Cross-functional Collaboration', 'Analytical Skills'
  ];

  const requiredSkills = commonTech.filter(tech => new RegExp(`\\b${tech}\\b`, 'i').test(fullText));
  const softSkills = commonSoft.filter(soft => new RegExp(`\\b${soft}\\b`, 'i').test(fullText));

  // If few skills detected, extract capitalized phrases/nouns
  const keywords = Array.from(new Set([
    ...requiredSkills,
    ...softSkills,
    ...lines.filter(l => l.length > 3 && l.length < 30 && !l.includes('.'))
  ])).slice(0, 15);

  const responsibilities = lines.filter(l => 
    l.startsWith('•') || l.startsWith('-') || /^(develop|manage|build|lead|create|design|analyze|optimize)/i.test(l)
  );

  return {
    title,
    company,
    description,
    url,
    requiredSkills: requiredSkills.length > 0 ? requiredSkills : ['SQL', 'Python', 'Data Analysis', 'Problem Solving'],
    preferredSkills: ['AWS', 'Docker', 'ETL', 'Tableau'],
    technicalSkills: requiredSkills,
    softSkills,
    responsibilities: responsibilities.length > 0 ? responsibilities : [
      'Design, build, and maintain scalable applications and data workflows.',
      'Collaborate with product and engineering teams to deliver core product features.',
      'Analyze system requirements and optimize performance and reliability.'
    ],
    educationRequirements: ['Bachelor degree in Computer Science, Data Science, Engineering, or related field'],
    experienceRequirements: ['2+ years of relevant industry experience'],
    tools: ['Git', 'VS Code', 'Jira', 'PostgreSQL'],
    importantKeywords: keywords.length > 0 ? keywords : ['Python', 'SQL', 'Data Analysis', 'Agile', 'REST API', 'Git'],
  };
}

export function calculateMatchAnalysis(resume: ParsedResume, job: ParsedJob): MatchAnalysis {
  const resumeText = JSON.stringify(resume).toLowerCase();
  
  // 1. Skill Score Calculation
  const jobSkills = Array.from(new Set([...job.requiredSkills, ...job.technicalSkills, ...job.softSkills]));
  const candidateSkills = resume.skills.all.map(s => s.toLowerCase());

  let matchingSkills: string[] = [];
  let missingSkills: string[] = [];
  let partialSkills: string[] = [];

  jobSkills.forEach(skill => {
    const lowerSkill = skill.toLowerCase();
    if (candidateSkills.some(cs => cs.includes(lowerSkill) || lowerSkill.includes(cs))) {
      matchingSkills.push(skill);
    } else if (resumeText.includes(lowerSkill)) {
      partialSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  const skillsScore = jobSkills.length > 0 
    ? Math.round(((matchingSkills.length + partialSkills.length * 0.5) / jobSkills.length) * 100)
    : 85;

  // 2. Keyword Score Calculation
  const jobKeywords = job.importantKeywords;
  let matchingKeywords: string[] = [];
  let missingKeywordsDetails: MissingKeywordDetail[] = [];
  let partialKeywords: string[] = [];

  jobKeywords.forEach(keyword => {
    const lowerKw = keyword.toLowerCase();
    if (resumeText.includes(lowerKw)) {
      matchingKeywords.push(keyword);
    } else {
      // Find evidence in job description
      const sentence = job.description.split('.').find(s => s.toLowerCase().includes(lowerKw)) || `Requires experience with ${keyword}`;
      missingKeywordsDetails.push({
        keyword,
        importance: job.requiredSkills.includes(keyword) ? 'HIGH' : 'MEDIUM',
        evidence: sentence.trim(),
        inResume: false,
        recommendation: `If you have experience with ${keyword}, incorporate it into your work experience bullet points or skills section.`
      });
    }
  });

  const keywordScore = jobKeywords.length > 0
    ? Math.round((matchingKeywords.length / jobKeywords.length) * 100)
    : 80;

  // 3. Experience Score Calculation
  const hasExp = resume.experience && resume.experience.length > 0;
  const bulletCount = resume.experience.reduce((acc, curr) => acc + curr.bullets.length, 0);
  const actionVerbMatches = (resumeText.match(/\b(developed|engineered|implemented|architected|built|optimized|spearheaded|led|created|analyzed|managed)\b/g) || []).length;
  
  let experienceScore = 70;
  if (hasExp) experienceScore += 15;
  if (bulletCount >= 4) experienceScore += 10;
  if (actionVerbMatches >= 3) experienceScore += 5;
  experienceScore = Math.min(100, experienceScore);

  // 4. Education Score Calculation
  let educationScore = 85;
  if (resume.education && resume.education.length > 0) {
    educationScore = 100;
  }

  // 5. Responsibilities Score Calculation
  let responsibilitiesScore = 75;
  if (matchingSkills.length > 2 && actionVerbMatches > 2) {
    responsibilitiesScore = 88;
  }

  // Weighted overall calculation
  const overallScore = Math.min(
    98,
    Math.max(
      35,
      Math.round(
        skillsScore * 0.30 +
        keywordScore * 0.25 +
        experienceScore * 0.20 +
        responsibilitiesScore * 0.15 +
        educationScore * 0.10
      )
    )
  );

  // Issue / Mistake Detection
  const resumeIssues: ResumeIssue[] = [];

  // Summary check
  if (!resume.summary || resume.summary.length < 50) {
    resumeIssues.push({
      id: 'issue-summary-weak',
      severity: 'HIGH',
      title: 'Weak Professional Summary',
      explanation: 'Your professional summary is brief or missing key technical skills matched to the target position.',
      location: 'Summary Section',
      suggestedFix: `Emphasize key competencies like ${matchingSkills.slice(0, 3).join(', ') || 'core technical skills'} and relevant domain accomplishments.`
    });
  }

  // Contact info check
  if (!resume.contact.phone || !resume.contact.email) {
    resumeIssues.push({
      id: 'issue-contact-missing',
      severity: 'HIGH',
      title: 'Missing Contact Details',
      explanation: 'Essential contact information (email or phone number) is missing or incompletely parsed.',
      location: 'Header / Contact',
      suggestedFix: 'Ensure your phone number and email address are clearly visible at the top of your resume.'
    });
  }

  // Quantifiable metrics check
  const hasMetrics = resume.experience.some(exp => 
    exp.bullets.some(b => /\b(\d+%|\$\d+|\d+\+|\d+x)\b/.test(b))
  );

  if (!hasMetrics) {
    resumeIssues.push({
      id: 'issue-metrics-missing',
      severity: 'HIGH',
      title: 'Missing Quantifiable Achievements',
      explanation: 'Your experience bullet points lack measurable metrics, numbers, percentages, or impact metrics.',
      location: 'Experience Bullet Points',
      suggestedFix: 'Add specific metrics (e.g., "Improved system performance by 35%", "Managed $50k budget", "Reduced load latency by 200ms").'
    });
  }

  // Weak action verb check
  const hasWeakVerbs = resumeText.includes('responsible for') || resumeText.includes('worked on') || resumeText.includes('helped with');
  if (hasWeakVerbs) {
    resumeIssues.push({
      id: 'issue-weak-verbs',
      severity: 'MEDIUM',
      title: 'Weak Action Verbs Detected',
      explanation: 'Phrases like "responsible for" or "worked on" reduce the perceived impact of your accomplishments.',
      location: 'Experience Section',
      suggestedFix: 'Replace passive phrases with strong action verbs like "Spearheaded", "Engineered", "Architected", or "Optimized".'
    });
  }

  // Missing high priority keywords
  if (missingKeywordsDetails.some(k => k.importance === 'HIGH')) {
    const highMissing = missingKeywordsDetails.filter(k => k.importance === 'HIGH').map(k => k.keyword);
    resumeIssues.push({
      id: 'issue-missing-high-keywords',
      severity: 'HIGH',
      title: 'Critical Missing Job Keywords',
      explanation: `Your resume is missing high-priority target skills: ${highMissing.join(', ')}.`,
      location: 'Skills & Experience',
      suggestedFix: `If you have hands-on experience with ${highMissing[0]}, confirm it in the Skill Gap section so AI can integrate it into your resume.`
    });
  }

  // Formatting & Date consistency
  resumeIssues.push({
    id: 'issue-formatting-consistency',
    severity: 'LOW',
    title: 'Date Format Standard',
    explanation: 'Ensure month and year formatting is consistent across all employment entries (e.g. "Jan 2022 – Present").',
    location: 'Experience Entries',
    suggestedFix: 'Standardize date syntax across all work history entries.'
  });

  const recommendations = [
    `Highlight your top matching skills (${matchingSkills.slice(0, 3).join(', ')}) in your summary statement.`,
    `Address missing keywords (${missingKeywordsDetails.slice(0, 2).map(k => k.keyword).join(', ')}) if you possess verified experience.`,
    `Quantify at least two major bullet points with concrete percentages or performance outcomes.`,
    `Use our AI Tailor tool to automatically align bullet points with job requirements without inventing experience.`
  ];

  return {
    overallScore,
    categoryScores: {
      skills: skillsScore,
      keywords: keywordScore,
      experience: experienceScore,
      education: educationScore,
      responsibilities: responsibilitiesScore,
    },
    matchingSkills,
    missingSkills,
    partialSkills,
    matchingKeywords,
    missingKeywords: missingKeywordsDetails,
    partialKeywords,
    resumeIssues,
    recommendations,
  };
}

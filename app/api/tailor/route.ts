import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { generateTailoredResume } from '@/lib/ai/tailoring-engine';
import { ParsedResume, ParsedJob, MatchAnalysis } from '@/types';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { analysisId } = await req.json();

    if (!analysisId) {
      return NextResponse.json({ error: 'analysisId is required.' }, { status: 400 });
    }

    const analysisRecord = await db.resumeAnalysis.findFirst({
      where: { id: analysisId, userId: user.id },
      include: {
        resume: true,
        jobDescription: true,
      },
    });

    if (!analysisRecord) {
      return NextResponse.json({ error: 'Analysis record not found.' }, { status: 404 });
    }

    const originalResume: ParsedResume = JSON.parse(analysisRecord.resume.structuredData);
    const job: ParsedJob = JSON.parse(analysisRecord.jobDescription.structuredData);
    
    const analysis: MatchAnalysis = {
      overallScore: analysisRecord.overallScore,
      jobMatchScore: analysisRecord.jobMatchScore,
      atsCompatibilityScore: analysisRecord.atsCompatibilityScore,
      resumeQualityScore: analysisRecord.resumeQualityScore,
      categoryScores: JSON.parse(analysisRecord.categoryScores),
      matchingSkills: JSON.parse(analysisRecord.matchingSkills),
      missingSkills: JSON.parse(analysisRecord.missingSkills),
      partialSkills: JSON.parse(analysisRecord.partialSkills),
      matchingKeywords: JSON.parse(analysisRecord.matchingKeywords),
      missingKeywords: JSON.parse(analysisRecord.missingKeywords),
      partialKeywords: JSON.parse(analysisRecord.partialKeywords),
      resumeIssues: JSON.parse(analysisRecord.resumeIssues),
      recommendations: JSON.parse(analysisRecord.recommendations),
    };

    const userConfirmedSkills: string[] = analysisRecord.userConfirmedSkills
      ? JSON.parse(analysisRecord.userConfirmedSkills)
      : [];

    const { tailoredResume, changes } = await generateTailoredResume(
      originalResume,
      job,
      analysis,
      userConfirmedSkills
    );

    const tailoredRecord = await db.tailoredResume.create({
      data: {
        userId: user.id,
        analysisId: analysisRecord.id,
        resumeId: analysisRecord.resumeId,
        content: JSON.stringify(tailoredResume),
        changes: JSON.stringify(changes),
        template: 'classic',
        version: 1,
      },
    });

    return NextResponse.json({
      tailoredResumeId: tailoredRecord.id,
      tailoredResume: {
        id: tailoredRecord.id,
        analysisId: tailoredRecord.analysisId,
        content: tailoredResume,
        changes,
        template: tailoredRecord.template,
        version: tailoredRecord.version,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error generating tailored resume:', error);
    return NextResponse.json({ error: 'Failed to tailor resume.' }, { status: 500 });
  }
}

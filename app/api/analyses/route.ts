import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { calculateMatchAnalysis } from '@/lib/ai/matching-engine';
import { ParsedResume, ParsedJob } from '@/types';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { resumeId, jobDescriptionId } = await req.json();

    if (!resumeId || !jobDescriptionId) {
      return NextResponse.json({ error: 'Both resumeId and jobDescriptionId are required.' }, { status: 400 });
    }

    const resumeRecord = await db.resume.findFirst({
      where: { id: resumeId, userId: user.id },
    });

    const jobRecord = await db.jobDescription.findFirst({
      where: { id: jobDescriptionId, userId: user.id },
    });

    if (!resumeRecord || !jobRecord) {
      return NextResponse.json({ error: 'Resume or Job Description not found.' }, { status: 404 });
    }

    const parsedResume: ParsedResume = JSON.parse(resumeRecord.structuredData);
    const parsedJob: ParsedJob = JSON.parse(jobRecord.structuredData);

    // Calculate match analysis
    const analysisResult = calculateMatchAnalysis(parsedResume, parsedJob);

    const analysis = await db.resumeAnalysis.create({
      data: {
        userId: user.id,
        resumeId: resumeRecord.id,
        jobDescriptionId: jobRecord.id,
        overallScore: analysisResult.overallScore,
        categoryScores: JSON.stringify(analysisResult.categoryScores),
        matchingSkills: JSON.stringify(analysisResult.matchingSkills),
        missingSkills: JSON.stringify(analysisResult.missingSkills),
        partialSkills: JSON.stringify(analysisResult.partialSkills),
        matchingKeywords: JSON.stringify(analysisResult.matchingKeywords),
        missingKeywords: JSON.stringify(analysisResult.missingKeywords),
        partialKeywords: JSON.stringify(analysisResult.partialKeywords),
        resumeIssues: JSON.stringify(analysisResult.resumeIssues),
        recommendations: JSON.stringify(analysisResult.recommendations),
      },
    });

    return NextResponse.json({
      analysisId: analysis.id,
      analysis: {
        ...analysisResult,
        id: analysis.id,
        resume: resumeRecord,
        job: jobRecord,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating resume analysis:', error);
    return NextResponse.json({ error: 'Failed to analyze resume against job description.' }, { status: 500 });
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const analyses = await db.resumeAnalysis.findMany({
    where: { userId: user.id },
    include: {
      resume: true,
      jobDescription: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ analyses });
}

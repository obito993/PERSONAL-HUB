import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const analysis = await db.resumeAnalysis.findFirst({
    where: { id, userId: user.id },
    include: {
      resume: true,
      jobDescription: true,
    },
  });

  if (!analysis) return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });

  return NextResponse.json({
    analysis: {
      id: analysis.id,
      resumeId: analysis.resumeId,
      jobDescriptionId: analysis.jobDescriptionId,
      overallScore: analysis.overallScore,
      categoryScores: JSON.parse(analysis.categoryScores),
      matchingSkills: JSON.parse(analysis.matchingSkills),
      missingSkills: JSON.parse(analysis.missingSkills),
      partialSkills: JSON.parse(analysis.partialSkills),
      matchingKeywords: JSON.parse(analysis.matchingKeywords),
      missingKeywords: JSON.parse(analysis.missingKeywords),
      partialKeywords: JSON.parse(analysis.partialKeywords),
      resumeIssues: JSON.parse(analysis.resumeIssues),
      recommendations: JSON.parse(analysis.recommendations),
      userConfirmedSkills: analysis.userConfirmedSkills ? JSON.parse(analysis.userConfirmedSkills) : [],
      createdAt: analysis.createdAt,
      resume: {
        ...analysis.resume,
        structuredData: JSON.parse(analysis.resume.structuredData),
      },
      job: {
        ...analysis.jobDescription,
        structuredData: JSON.parse(analysis.jobDescription.structuredData),
      },
    },
  });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { userConfirmedSkills } = await req.json();

  const updated = await db.resumeAnalysis.updateMany({
    where: { id, userId: user.id },
    data: {
      userConfirmedSkills: JSON.stringify(userConfirmedSkills || []),
    },
  });

  return NextResponse.json({ success: true, updatedCount: updated.count });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  await db.resumeAnalysis.deleteMany({
    where: { id, userId: user.id },
  });

  return NextResponse.json({ success: true });
}

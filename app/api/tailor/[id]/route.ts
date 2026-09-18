import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const record = await db.tailoredResume.findFirst({
    where: { id, userId: user.id },
    include: {
      analysis: {
        include: {
          jobDescription: true,
          resume: true,
        },
      },
    },
  });

  if (!record) return NextResponse.json({ error: 'Tailored resume not found' }, { status: 404 });

  return NextResponse.json({
    tailoredResume: {
      id: record.id,
      analysisId: record.analysisId,
      resumeId: record.resumeId,
      content: JSON.parse(record.content),
      changes: JSON.parse(record.changes),
      template: record.template,
      version: record.version,
      originalResume: JSON.parse(record.analysis.resume.structuredData),
      job: JSON.parse(record.analysis.jobDescription.structuredData),
    },
  });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { content, changes, template } = await req.json();

  const existing = await db.tailoredResume.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) return NextResponse.json({ error: 'Tailored resume not found' }, { status: 404 });

  // Create snapshot version history
  if (content && JSON.stringify(content) !== existing.content) {
    await db.resumeVersion.create({
      data: {
        tailoredResumeId: existing.id,
        version: existing.version,
        content: existing.content,
        changes: existing.changes,
      },
    });
  }

  const updated = await db.tailoredResume.update({
    where: { id },
    data: {
      content: content ? JSON.stringify(content) : existing.content,
      changes: changes ? JSON.stringify(changes) : existing.changes,
      template: template || existing.template,
      version: content ? existing.version + 1 : existing.version,
    },
  });

  return NextResponse.json({
    tailoredResume: {
      id: updated.id,
      content: JSON.parse(updated.content),
      changes: JSON.parse(updated.changes),
      template: updated.template,
      version: updated.version,
    },
  });
}

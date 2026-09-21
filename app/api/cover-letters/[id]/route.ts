import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const coverLetter = await db.coverLetter.findFirst({
    where: { id, userId: user.id },
    include: { jobDescription: true },
  });

  if (!coverLetter) return NextResponse.json({ error: 'Cover letter not found' }, { status: 404 });

  return NextResponse.json({ coverLetter });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { content, style } = await req.json();

  const updated = await db.coverLetter.updateMany({
    where: { id, userId: user.id },
    data: {
      content,
      style,
    },
  });

  return NextResponse.json({ success: true, updatedCount: updated.count });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  await db.coverLetter.deleteMany({
    where: { id, userId: user.id },
  });

  return NextResponse.json({ success: true });
}

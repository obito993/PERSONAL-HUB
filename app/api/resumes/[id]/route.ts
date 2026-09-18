import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const resume = await db.resume.findFirst({
    where: { id, userId: user.id },
  });

  if (!resume) return NextResponse.json({ error: 'Resume not found' }, { status: 404 });

  return NextResponse.json({
    resume: {
      ...resume,
      structuredData: JSON.parse(resume.structuredData),
    },
  });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { name, structuredData } = await req.json();

  const existing = await db.resume.findFirst({ where: { id, userId: user.id } });
  if (!existing) return NextResponse.json({ error: 'Resume not found' }, { status: 404 });

  const updated = await db.resume.update({
    where: { id },
    data: {
      name: name || existing.name,
      structuredData: structuredData ? JSON.stringify(structuredData) : existing.structuredData,
    },
  });

  return NextResponse.json({
    resume: {
      ...updated,
      structuredData: JSON.parse(updated.structuredData),
    },
  });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  await db.resume.deleteMany({
    where: { id, userId: user.id },
  });

  return NextResponse.json({ success: true });
}

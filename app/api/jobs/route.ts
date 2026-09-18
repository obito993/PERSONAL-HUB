import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { parseJobDescriptionText } from '@/lib/ai/matching-engine';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { title, company, description, url } = await req.json();

    if (!title || !company || !description) {
      return NextResponse.json({ error: 'Job title, company, and description are required.' }, { status: 400 });
    }

    const structuredData = parseJobDescriptionText(title, company, description, url);

    const job = await db.jobDescription.create({
      data: {
        userId: user.id,
        title,
        company,
        description,
        url,
        structuredData: JSON.stringify(structuredData),
      },
    });

    return NextResponse.json({
      job: {
        ...job,
        structuredData,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating job description:', error);
    return NextResponse.json({ error: 'Failed to save job description.' }, { status: 500 });
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const jobs = await db.jobDescription.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({
    jobs: jobs.map(j => ({ ...j, structuredData: JSON.parse(j.structuredData) }))
  });
}

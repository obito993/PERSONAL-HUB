import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const applications = await db.jobApplication.findMany({
    where: { userId: user.id },
    include: {
      jobDescription: true,
      tailoredResume: true,
      coverLetter: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json({ applications });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const {
      company,
      jobTitle,
      location,
      jobUrl,
      salary,
      status = 'APPLIED',
      jobDescriptionId,
      tailoredResumeId,
      coverLetterId,
      notes,
      recruiter,
    } = await req.json();

    if (!company || !jobTitle) {
      return NextResponse.json({ error: 'Company and jobTitle are required' }, { status: 400 });
    }

    const application = await db.jobApplication.create({
      data: {
        userId: user.id,
        company,
        jobTitle,
        location,
        jobUrl,
        salary,
        status,
        jobDescriptionId,
        tailoredResumeId,
        coverLetterId,
        notes,
        recruiter,
      },
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    console.error('Error creating job application:', error);
    return NextResponse.json({ error: 'Failed to create job application' }, { status: 500 });
  }
}

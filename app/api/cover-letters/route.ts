import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { AIService } from '@/lib/ai/ai-service';
import { ParsedJob, MasterProfileData, ParsedResume } from '@/types';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const coverLetters = await db.coverLetter.findMany({
    where: { userId: user.id },
    include: { jobDescription: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ coverLetters });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { jobDescriptionId, style = 'Professional' } = await req.json();

    if (!jobDescriptionId) {
      return NextResponse.json({ error: 'jobDescriptionId is required' }, { status: 400 });
    }

    const jobRecord = await db.jobDescription.findFirst({
      where: { id: jobDescriptionId, userId: user.id },
    });

    if (!jobRecord) {
      return NextResponse.json({ error: 'Job posting not found' }, { status: 404 });
    }

    // Try fetching Master Profile first
    const profileRecord = await db.masterProfile.findUnique({
      where: { userId: user.id },
    });

    let profileData: MasterProfileData | ParsedResume;

    if (profileRecord) {
      profileData = {
        fullName: profileRecord.fullName,
        email: profileRecord.email,
        phone: profileRecord.phone,
        location: profileRecord.location,
        targetTitle: profileRecord.targetTitle,
        userMode: profileRecord.userMode as any,
        yearsOfExp: profileRecord.yearsOfExp,
        summary: profileRecord.summary,
        experience: profileRecord.experience ? JSON.parse(profileRecord.experience) : [],
        education: profileRecord.education ? JSON.parse(profileRecord.education) : [],
        projects: profileRecord.projects ? JSON.parse(profileRecord.projects) : [],
        skills: profileRecord.skills ? JSON.parse(profileRecord.skills) : { technical: [], soft: [], tools: [], all: [] },
        certifications: profileRecord.certifications ? JSON.parse(profileRecord.certifications) : [],
        awards: [],
        achievements: [],
        volunteer: [],
        leadership: [],
        publications: [],
        languages: ['English'],
        interests: [],
      };
    } else {
      // Fallback to latest uploaded resume
      const latestResume = await db.resume.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      });

      profileData = latestResume
        ? JSON.parse(latestResume.structuredData)
        : {
            contact: { name: user.name || 'Candidate', email: user.email, phone: '', location: '' },
            summary: 'Motivated professional.',
            skills: { technical: ['Management'], soft: [], tools: [], all: ['Management'] },
            experience: [],
            education: [],
            projects: [],
            certifications: [],
            achievements: [],
            languages: ['English'],
            links: [],
          };
    }

    const job: ParsedJob = JSON.parse(jobRecord.structuredData);

    const generated = await AIService.generateCoverLetter(profileData, job, style as any);

    const coverLetter = await db.coverLetter.create({
      data: {
        userId: user.id,
        jobDescriptionId: jobRecord.id,
        company: job.company,
        jobTitle: job.title,
        style,
        content: generated.content,
      },
    });

    return NextResponse.json({ coverLetter }, { status: 201 });
  } catch (error) {
    console.error('Error generating cover letter:', error);
    return NextResponse.json({ error: 'Failed to generate cover letter' }, { status: 500 });
  }
}

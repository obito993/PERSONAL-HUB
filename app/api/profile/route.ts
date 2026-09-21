import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { MasterProfileData } from '@/types';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let profile = await db.masterProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    // Create default master profile for user
    profile = await db.masterProfile.create({
      data: {
        userId: user.id,
        fullName: user.name || 'Candidate Name',
        email: user.email,
        phone: '',
        location: 'Remote / Available',
        targetTitle: 'Professional Specialist',
        userMode: 'EXPERIENCED',
        yearsOfExp: 2,
        summary: 'Driven professional committed to achieving measurable organizational goals.',
        experience: JSON.stringify([]),
        education: JSON.stringify([]),
        projects: JSON.stringify([]),
        skills: JSON.stringify({ technical: [], soft: [], tools: [], all: [] }),
        certifications: JSON.stringify([]),
        awards: JSON.stringify([]),
        achievements: JSON.stringify([]),
        volunteer: JSON.stringify([]),
        leadership: JSON.stringify([]),
        publications: JSON.stringify([]),
        languages: JSON.stringify(['English']),
        interests: JSON.stringify([]),
      },
    });
  }

  const parsedProfile: MasterProfileData = {
    id: profile.id,
    userId: profile.userId,
    fullName: profile.fullName,
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
    linkedin: profile.linkedin || undefined,
    github: profile.github || undefined,
    website: profile.website || undefined,
    targetTitle: profile.targetTitle,
    userMode: (profile.userMode as any) || 'EXPERIENCED',
    industry: profile.industry || undefined,
    yearsOfExp: profile.yearsOfExp,
    summary: profile.summary,
    experience: profile.experience ? JSON.parse(profile.experience) : [],
    education: profile.education ? JSON.parse(profile.education) : [],
    projects: profile.projects ? JSON.parse(profile.projects) : [],
    skills: profile.skills ? JSON.parse(profile.skills) : { technical: [], soft: [], tools: [], all: [] },
    certifications: profile.certifications ? JSON.parse(profile.certifications) : [],
    awards: profile.awards ? JSON.parse(profile.awards) : [],
    achievements: profile.achievements ? JSON.parse(profile.achievements) : [],
    volunteer: profile.volunteer ? JSON.parse(profile.volunteer) : [],
    leadership: profile.leadership ? JSON.parse(profile.leadership) : [],
    publications: profile.publications ? JSON.parse(profile.publications) : [],
    languages: profile.languages ? JSON.parse(profile.languages) : ['English'],
    interests: profile.interests ? JSON.parse(profile.interests) : [],
  };

  return NextResponse.json({ profile: parsedProfile });
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data: MasterProfileData = await req.json();

  const updated = await db.masterProfile.upsert({
    where: { userId: user.id },
    update: {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      location: data.location,
      linkedin: data.linkedin,
      github: data.github,
      website: data.website,
      targetTitle: data.targetTitle,
      userMode: data.userMode || 'EXPERIENCED',
      industry: data.industry,
      yearsOfExp: data.yearsOfExp || 0,
      summary: data.summary,
      experience: JSON.stringify(data.experience || []),
      education: JSON.stringify(data.education || []),
      projects: JSON.stringify(data.projects || []),
      skills: JSON.stringify(data.skills || { technical: [], soft: [], tools: [], all: [] }),
      certifications: JSON.stringify(data.certifications || []),
      awards: JSON.stringify(data.awards || []),
      achievements: JSON.stringify(data.achievements || []),
      volunteer: JSON.stringify(data.volunteer || []),
      leadership: JSON.stringify(data.leadership || []),
      publications: JSON.stringify(data.publications || []),
      languages: JSON.stringify(data.languages || []),
      interests: JSON.stringify(data.interests || []),
    },
    create: {
      userId: user.id,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      location: data.location,
      linkedin: data.linkedin,
      github: data.github,
      website: data.website,
      targetTitle: data.targetTitle,
      userMode: data.userMode || 'EXPERIENCED',
      industry: data.industry,
      yearsOfExp: data.yearsOfExp || 0,
      summary: data.summary,
      experience: JSON.stringify(data.experience || []),
      education: JSON.stringify(data.education || []),
      projects: JSON.stringify(data.projects || []),
      skills: JSON.stringify(data.skills || { technical: [], soft: [], tools: [], all: [] }),
      certifications: JSON.stringify(data.certifications || []),
      awards: JSON.stringify(data.awards || []),
      achievements: JSON.stringify(data.achievements || []),
      volunteer: JSON.stringify(data.volunteer || []),
      leadership: JSON.stringify(data.leadership || []),
      publications: JSON.stringify(data.publications || []),
      languages: JSON.stringify(data.languages || []),
      interests: JSON.stringify(data.interests || []),
    },
  });

  return NextResponse.json({ success: true, profile: updated });
}

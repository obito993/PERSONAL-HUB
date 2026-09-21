import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ applications: [] });
    }

    const apps = await prisma.careerApplication.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ applications: apps });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ applications: [] });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { company, role, location, status, salary, jobUrl, recruiter, notes, interviewDate } = body;

    const newApp = await prisma.careerApplication.create({
      data: {
        userId: session.userId,
        company: company || 'Company',
        role: role || 'Role',
        location: location || 'Remote',
        status: status || 'APPLIED',
        salary: salary || '',
        jobUrl: jobUrl || '',
        recruiter: recruiter || '',
        notes: notes || '',
        interviewDate: interviewDate ? new Date(interviewDate) : null,
      },
    });

    return NextResponse.json({ success: true, application: newApp });
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, company, role, location, salary, notes } = body;

    const updated = await prisma.careerApplication.update({
      where: { id, userId: session.userId },
      data: {
        ...(status && { status }),
        ...(company && { company }),
        ...(role && { role }),
        ...(location && { location }),
        ...(salary && { salary }),
        ...(notes && { notes }),
      },
    });

    return NextResponse.json({ success: true, application: updated });
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing application id' }, { status: 400 });
    }

    await prisma.careerApplication.delete({
      where: { id, userId: session.userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting application:', error);
    return NextResponse.json({ error: 'Failed to delete application' }, { status: 500 });
  }
}

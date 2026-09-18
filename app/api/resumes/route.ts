import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { parseDocumentFile, parseRawTextToStructuredResume } from '@/lib/parsers/document-parser';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const resumes = await db.resume.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ resumes });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const customName = formData.get('name') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No resume file provided' }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const extractedText = await parseDocumentFile(fileBuffer, file.name, file.type);

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json({ error: 'Unable to extract text content from document.' }, { status: 422 });
    }

    const structuredData = parseRawTextToStructuredResume(extractedText);
    const resumeName = customName || file.name.replace(/\.[^/.]+$/, '');

    const resume = await db.resume.create({
      data: {
        userId: user.id,
        name: resumeName,
        originalFile: file.name,
        extractedText,
        structuredData: JSON.stringify(structuredData),
      },
    });

    return NextResponse.json({
      resume: {
        ...resume,
        structuredData,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating resume:', error);
    const errorMessage = error?.message || 'Failed to process and upload resume.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

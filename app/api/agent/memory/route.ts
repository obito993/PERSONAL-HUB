import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { AgentMemoryService } from '@/lib/agent/memory-service';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;

    const memories = await AgentMemoryService.getMemories(session.userId, category);
    return NextResponse.json({ memories });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch memories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const body = await req.json();
    const { category, content, importance } = body;

    if (!content) {
      return NextResponse.json({ error: 'Memory content is required' }, { status: 400 });
    }

    const memory = await AgentMemoryService.saveMemory(
      session.userId,
      category || 'fact',
      content,
      'manual_input',
      importance || 1
    );

    return NextResponse.json({ memory });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save memory' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Memory ID required' }, { status: 400 });
    }

    await AgentMemoryService.deleteMemory(session.userId, id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete memory' }, { status: 500 });
  }
}

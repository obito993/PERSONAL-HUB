import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuthSession } from '@/lib/auth';
import { AIRouter } from '@/lib/ai/router';
import { generateAIStructured } from '@/lib/ai/service';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    const userId = session?.userId;

    const { action, prompt, mode, conversationId, context, providerOverride } = await req.json();

    if (!prompt && action !== 'quiz' && action !== 'flashcards') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // 1. Structured Quiz Action
    if (action === 'quiz') {
      try {
        const quizData = await generateAIStructured<{
          title: string;
          questions: Array<{
            question: string;
            options: string[];
            correctAnswer: number;
            explanation: string;
          }>;
        }>(
          `Generate 4 multiple-choice quiz questions based on this study content:\n\n${prompt}`,
          'STUDY',
          context
        );

        if (userId) {
          await prisma.quiz.create({
            data: {
              userId,
              title: quizData.title || `Quiz: ${prompt.slice(0, 30)}`,
              questionsJson: JSON.stringify(quizData.questions),
            }
          });
        }
        return NextResponse.json({ success: true, data: quizData });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[AI ROUTER] Quiz generation failed:', msg);
        return NextResponse.json({ error: msg }, { status: 500 });
      }
    }

    // 2. Structured Flashcards Action
    if (action === 'flashcards') {
      try {
        const flashcardData = await generateAIStructured<{
          flashcards: Array<{ question: string; answer: string; difficulty?: string }>;
        }>(
          `Generate 5 revision flashcards from this text:\n\n${prompt}`,
          'STUDY',
          context
        );

        if (userId) {
          for (const card of (flashcardData.flashcards || [])) {
            await prisma.flashcard.create({
              data: { userId, question: card.question, answer: card.answer }
            });
          }
        }
        return NextResponse.json({ success: true, cards: flashcardData.flashcards });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[AI ROUTER] Flashcard generation failed:', msg);
        return NextResponse.json({ error: msg }, { status: 500 });
      }
    }

    // 3. Conversational AI via AIRouter
    let convId = conversationId;
    let history: { role: 'user' | 'assistant'; content: string }[] = [];

    // DB Isolation: Only fetch history owned by current authenticated user
    try {
      if (userId && convId) {
        const existingMsgs = await prisma.aiMessage.findMany({
          where: { 
            conversationId: convId,
            conversation: { userId }
          },
          orderBy: { createdAt: 'asc' },
          take: 10
        });
        history = existingMsgs.map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content
        }));
      } else if (userId && !convId) {
        const newConv = await prisma.aiConversation.create({
          data: {
            userId,
            title: prompt.slice(0, 30),
            mode: mode || 'GENERAL'
          }
        });
        convId = newConv.id;
      }

      if (userId && convId) {
        await prisma.aiMessage.create({
          data: { conversationId: convId, role: 'user', content: prompt }
        });
      }
    } catch (dbErr) {
      console.warn('[AI ROUTER] DB non-fatal warning:', dbErr instanceof Error ? dbErr.message : dbErr);
    }

    // Pass through AIRouter priority cascade (OLLAMA -> GEMINI -> GROQ)
    const aiResponse = await AIRouter.generateText({
      prompt,
      mode: mode || 'GENERAL',
      history,
      context,
      providerOverride
    });

    // Save AI response if user authenticated
    try {
      if (userId && convId) {
        await prisma.aiMessage.create({
          data: { conversationId: convId, role: 'model', content: aiResponse.result }
        });
      }
    } catch (dbErr) {
      console.warn('[AI ROUTER] DB save non-fatal warning:', dbErr instanceof Error ? dbErr.message : dbErr);
    }

    return NextResponse.json({
      success: true,
      result: aiResponse.result,
      provider: aiResponse.provider,
      model: aiResponse.model,
      fallbackOccurred: aiResponse.fallbackOccurred,
      fallbackChain: aiResponse.fallbackChain,
      conversationId: convId
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[AI ROUTER ROUTE EXCEPTION]:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

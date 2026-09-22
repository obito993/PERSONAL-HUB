import { AIRouter } from '@/lib/ai/router';

export interface GeneratedFlashcard {
  question: string;
  answer: string;
  cardType: 'definition' | 'concept' | 'formula' | 'comparison' | 'fact';
}

export interface GeneratedQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // 0..3
  explanation: string;
  topic: string;
  sourceSection?: string;
}

export interface GeneratedKeyPoint {
  category: 'IMPORTANT' | 'DEFINITION' | 'FORMULA' | 'CONCEPT' | 'EXAMPLE' | 'REMEMBER';
  point: string;
  importance: 'high' | 'medium';
}

/**
 * Clean JSON output from AI markdown code blocks if present
 */
function extractJSONString(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();
  }
  return cleaned;
}

export class AIStudyService {
  /**
   * Mode 1: SUMMARIZE
   */
  public static async generateSummary(title: string, content: string, isFullDoc = false): Promise<string> {
    const contextPrompt = `Document Scope: ${isFullDoc ? 'FULL DOCUMENT' : `CHAPTER: ${title}`}\n\nContent Excerpt:\n${content.slice(0, 7500)}`;
    const prompt = `Generate a comprehensive, structured study summary for "${title}".

REQUIREMENTS:
1. Cover all key concepts, definitions, formulas, and facts from the text.
2. Structure with clear Markdown headers (## Heading), bullet points, and bold terms.
3. Preserve exact terminology and important facts from the document.
4. Do NOT omit major sections or make it too brief.
5. End with a "KEY TAKEAWAYS" section.`;

    const res = await AIRouter.generateText({
      mode: 'STUDY',
      context: contextPrompt,
      prompt,
    });

    return res.result;
  }

  /**
   * Mode 2: EXPLAIN
   */
  public static async generateExplanation(title: string, content: string, isFullDoc = false): Promise<string> {
    const contextPrompt = `Document Scope: ${isFullDoc ? 'FULL DOCUMENT' : `CHAPTER: ${title}`}\n\nContent Excerpt:\n${content.slice(0, 7500)}`;
    const prompt = `Act like an expert university teacher explaining "${title}" to a student.

REQUIREMENTS & STRUCTURE:
1. Start from the core basics and define any technical jargon.
2. Break complex ideas down into simpler concepts.
3. Structure your response clearly:
   - ## CONCEPT OVERVIEW
   - ## SIMPLE EXPLANATION
   - ## HOW IT WORKS STEP-BY-STEP
   - ## REAL-WORLD EXAMPLE / ANALOGY
   - ## WHY IT MATTERS
   - ## WHAT YOU SHOULD REMEMBER
4. Address common student misconceptions if applicable.
5. Base the explanation strictly on the document text.`;

    const res = await AIRouter.generateText({
      mode: 'STUDY',
      context: contextPrompt,
      prompt,
    });

    return res.result;
  }

  /**
   * Mode 3: FLASHCARDS
   */
  public static async generateFlashcards(title: string, content: string, isFullDoc = false): Promise<GeneratedFlashcard[]> {
    const contextPrompt = `Document Scope: ${isFullDoc ? 'FULL DOCUMENT' : `CHAPTER: ${title}`}\n\nContent Excerpt:\n${content.slice(0, 7500)}`;
    const prompt = `Generate 10-15 high-quality flashcards for learning "${title}".

OUTPUT REQUIREMENTS:
Respond ONLY with a valid JSON array of objects. No intro text, no markdown wrappers outside JSON.
Each object must have:
{
  "question": "Front of card (clear question/definition/concept)",
  "answer": "Back of card (concise, clear answer)",
  "cardType": "definition" | "concept" | "formula" | "comparison" | "fact"
}

Example JSON output:
[
  {
    "question": "What is Database Normalization?",
    "answer": "The process of organizing data in a database to reduce redundancy and improve data integrity.",
    "cardType": "definition"
  }
]`;

    try {
      const res = await AIRouter.generateText({
        mode: 'STUDY',
        context: contextPrompt,
        prompt,
      });

      const cleaned = extractJSONString(res.result);
      const parsed = JSON.parse(cleaned);

      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(c => ({
          question: String(c.question || 'Study Question'),
          answer: String(c.answer || 'Study Answer'),
          cardType: ['definition', 'concept', 'formula', 'comparison', 'fact'].includes(c.cardType) ? c.cardType : 'concept',
        }));
      }
    } catch (err) {
      console.warn('[STUDY AI SERVICE] Flashcards JSON parse error, returning fallback cards:', err);
    }

    return [
      {
        question: `Key concept of ${title}?`,
        answer: content.slice(0, 200) + '...',
        cardType: 'concept'
      }
    ];
  }

  /**
   * Mode 4: QUIZ (Interactive multiple choice with topic coverage)
   */
  public static async generateQuizQuestions(
    title: string, 
    content: string, 
    coveredTopics: string[] = []
  ): Promise<GeneratedQuizQuestion[]> {
    const contextPrompt = `CHAPTER: ${title}\n\nExisting Covered Topics (DO NOT REPEAT THESE): ${coveredTopics.join(', ') || 'None'}\n\nContent Excerpt:\n${content.slice(0, 7500)}`;
    const prompt = `Generate 8 to 12 multiple-choice quiz questions to systematically test student understanding of "${title}".

REQUIREMENTS:
1. Target concepts, definitions, formulas, applications, and processes in this chapter.
2. Focus on UNCOVERED topics not in the existing list.
3. Each question MUST have exactly 4 choices (A, B, C, D).
4. Identify correct choice by index (0 for A, 1 for B, 2 for C, 3 for D).
5. Provide a helpful, educational explanation for why that answer is correct.

Respond ONLY with a valid JSON array of objects:
[
  {
    "question": "What is the primary function of...?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Option A is correct because...",
    "topic": "Core Definition",
    "sourceSection": "Section 1"
  }
]`;

    try {
      const res = await AIRouter.generateText({
        mode: 'STUDY',
        context: contextPrompt,
        prompt,
      });

      const cleaned = extractJSONString(res.result);
      const parsed = JSON.parse(cleaned);

      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((q: any) => ({
          question: String(q.question || 'Question'),
          options: Array.isArray(q.options) && q.options.length === 4 
            ? q.options.map(String) 
            : ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer <= 3 
            ? q.correctAnswer 
            : 0,
          explanation: String(q.explanation || 'Refer to text for detailed explanation.'),
          topic: String(q.topic || 'General Topic'),
          sourceSection: q.sourceSection ? String(q.sourceSection) : title,
        }));
      }
    } catch (err) {
      console.warn('[STUDY AI SERVICE] Quiz JSON parse error:', err);
    }

    return [
      {
        question: `According to ${title}, which of the following is true?`,
        options: ['Option A (Correct)', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 0,
        explanation: 'Option A directly reflects the core concept described in the text.',
        topic: 'General Concept',
        sourceSection: title
      }
    ];
  }

  /**
   * Mode 5: KEY POINTS
   */
  public static async generateKeyPoints(title: string, content: string, isFullDoc = false): Promise<GeneratedKeyPoint[]> {
    const contextPrompt = `Document Scope: ${isFullDoc ? 'FULL DOCUMENT' : `CHAPTER: ${title}`}\n\nContent Excerpt:\n${content.slice(0, 7500)}`;
    const prompt = `Extract fast exam-revision key points for "${title}".

REQUIREMENTS:
Categorize key points into 10 to 15 concise bullet points.
Respond ONLY with a valid JSON array of objects:
[
  {
    "category": "IMPORTANT" | "DEFINITION" | "FORMULA" | "CONCEPT" | "EXAMPLE" | "REMEMBER",
    "point": "Concise key point statement here.",
    "importance": "high" | "medium"
  }
]`;

    try {
      const res = await AIRouter.generateText({
        mode: 'STUDY',
        context: contextPrompt,
        prompt,
      });

      const cleaned = extractJSONString(res.result);
      const parsed = JSON.parse(cleaned);

      if (Array.isArray(parsed) && parsed.length > 0) {
        const validCategories = ['IMPORTANT', 'DEFINITION', 'FORMULA', 'CONCEPT', 'EXAMPLE', 'REMEMBER'];
        return parsed.map((kp: any) => ({
          category: validCategories.includes(kp.category) ? kp.category : 'IMPORTANT',
          point: String(kp.point || 'Key point statement.'),
          importance: kp.importance === 'medium' ? 'medium' : 'high',
        }));
      }
    } catch (err) {
      console.warn('[STUDY AI SERVICE] Key points JSON parse error:', err);
    }

    return [
      {
        category: 'IMPORTANT',
        point: `Core theme of ${title}: Master key definitions and principles.`,
        importance: 'high',
      }
    ];
  }
}

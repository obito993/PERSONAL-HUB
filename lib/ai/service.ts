import { AIRouter } from './router';
import { AIRequestOptions, AIResponse, AIMode, ChatMessage } from './types';

export async function generateAIText(options: AIRequestOptions): Promise<AIResponse> {
  return await AIRouter.generateText(options);
}

export async function generateAIStructured<T>(
  prompt: string,
  mode: AIMode = 'STUDY',
  context?: string
): Promise<T> {
  const structuredPrompt = `${prompt}\n\nSTRICT INSTRUCTION: Respond strictly in raw valid JSON format matching the request structure. Do NOT include markdown code blocks (\`\`\`json), prefix explanations, or conversational text.`;

  const res = await AIRouter.generateText({
    prompt: structuredPrompt,
    mode,
    context,
  });

  const cleanJson = res.result.replace(/```json\n?|\n?```/g, '').trim();
  try {
    return JSON.parse(cleanJson) as T;
  } catch (err) {
    console.error('[AI SERVICE] JSON parse error on structured response:', cleanJson);
    throw new Error('AI provider returned malformed JSON structure.');
  }
}

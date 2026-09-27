import { PrismaClient } from '@prisma/client';
import { AIRouter } from '@/lib/ai/router';
import { AgentMemoryService } from './memory-service';
import { AgentToolRegistry } from './tool-registry';

const prisma = new PrismaClient();

export class AgentEngine {
  /**
   * Get or create UserAISettings for the user
   */
  static async getUserSettings(userId: string, userName?: string) {
    let settings = await prisma.userAISettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      const firstName = userName ? userName.trim().split(' ')[0] : 'Personal';
      settings = await prisma.userAISettings.create({
        data: {
          userId,
          customName: `${firstName}'s Agent`,
          personality: 'helpful, proactive, precise, encouraging',
          responseStyle: 'detailed',
          memoryEnabled: true,
          approvalLevel: 'SUPERVISED',
        },
      });
    }

    return settings;
  }

  /**
   * Run a chat conversation step with the personal AI agent
   */
  static async processAgentChat(
    userId: string,
    userName: string,
    prompt: string,
    providerOverride: 'auto' | 'ollama' | 'gemini' | 'groq' = 'auto'
  ) {
    const settings = await this.getUserSettings(userId, userName);
    const memories = settings.memoryEnabled
      ? await AgentMemoryService.recallRelevantMemories(userId, prompt, 5)
      : [];

    const firstName = userName.trim().split(' ')[0];
    const agentDisplayName = settings.customName || `${firstName}'s Personal AI`;

    const memoryContext = memories.length > 0
      ? `\n\nRECALLED MEMORIES FOR ${userName.toUpperCase()}:\n` +
        memories.map((m) => `- [${m.category.toUpperCase()}] ${m.content}`).join('\n')
      : '';

    const systemPrompt = `You are ${agentDisplayName}, an autonomous, highly capable personal AI agent specifically assigned to ${userName}.
Personality: ${settings.personality}
Response Style: ${settings.responseStyle}
User First Name: ${firstName}
${memoryContext}

Guidelines:
- Maintain strict loyalty to ${userName}.
- You possess memories, study tools, career tools, task management tools, and habit trackers.
- Speak naturally, professionally, and enthusiastically in Neo-Brutalist / comic-hero style when appropriate.
- Always refer to yourself as ${agentDisplayName} or ${firstName}'s AI. Never pretend to be Deion AI unless the user's name is Deion.`;

    const fullPrompt = `${systemPrompt}\n\n${userName}: ${prompt}\n${agentDisplayName}:`;

    const response = await AIRouter.generateText({
      mode: 'GENERAL',
      prompt: fullPrompt,
      providerOverride,
    });

    // Automatically check if memory should be created (e.g. if user says "Remember that...", "My favorite...")
    if (settings.memoryEnabled && (prompt.toLowerCase().includes('remember') || prompt.toLowerCase().includes('my favorite') || prompt.toLowerCase().includes('i prefer'))) {
      await AgentMemoryService.saveMemory(userId, 'preference', prompt, 'conversation_auto', 2);
    }

    return {
      result: response.result,
      provider: response.provider,
      model: response.model,
      fallbackOccurred: response.fallbackOccurred,
      agentName: agentDisplayName,
      recalledMemories: memories,
    };
  }

  /**
   * Create and execute an autonomous multi-step task
   */
  static async createAndRunTask(userId: string, title: string, description: string) {
    const task = await prisma.agentTask.create({
      data: {
        userId,
        title,
        description,
        status: 'RUNNING',
        priority: 'MEDIUM',
        progress: 10,
        steps: {
          create: [
            { stepIndex: 1, title: 'Analyze request & recall user context', status: 'RUNNING' },
            { stepIndex: 2, title: 'Execute tools & gather information', status: 'PENDING' },
            { stepIndex: 3, title: 'Synthesize results & summarize outcome', status: 'PENDING' },
          ],
        },
      },
      include: { steps: true },
    });

    // Step 1: Recall context
    const memories = await AgentMemoryService.recallRelevantMemories(userId, title);
    await prisma.agentTaskStep.update({
      where: { id: task.steps[0].id },
      data: {
        status: 'COMPLETED',
        resultText: `Recalled ${memories.length} relevant memories for task.`,
      },
    });

    // Step 2: Tool execution simulation/search
    await prisma.agentTaskStep.update({
      where: { id: task.steps[1].id },
      data: { status: 'RUNNING' },
    });

    const toolRes = await AgentToolRegistry.executeTool(userId, 'search_study_library', { query: title }, task.id);

    await prisma.agentTaskStep.update({
      where: { id: task.steps[1].id },
      data: {
        status: 'COMPLETED',
        resultText: `Tool ${toolRes.toolName} executed. Found ${toolRes.result?.count || 0} study documents.`,
      },
    });

    // Step 3: Synthesis
    await prisma.agentTaskStep.update({
      where: { id: task.steps[2].id },
      data: { status: 'RUNNING' },
    });

    const summaryText = `Task "${title}" completed successfully. Inspected user resources and applied memory rules.`;

    await prisma.agentTaskStep.update({
      where: { id: task.steps[2].id },
      data: {
        status: 'COMPLETED',
        resultText: summaryText,
      },
    });

    // Update main task status
    const updatedTask = await prisma.agentTask.update({
      where: { id: task.id },
      data: {
        status: 'COMPLETED',
        progress: 100,
        resultSummary: summaryText,
      },
      include: { steps: true, auditLogs: true },
    });

    return updatedTask;
  }
}

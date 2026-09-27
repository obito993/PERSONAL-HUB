import { PrismaClient } from '@prisma/client';
import { AIRouter } from '@/lib/ai/router';
import { AgentMemoryService } from './memory-service';
import { AgentToolRegistry } from './tool-registry';

const prisma = new PrismaClient();

// ─── Audit event types ───────────────────────────────────────────────────────
type AuditEvent =
  | 'TASK_CREATED'
  | 'TASK_PLANNING'
  | 'AI_PROVIDER_SELECTED'
  | 'TOOL_STARTED'
  | 'TOOL_COMPLETED'
  | 'AI_GENERATION_STARTED'
  | 'AI_GENERATION_COMPLETED'
  | 'VALIDATION_STARTED'
  | 'VALIDATION_COMPLETED'
  | 'TASK_COMPLETED'
  | 'AI_PROVIDER_FAILED'
  | 'TOOL_FAILED'
  | 'TASK_VALIDATION_FAILED'
  | 'TASK_FAILED';

// ─── Execution plan types ────────────────────────────────────────────────────
type TaskType =
  | 'AI_GENERATION'   // pure content generation — no tools needed
  | 'STUDY_DOCUMENT'  // requires study library access
  | 'DATA_QUERY'      // query user data (tasks, career, habits)
  | 'MEMORY_RECALL'   // heavy memory-search focus
  | 'MIXED';          // combination

interface ExecutionPlan {
  taskType: TaskType;
  rationale: string;
  requiresStudyLibrary: boolean;
  requiresMemorySearch: boolean;
  requiresDataQuery: boolean;
  toolsToCall: string[];
  estimatedSteps: number;
}

// ─── Helper: audit logger ────────────────────────────────────────────────────
async function audit(
  userId: string,
  taskId: string,
  event: AuditEvent,
  summary: string,
  details?: Record<string, unknown>
) {
  try {
    await prisma.agentAuditLog.create({
      data: {
        userId,
        taskId,
        toolName: event,
        actionSummary: summary,
        approvalStatus: 'AUTO_EXECUTED',
        detailsJson: JSON.stringify(details || {}),
      },
    });
  } catch (e) {
    console.warn('[AUDIT LOG] Failed to write audit event:', e);
  }
}

// ─── Helper: update a task step ──────────────────────────────────────────────
async function updateStep(
  stepId: string,
  status: string,
  resultText: string,
  toolName?: string
) {
  await prisma.agentTaskStep.update({
    where: { id: stepId },
    data: { status, resultText, toolName: toolName ?? undefined },
  });
}

// ─── Helper: create a step ───────────────────────────────────────────────────
async function createStep(
  taskId: string,
  stepIndex: number,
  title: string,
  status = 'PENDING'
) {
  return prisma.agentTaskStep.create({
    data: { taskId, stepIndex, title, status },
  });
}

// ─── Helper: mark task failed ────────────────────────────────────────────────
async function failTask(
  taskId: string,
  userId: string,
  reason: string,
  progress = 0
) {
  await prisma.agentTask.update({
    where: { id: taskId },
    data: {
      status: 'FAILED',
      progress,
      errorMessage: reason,
      validationPassed: false,
    },
  });
  await audit(userId, taskId, 'TASK_FAILED', reason);
}

// ─── Phase 1: Determine execution plan via AI ─────────────────────────────────
async function determineExecutionPlan(
  userId: string,
  title: string,
  description: string
): Promise<ExecutionPlan> {
  // Keywords that strongly indicate study-library need
  const studyKeywords = [
    'pdf', 'textbook', 'my notes', 'uploaded', 'study material',
    'my document', 'chapter', 'my book', 'lecture',
  ];
  const dataQueryKeywords = [
    'my tasks', 'my habits', 'my career', 'my applications',
    'my expenses', 'job applications', 'job list',
  ];
  const memoryKeywords = [
    'remember', 'recall', 'previously', 'what did i say',
    'my preference', 'what i told',
  ];

  const combined = `${title} ${description}`.toLowerCase();

  const requiresStudyLibrary = studyKeywords.some((kw) => combined.includes(kw));
  const requiresDataQuery = dataQueryKeywords.some((kw) => combined.includes(kw));
  const requiresMemorySearch = memoryKeywords.some((kw) => combined.includes(kw));

  // Build tool list
  const toolsToCall: string[] = [];
  if (requiresStudyLibrary) toolsToCall.push('search_study_library');
  if (requiresDataQuery) {
    if (combined.includes('task')) toolsToCall.push('list_user_tasks');
    if (combined.includes('habit')) toolsToCall.push('list_user_habits');
    if (combined.includes('career') || combined.includes('application')) toolsToCall.push('get_career_applications');
  }
  if (requiresMemorySearch) toolsToCall.push('search_agent_memories');

  // Determine task type
  let taskType: TaskType = 'AI_GENERATION';
  if (requiresStudyLibrary && (requiresDataQuery || requiresMemorySearch)) {
    taskType = 'MIXED';
  } else if (requiresStudyLibrary) {
    taskType = 'STUDY_DOCUMENT';
  } else if (requiresDataQuery) {
    taskType = 'DATA_QUERY';
  } else if (requiresMemorySearch) {
    taskType = 'MEMORY_RECALL';
  }

  const rationale =
    taskType === 'AI_GENERATION'
      ? 'Task is a content-generation request — no user data tools required. Will use AI provider directly.'
      : `Task requires tools: ${toolsToCall.join(', ')}.`;

  return {
    taskType,
    rationale,
    requiresStudyLibrary,
    requiresMemorySearch,
    requiresDataQuery,
    toolsToCall,
    estimatedSteps: 2 + toolsToCall.length, // planning + tools + generation + validation
  };
}

// ─── Phase 2: Build the AI prompt ─────────────────────────────────────────────
function buildExecutionPrompt(
  userName: string,
  title: string,
  description: string,
  toolResults: { toolName: string; result: unknown }[],
  memories: { category: string; content: string }[]
): string {
  const memCtx =
    memories.length > 0
      ? `\n\nRELEVANT USER MEMORIES:\n${memories.map((m) => `- [${m.category.toUpperCase()}] ${m.content}`).join('\n')}`
      : '';

  const toolCtx =
    toolResults.length > 0
      ? `\n\nTOOL RESULTS:\n${toolResults
          .map((t) => `[${t.toolName}]:\n${JSON.stringify(t.result, null, 2)}`)
          .join('\n\n')}`
      : '';

  const taskSpec = description.trim()
    ? `TASK TITLE: ${title}\nTASK INSTRUCTIONS: ${description}`
    : `TASK: ${title}`;

  return `You are an autonomous personal AI agent executing a task for ${userName}.

${taskSpec}${memCtx}${toolCtx}

Execute the task completely and thoroughly. Return the full requested output — do not summarize or truncate.
If the task asks for examples, include them. If it asks for a plan, produce all steps. If it asks for code, write the code.`;
}

// ─── Phase 3: Validate the result ─────────────────────────────────────────────
function validateResult(
  title: string,
  description: string,
  result: string
): { passed: boolean; notes: string } {
  if (!result || result.trim().length < 50) {
    return { passed: false, notes: 'AI returned an empty or extremely short response.' };
  }

  // If description has explicit required keywords, check they appear
  const combined = `${title} ${description}`.toLowerCase();
  const checks: { keyword: string; label: string }[] = [];

  if (combined.includes('inner join')) checks.push({ keyword: 'inner join', label: 'INNER JOIN content' });
  if (combined.includes('left join')) checks.push({ keyword: 'left join', label: 'LEFT JOIN content' });
  if (combined.includes('full outer join')) checks.push({ keyword: 'full outer join', label: 'FULL OUTER JOIN content' });
  if (combined.includes('sql')) checks.push({ keyword: 'select', label: 'SQL example' });

  const resultLower = result.toLowerCase();
  const missing = checks.filter((c) => !resultLower.includes(c.keyword)).map((c) => c.label);

  if (missing.length > 0) {
    return {
      passed: false,
      notes: `Result is missing required content: ${missing.join(', ')}. Marking as FAILED.`,
    };
  }

  return { passed: true, notes: `Result validated successfully. Length: ${result.length} chars.` };
}

export class AgentEngine {
  // ─── Get or create UserAISettings ──────────────────────────────────────────
  static async getUserSettings(userId: string, userName?: string) {
    let settings = await prisma.userAISettings.findUnique({ where: { userId } });
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

  // ─── Chat endpoint (unchanged) ──────────────────────────────────────────────
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

    const memoryContext =
      memories.length > 0
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
- Speak naturally, professionally, and enthusiastically in Neo-Brutalist / comic-hero style when appropriate.
- Always refer to yourself as ${agentDisplayName}. Never claim to be Deion AI unless the user's name is Deion.`;

    const fullPrompt = `${systemPrompt}\n\n${userName}: ${prompt}\n${agentDisplayName}:`;

    const response = await AIRouter.generateText({
      mode: 'GENERAL',
      prompt: fullPrompt,
      providerOverride,
    });

    if (
      settings.memoryEnabled &&
      (prompt.toLowerCase().includes('remember') ||
        prompt.toLowerCase().includes('my favorite') ||
        prompt.toLowerCase().includes('i prefer'))
    ) {
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

  // ─── REAL Autonomous Task Executor ─────────────────────────────────────────
  static async createAndRunTask(userId: string, title: string, description: string) {
    const startTime = Date.now();
    let stepIndex = 0;

    // Fetch user for display name
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
    const userName = user?.name || 'User';

    // ── Create task record (PLANNING) ──────────────────────────────────────
    const task = await prisma.agentTask.create({
      data: {
        userId,
        title,
        description,
        status: 'PLANNING',
        priority: 'MEDIUM',
        progress: 5,
      },
    });

    await audit(userId, task.id, 'TASK_CREATED', `Task created: "${title}"`);

    try {
      // ── Step 1: PLANNING — determine task type & tools ───────────────────
      await prisma.agentTask.update({ where: { id: task.id }, data: { status: 'PLANNING', progress: 10 } });
      await audit(userId, task.id, 'TASK_PLANNING', `Planning execution for: "${title}"`);

      const plan = await determineExecutionPlan(userId, title, description);
      stepIndex++;
      const step1 = await createStep(task.id, stepIndex, 'Plan execution strategy', 'RUNNING');

      await prisma.agentTask.update({
        where: { id: task.id },
        data: { executionPlanJson: JSON.stringify(plan), progress: 15 },
      });

      await updateStep(
        step1.id,
        'COMPLETED',
        `Task type: ${plan.taskType}. ${plan.rationale}${
          plan.toolsToCall.length > 0
            ? ` Tools selected: ${plan.toolsToCall.join(', ')}.`
            : ' No tools required — pure AI generation.'
        }`
      );

      // ── Optional memory recall step ──────────────────────────────────────
      let memories: { category: string; content: string }[] = [];
      const settings = await this.getUserSettings(userId, userName);

      if (settings.memoryEnabled) {
        stepIndex++;
        const memStep = await createStep(task.id, stepIndex, 'Recall relevant memories', 'RUNNING');
        const rawMemories = await AgentMemoryService.recallRelevantMemories(userId, `${title} ${description}`, 5);
        memories = rawMemories.map((m) => ({ category: m.category, content: m.content }));
        await updateStep(
          memStep.id,
          'COMPLETED',
          memories.length > 0
            ? `Recalled ${memories.length} relevant memories: ${memories.map((m) => m.content.slice(0, 60)).join('; ')}`
            : 'No relevant memories found for this task (context is clean).'
        );
      }

      // ── Optional tool execution steps ────────────────────────────────────
      await prisma.agentTask.update({ where: { id: task.id }, data: { status: 'RUNNING', progress: 30 } });

      const toolResults: { toolName: string; result: unknown }[] = [];

      for (const toolName of plan.toolsToCall) {
        stepIndex++;
        const toolStep = await createStep(
          task.id,
          stepIndex,
          `Execute tool: ${toolName}`,
          'RUNNING'
        );

        await audit(userId, task.id, 'TOOL_STARTED', `Running tool: ${toolName}`, { toolName });

        const toolArgs: Record<string, unknown> = {};
        if (toolName === 'search_study_library') toolArgs.query = title;
        if (toolName === 'search_agent_memories') toolArgs.query = `${title} ${description}`;

        const toolRes = await AgentToolRegistry.executeTool(userId, toolName, toolArgs, task.id);

        if (!toolRes.success) {
          await updateStep(toolStep.id, 'FAILED', `Tool ${toolName} failed: ${toolRes.error}`, toolName);
          await audit(userId, task.id, 'TOOL_FAILED', `Tool ${toolName} failed: ${toolRes.error}`);
          // Non-fatal — continue with available data
        } else {
          toolResults.push({ toolName, result: toolRes.result });
          const resultSummary =
            toolName === 'search_study_library'
              ? `Found ${toolRes.result?.count ?? 0} study documents.${
                  toolRes.result?.count > 0
                    ? ` Documents: ${toolRes.result.documents.map((d: { title: string }) => d.title).join(', ')}`
                    : ''
                }`
              : `Tool executed successfully.`;

          await updateStep(toolStep.id, 'COMPLETED', resultSummary, toolName);
          await audit(userId, task.id, 'TOOL_COMPLETED', `Tool ${toolName} completed.`, {
            result: toolRes.result,
          });
        }
      }

      // ── AI Generation step ────────────────────────────────────────────────
      stepIndex++;
      const aiStep = await createStep(task.id, stepIndex, 'Generate AI response', 'RUNNING');
      await prisma.agentTask.update({ where: { id: task.id }, data: { progress: 60 } });
      await audit(userId, task.id, 'AI_GENERATION_STARTED', `Calling AI provider (Ollama → Gemini → Groq) for task: "${title}"`);

      const executionPrompt = buildExecutionPrompt(
        userName,
        title,
        description,
        toolResults,
        memories
      );

      let aiResponse: { result: string; provider: string; model: string; fallbackOccurred?: boolean; fallbackChain?: string[] };
      try {
        aiResponse = await AIRouter.generateText({
          mode: 'GENERAL',
          prompt: executionPrompt,
        });
      } catch (aiErr: unknown) {
        const errMsg = aiErr instanceof Error ? aiErr.message : String(aiErr);
        await updateStep(aiStep.id, 'FAILED', `AI generation failed: ${errMsg}`);
        await failTask(task.id, userId, `All AI providers failed: ${errMsg}`, 60);
        return prisma.agentTask.findUnique({
          where: { id: task.id },
          include: { steps: { orderBy: { stepIndex: 'asc' } }, auditLogs: { orderBy: { timestamp: 'desc' } } },
        });
      }

      await audit(userId, task.id, 'AI_PROVIDER_SELECTED', `Provider used: ${aiResponse.provider} (${aiResponse.model})`, {
        provider: aiResponse.provider,
        model: aiResponse.model,
        fallbackOccurred: aiResponse.fallbackOccurred,
        fallbackChain: aiResponse.fallbackChain,
      });

      const providerLabel = aiResponse.fallbackOccurred
        ? `${aiResponse.provider} (fallback from: ${aiResponse.fallbackChain?.join(' → ')})`
        : aiResponse.provider;

      await updateStep(
        aiStep.id,
        'COMPLETED',
        `AI generation complete via ${providerLabel} (${aiResponse.model}). Response length: ${aiResponse.result.length} chars.`
      );

      await audit(userId, task.id, 'AI_GENERATION_COMPLETED', `AI generation completed. Provider: ${aiResponse.provider}`);

      // ── Validation step ───────────────────────────────────────────────────
      stepIndex++;
      const valStep = await createStep(task.id, stepIndex, 'Validate result', 'RUNNING');
      await prisma.agentTask.update({ where: { id: task.id }, data: { status: 'VALIDATING', progress: 85 } });
      await audit(userId, task.id, 'VALIDATION_STARTED', 'Validating task result...');

      const validation = validateResult(title, description, aiResponse.result);

      await updateStep(valStep.id, validation.passed ? 'COMPLETED' : 'FAILED', validation.notes);
      await audit(
        userId,
        task.id,
        validation.passed ? 'VALIDATION_COMPLETED' : 'TASK_VALIDATION_FAILED',
        validation.notes
      );

      const durationMs = Date.now() - startTime;

      if (!validation.passed) {
        // Still persist the result but mark FAILED with validation notes
        await prisma.agentTask.update({
          where: { id: task.id },
          data: {
            status: 'FAILED',
            progress: 90,
            resultSummary: aiResponse.result,
            providerUsed: aiResponse.provider,
            modelUsed: aiResponse.model,
            fallbackChain: aiResponse.fallbackChain ? JSON.stringify(aiResponse.fallbackChain) : null,
            validationPassed: false,
            validationNotes: validation.notes,
            errorMessage: validation.notes,
            durationMs,
          },
        });
      } else {
        // ── COMPLETED ────────────────────────────────────────────────────
        await prisma.agentTask.update({
          where: { id: task.id },
          data: {
            status: 'COMPLETED',
            progress: 100,
            resultSummary: aiResponse.result,
            providerUsed: aiResponse.provider,
            modelUsed: aiResponse.model,
            fallbackChain: aiResponse.fallbackChain ? JSON.stringify(aiResponse.fallbackChain) : null,
            validationPassed: true,
            validationNotes: validation.notes,
            durationMs,
          },
        });
        await audit(userId, task.id, 'TASK_COMPLETED', `Task "${title}" completed in ${durationMs}ms via ${aiResponse.provider}.`);
      }

      return prisma.agentTask.findUnique({
        where: { id: task.id },
        include: { steps: { orderBy: { stepIndex: 'asc' } }, auditLogs: { orderBy: { timestamp: 'desc' } } },
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error('[AGENT ENGINE] Unexpected error:', errMsg);
      await failTask(task.id, userId, `Unexpected engine error: ${errMsg}`, 0);
      return prisma.agentTask.findUnique({
        where: { id: task.id },
        include: { steps: { orderBy: { stepIndex: 'asc' } }, auditLogs: { orderBy: { timestamp: 'desc' } } },
      });
    }
  }
}

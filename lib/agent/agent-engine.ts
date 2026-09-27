/**
 * DEION HUB — Autonomous Agent Execution Engine
 *
 * Architecture:
 *   CREATED → PLANNING → RUNNING → VALIDATING → COMPLETED | FAILED
 *
 * Provider cascade: Ollama → Gemini → Groq  (existing AIRouter, unchanged)
 *
 * Vercel note: The POST /api/agent/tasks route sets maxDuration=60.
 * All state is persisted to Neon PostgreSQL — no in-memory or local-FS state.
 */

import { PrismaClient } from '@prisma/client';
import { AIRouter } from '@/lib/ai/router';
import { AgentMemoryService } from './memory-service';
import { AgentToolRegistry } from './tool-registry';

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type AuditEvent =
  | 'TASK_CREATED'
  | 'TASK_PLANNING'
  | 'AI_PROVIDER_SELECTED'
  | 'TOOL_STARTED'
  | 'TOOL_COMPLETED'
  | 'TOOL_FAILED'
  | 'AI_GENERATION_STARTED'
  | 'AI_GENERATION_COMPLETED'
  | 'AI_PROVIDER_FAILED'
  | 'VALIDATION_STARTED'
  | 'VALIDATION_COMPLETED'
  | 'TASK_VALIDATION_FAILED'
  | 'TASK_COMPLETED'
  | 'TASK_FAILED';

/**
 * Task types determine the execution path.
 * AI_GENERATION = pure content request, no user-data tools needed.
 * STUDY_DOCUMENT = explicitly about user's uploaded PDFs/textbooks.
 * DATA_QUERY     = querying user's tasks, habits, career data.
 * MEMORY_RECALL  = querying agent memory explicitly.
 * MIXED          = combination of the above.
 */
type TaskType = 'AI_GENERATION' | 'STUDY_DOCUMENT' | 'DATA_QUERY' | 'MEMORY_RECALL' | 'MIXED';

interface ExecutionPlan {
  taskType: TaskType;
  rationale: string;
  toolsToCall: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Private helpers
// ─────────────────────────────────────────────────────────────────────────────

async function logAudit(
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
        detailsJson: JSON.stringify(details ?? {}),
      },
    });
  } catch (e) {
    console.warn('[AGENT ENGINE] Audit log write failed:', e);
  }
}

async function createStep(taskId: string, stepIndex: number, title: string, status = 'RUNNING') {
  return prisma.agentTaskStep.create({
    data: { taskId, stepIndex, title, status },
  });
}

async function completeStep(stepId: string, resultText: string, toolName?: string) {
  await prisma.agentTaskStep.update({
    where: { id: stepId },
    data: { status: 'COMPLETED', resultText, toolName: toolName ?? undefined },
  });
}

async function failStep(stepId: string, reason: string, toolName?: string) {
  await prisma.agentTaskStep.update({
    where: { id: stepId },
    data: { status: 'FAILED', resultText: reason, toolName: toolName ?? undefined },
  });
}

async function setTaskStatus(
  taskId: string,
  status: string,
  progress: number,
  extra?: Record<string, unknown>
) {
  await prisma.agentTask.update({
    where: { id: taskId },
    data: { status, progress, ...(extra ?? {}) },
  });
}

async function markTaskFailed(
  taskId: string,
  userId: string,
  reason: string,
  progress = 0,
  partialResult?: string
) {
  await prisma.agentTask.update({
    where: { id: taskId },
    data: {
      status: 'FAILED',
      progress,
      errorMessage: reason,
      validationPassed: false,
      ...(partialResult ? { resultSummary: partialResult } : {}),
    },
  });
  await logAudit(userId, taskId, 'TASK_FAILED', reason);
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 1: Execution plan — keyword-based, conservative, no false positives
//
// Rule: A tool is ONLY included if the task EXPLICITLY asks for it.
// "SQL JOIN learning plan"         → AI_GENERATION (no tools)
// "Explain Python list comprehensions" → AI_GENERATION (no tools)
// "Calculate 347 × 29"             → AI_GENERATION (no tools)
// "Search my uploaded textbook"    → STUDY_DOCUMENT (search_study_library)
// "What are my active habits"      → DATA_QUERY (list_user_habits)
// "What did I tell you about..."   → MEMORY_RECALL (search_agent_memories)
// ─────────────────────────────────────────────────────────────────────────────

function determineExecutionPlan(title: string, description: string): ExecutionPlan {
  const combined = `${title} ${description}`.toLowerCase().trim();

  // ── Study library triggers: only explicit references to the user's OWN uploads ──
  // "my pdf", "my textbook", "uploaded", "my notes", "my document", "my book",
  // "search my study library", "my lecture notes", "my study material"
  const studyTriggers = [
    'my pdf', 'my textbook', 'uploaded', 'my notes', 'my document',
    'my book', 'my lecture', 'my study material', 'study library',
    'my uploaded', 'summarize my', 'from my study',
  ];
  const requiresStudy = studyTriggers.some((t) => combined.includes(t));

  // ── Data query triggers: only when the user refers to THEIR OWN stored data ──
  const habitTriggers = ['my habits', 'my habit list', 'active habits', 'habit tracker'];
  const taskTriggers = ['my task list', 'my tasks', 'list my tasks', 'what tasks'];
  const careerTriggers = ['my job applications', 'my career applications', 'my applications', 'job list'];

  const requiresHabits = habitTriggers.some((t) => combined.includes(t));
  const requiresTasks = taskTriggers.some((t) => combined.includes(t));
  const requiresCareer = careerTriggers.some((t) => combined.includes(t));
  const requiresData = requiresHabits || requiresTasks || requiresCareer;

  // ── Memory recall triggers: only when explicitly asking about past conversations ──
  const memoryTriggers = [
    'what did i tell you', 'what did i say', 'do you remember',
    'recall what i said', 'my preference', 'what i told you',
    'from our conversation', 'you previously',
  ];
  const requiresMemory = memoryTriggers.some((t) => combined.includes(t));

  // Build tools list (in order of execution)
  const toolsToCall: string[] = [];
  if (requiresStudy) toolsToCall.push('search_study_library');
  if (requiresTasks) toolsToCall.push('list_user_tasks');
  if (requiresHabits) toolsToCall.push('list_user_habits');
  if (requiresCareer) toolsToCall.push('get_career_applications');
  if (requiresMemory) toolsToCall.push('search_agent_memories');

  // Classify task type
  const needsTools = toolsToCall.length > 0;
  let taskType: TaskType = 'AI_GENERATION';
  if (requiresStudy && requiresData) taskType = 'MIXED';
  else if (requiresStudy && requiresMemory) taskType = 'MIXED';
  else if (requiresStudy) taskType = 'STUDY_DOCUMENT';
  else if (requiresData) taskType = 'DATA_QUERY';
  else if (requiresMemory) taskType = 'MEMORY_RECALL';

  const rationale = needsTools
    ? `Task explicitly requires user data. Tools selected: ${toolsToCall.join(', ')}.`
    : 'Pure AI content-generation task. No user-data tools needed — calling AI provider directly.';

  return { taskType, rationale, toolsToCall };
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 2: Build the AI execution prompt
// ─────────────────────────────────────────────────────────────────────────────

function buildExecutionPrompt(
  userName: string,
  title: string,
  description: string,
  toolResults: { toolName: string; result: unknown }[],
  memories: { category: string; content: string }[]
): string {
  const lines: string[] = [];

  lines.push(`You are an autonomous personal AI agent executing a task for ${userName}.`);
  lines.push('');

  if (description.trim()) {
    lines.push(`TASK TITLE: ${title}`);
    lines.push(`TASK INSTRUCTIONS: ${description}`);
  } else {
    lines.push(`TASK: ${title}`);
  }

  if (memories.length > 0) {
    lines.push('');
    lines.push('RELEVANT USER MEMORIES:');
    for (const m of memories) {
      lines.push(`- [${m.category.toUpperCase()}] ${m.content}`);
    }
  }

  if (toolResults.length > 0) {
    lines.push('');
    lines.push('DATA RETRIEVED FOR THIS TASK:');
    for (const tr of toolResults) {
      lines.push(`[${tr.toolName}]:`);
      lines.push(JSON.stringify(tr.result, null, 2));
    }
  }

  lines.push('');
  lines.push('EXECUTION RULES:');
  lines.push('1. Execute the task COMPLETELY. Do not truncate or summarize.');
  lines.push('2. If the task asks for examples, include them.');
  lines.push('3. If the task asks for a plan, produce ALL steps in detail.');
  lines.push('4. If the task asks for code, write complete, runnable code.');
  lines.push('5. If the task asks for explanations, explain thoroughly with examples.');
  lines.push('6. Do NOT produce a generic completion message. Produce the actual requested output.');

  return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 3: Validate result — conservative: pass if non-trivial, fail if empty
//
// We do NOT apply overly strict keyword checks that can falsely fail good
// AI responses. The AI may phrase things differently (e.g. "INNER JOIN" vs
// "inner join"). We only fail on empty / trivially short responses.
//
// Task-specific validation: we check for the PRESENCE of substantive content
// (minimum length thresholds) and reject known bad patterns.
// ─────────────────────────────────────────────────────────────────────────────

function validateResult(
  title: string,
  description: string,
  result: string
): { passed: boolean; notes: string } {
  const trimmed = result.trim();

  // Hard fail: empty
  if (!trimmed) {
    return { passed: false, notes: 'AI returned an empty response. Cannot complete task.' };
  }

  // Hard fail: trivially short (< 30 chars)
  if (trimmed.length < 30) {
    return {
      passed: false,
      notes: `AI response too short (${trimmed.length} chars). Task not fulfilled.`,
    };
  }

  // Hard fail: known generic completion strings that mean nothing
  const badPatterns = [
    'task completed successfully',
    'inspected user resources and applied memory rules',
    'completed. inspected',
    'task has been completed',
  ];
  const resultLower = trimmed.toLowerCase();
  for (const bad of badPatterns) {
    if (resultLower === bad || (resultLower.startsWith(bad) && trimmed.length < 120)) {
      return {
        passed: false,
        notes: `AI returned a generic placeholder message: "${trimmed.slice(0, 100)}".`,
      };
    }
  }

  // ── Math check: strip commas/spaces before comparing ─────────────────────
  // The AI commonly formats numbers like "10,063" or "10 063" — we must accept both.
  const combined = `${title} ${description}`.toLowerCase();
  const mathMatch = combined.match(/calculate\s+([\d,.\s]+)\s*[×x*]\s*([\d,.\s]+)/i);
  if (mathMatch) {
    const a = parseInt(mathMatch[1].replace(/[,.\s]/g, ''), 10);
    const b = parseInt(mathMatch[2].replace(/[,.\s]/g, ''), 10);
    if (!isNaN(a) && !isNaN(b)) {
      const expected = a * b;
      // Strip commas/spaces from result to find the number in any format
      const resultStripped = result.replace(/,/g, '').replace(/\s/g, '');
      const expectedStr = expected.toString();
      // Also check for comma-formatted version (e.g. "10,063")
      const expectedFormatted = expected.toLocaleString('en-US');
      if (!resultStripped.includes(expectedStr) && !result.includes(expectedFormatted)) {
        return {
          passed: false,
          notes: `Math task expected ${expectedFormatted} (${a} × ${b}) but was not found in the response.`,
        };
      }
    }
  }

  // Pass — substantive, non-generic response
  return {
    passed: true,
    notes: `Validated. Length: ${trimmed.length} chars.`,
  };
}



// ─────────────────────────────────────────────────────────────────────────────
// AgentEngine — public class
// ─────────────────────────────────────────────────────────────────────────────

export class AgentEngine {
  /**
   * Get or create UserAISettings for a user.
   * Called from the AI page to load the agent name, personality, etc.
   */
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

  /**
   * Process a chat message via the personal AI agent.
   * Uses memory recall and routes through the existing provider cascade.
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

    const memoryCtx =
      memories.length > 0
        ? `\n\nRECALLED MEMORIES:\n` +
          memories.map((m) => `- [${m.category.toUpperCase()}] ${m.content}`).join('\n')
        : '';

    const systemPrompt = [
      `You are ${agentDisplayName}, an autonomous personal AI agent assigned to ${userName}.`,
      `Personality: ${settings.personality}`,
      `Response Style: ${settings.responseStyle}`,
      memoryCtx,
      '',
      `Guidelines:`,
      `- You are loyal exclusively to ${userName}.`,
      `- Speak in a professional, engaging style.`,
      `- Never claim to be Deion AI unless the user's name is Deion.`,
    ].join('\n');

    const fullPrompt = `${systemPrompt}\n\n${userName}: ${prompt}\n${agentDisplayName}:`;

    const response = await AIRouter.generateText({
      mode: 'GENERAL',
      prompt: fullPrompt,
      providerOverride,
    });

    // Auto-save memory if user is sharing a preference or fact
    if (
      settings.memoryEnabled &&
      (prompt.toLowerCase().includes('remember') ||
        prompt.toLowerCase().includes('my favorite') ||
        prompt.toLowerCase().includes('i prefer') ||
        prompt.toLowerCase().includes('i always'))
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

  /**
   * Create and fully execute an autonomous task.
   *
   * Flow:
   *   1. Create task record (PLANNING)
   *   2. Determine execution plan (keyword analysis — no AI call needed)
   *   3. Optional memory recall
   *   4. Optional tool calls (ONLY if the task explicitly requires them)
   *   5. AI generation (AIRouter.generateText — Ollama → Gemini → Groq)
   *   6. Validate result (non-empty, non-generic, content checks)
   *   7. Persist COMPLETED | FAILED with real provider/model/result
   *
   * Security: userId is always scoped — tools only access that user's data.
   * Vercel: All state in Neon PostgreSQL. No local-FS or in-memory state.
   */
  static async createAndRunTask(userId: string, title: string, description: string) {
    const startTime = Date.now();
    let stepCounter = 0;

    // Fetch the user's display name for the AI prompt
    const userRecord = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });
    const userName = userRecord?.name || 'User';

    // ── 1. Create task record ──────────────────────────────────────────────
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

    await logAudit(userId, task.id, 'TASK_CREATED', `Task "${title}" created.`);

    try {
      // ── 2. Planning step ────────────────────────────────────────────────
      await logAudit(userId, task.id, 'TASK_PLANNING', `Planning execution for: "${title}"`);
      const plan = determineExecutionPlan(title, description);

      stepCounter++;
      const planStep = await createStep(task.id, stepCounter, 'Plan execution strategy', 'RUNNING');
      await setTaskStatus(task.id, 'PLANNING', 12, {
        executionPlanJson: JSON.stringify(plan),
      });

      const planStepResult = [
        `Task type: ${plan.taskType}.`,
        plan.rationale,
        plan.toolsToCall.length > 0
          ? `Tools to run: ${plan.toolsToCall.join(', ')}.`
          : 'No data tools required.',
      ].join(' ');

      await completeStep(planStep.id, planStepResult);

      // ── 3. Memory recall (always lightweight — no round trip to AI) ─────
      const settings = await this.getUserSettings(userId, userName);
      let memories: { category: string; content: string }[] = [];

      if (settings.memoryEnabled) {
        stepCounter++;
        const memStep = await createStep(task.id, stepCounter, 'Recall relevant memories', 'RUNNING');
        const rawMems = await AgentMemoryService.recallRelevantMemories(
          userId,
          `${title} ${description}`,
          5
        );
        memories = rawMems.map((m) => ({ category: m.category, content: m.content }));
        await completeStep(
          memStep.id,
          memories.length > 0
            ? `Recalled ${memories.length} relevant ${memories.length === 1 ? 'memory' : 'memories'}: ${memories.map((m) => m.content.slice(0, 60)).join('; ')}`
            : 'No relevant memories found for this task.'
        );
      }

      // ── 4. Tool execution (only for tasks that explicitly need it) ──────
      await setTaskStatus(task.id, 'RUNNING', 30);
      const toolResults: { toolName: string; result: unknown }[] = [];

      for (const toolName of plan.toolsToCall) {
        stepCounter++;
        const toolStep = await createStep(task.id, stepCounter, `Tool: ${toolName}`, 'RUNNING');
        await logAudit(userId, task.id, 'TOOL_STARTED', `Executing tool: ${toolName}`, { toolName });

        // Build tool arguments
        const toolArgs: Record<string, unknown> = {};
        if (toolName === 'search_study_library') {
          // Use the full query for better matching
          toolArgs.query = title;
        }
        if (toolName === 'search_agent_memories') {
          toolArgs.query = `${title} ${description}`;
        }

        const toolRes = await AgentToolRegistry.executeTool(userId, toolName, toolArgs, task.id);

        if (!toolRes.success) {
          await failStep(toolStep.id, `Tool ${toolName} failed: ${toolRes.error}`, toolName);
          await logAudit(userId, task.id, 'TOOL_FAILED', `Tool ${toolName} failed: ${toolRes.error}`);
          // Non-fatal: continue with whatever data we have
        } else {
          toolResults.push({ toolName, result: toolRes.result });

          // Build a human-readable summary of what the tool found
          let toolResultSummary: string;
          if (toolName === 'search_study_library') {
            const count = toolRes.result?.count ?? 0;
            toolResultSummary = count === 0
              ? 'Found 0 study documents matching the query. No uploaded documents available for this topic.'
              : `Found ${count} study document(s): ${(toolRes.result?.documents ?? []).map((d: { title: string }) => d.title).join(', ')}`;
          } else if (toolName === 'list_user_tasks') {
            toolResultSummary = `Retrieved ${toolRes.result?.total ?? 0} user tasks.`;
          } else if (toolName === 'list_user_habits') {
            const h = toolRes.result?.habits ?? [];
            toolResultSummary = h.length === 0 ? 'No habits found.' : `Retrieved ${h.length} habits.`;
          } else if (toolName === 'get_career_applications') {
            const apps = toolRes.result?.applications ?? [];
            toolResultSummary = apps.length === 0 ? 'No career applications found.' : `Retrieved ${apps.length} applications.`;
          } else {
            toolResultSummary = 'Tool executed successfully.';
          }

          await completeStep(toolStep.id, toolResultSummary, toolName);
          await logAudit(userId, task.id, 'TOOL_COMPLETED', `Tool ${toolName} completed.`, {
            result: toolRes.result,
          });
        }
      }

      // ── 5. AI Generation ────────────────────────────────────────────────
      stepCounter++;
      const aiStep = await createStep(task.id, stepCounter, 'Generate AI response', 'RUNNING');
      await setTaskStatus(task.id, 'RUNNING', 60);
      await logAudit(
        userId,
        task.id,
        'AI_GENERATION_STARTED',
        `Calling AI provider cascade (Ollama → Gemini → Groq) for: "${title}"`
      );

      const executionPrompt = buildExecutionPrompt(
        userName,
        title,
        description,
        toolResults,
        memories
      );

      // Use the EXISTING AIRouter — never bypass the cascade
      let aiResponse: {
        result: string;
        provider: string;
        model: string;
        fallbackOccurred?: boolean;
        fallbackChain?: string[];
      };

      try {
        aiResponse = await AIRouter.generateText({
          mode: 'GENERAL',
          prompt: executionPrompt,
        });
      } catch (aiErr: unknown) {
        const errMsg = aiErr instanceof Error ? aiErr.message : String(aiErr);
        await failStep(aiStep.id, `All AI providers failed: ${errMsg}`);
        await logAudit(userId, task.id, 'AI_PROVIDER_FAILED', errMsg);
        await markTaskFailed(task.id, userId, `AI providers unavailable: ${errMsg}`, 65);
        return prisma.agentTask.findUnique({
          where: { id: task.id },
          include: {
            steps: { orderBy: { stepIndex: 'asc' } },
            auditLogs: { orderBy: { timestamp: 'desc' } },
          },
        });
      }

      await logAudit(
        userId,
        task.id,
        'AI_PROVIDER_SELECTED',
        `Provider used: ${aiResponse.provider} / ${aiResponse.model}`,
        {
          provider: aiResponse.provider,
          model: aiResponse.model,
          fallbackOccurred: aiResponse.fallbackOccurred ?? false,
          fallbackChain: aiResponse.fallbackChain ?? [],
        }
      );

      const providerLabel = aiResponse.fallbackOccurred
        ? `${aiResponse.provider} (tried: ${aiResponse.fallbackChain?.join(' → ')} first)`
        : aiResponse.provider;

      await completeStep(
        aiStep.id,
        `Generated ${aiResponse.result.length} chars via ${providerLabel} (${aiResponse.model}).`
      );

      await logAudit(
        userId,
        task.id,
        'AI_GENERATION_COMPLETED',
        `AI generation done. Provider: ${aiResponse.provider}, Model: ${aiResponse.model}`
      );

      // ── 6. Validation ──────────────────────────────────────────────────
      stepCounter++;
      const valStep = await createStep(task.id, stepCounter, 'Validate result', 'RUNNING');
      await setTaskStatus(task.id, 'VALIDATING', 85);
      await logAudit(userId, task.id, 'VALIDATION_STARTED', 'Running result validation checks...');

      const validation = validateResult(title, description, aiResponse.result);
      const durationMs = Date.now() - startTime;

      if (validation.passed) {
        await completeStep(valStep.id, validation.notes);
        await logAudit(
          userId,
          task.id,
          'VALIDATION_COMPLETED',
          `Validation passed. ${validation.notes}`
        );

        // ── 7a. COMPLETED ───────────────────────────────────────────────
        await prisma.agentTask.update({
          where: { id: task.id },
          data: {
            status: 'COMPLETED',
            progress: 100,
            resultSummary: aiResponse.result,
            providerUsed: aiResponse.provider,
            modelUsed: aiResponse.model,
            fallbackChain: aiResponse.fallbackChain
              ? JSON.stringify(aiResponse.fallbackChain)
              : null,
            validationPassed: true,
            validationNotes: validation.notes,
            durationMs,
          },
        });

        await logAudit(
          userId,
          task.id,
          'TASK_COMPLETED',
          `Task "${title}" completed in ${(durationMs / 1000).toFixed(1)}s via ${aiResponse.provider}.`
        );
      } else {
        // ── 7b. FAILED (validation) ─────────────────────────────────────
        await failStep(valStep.id, validation.notes);
        await logAudit(
          userId,
          task.id,
          'TASK_VALIDATION_FAILED',
          validation.notes
        );

        // Still persist the AI result so the user can see what was generated
        await prisma.agentTask.update({
          where: { id: task.id },
          data: {
            status: 'FAILED',
            progress: 90,
            resultSummary: aiResponse.result, // persist partial result
            providerUsed: aiResponse.provider,
            modelUsed: aiResponse.model,
            fallbackChain: aiResponse.fallbackChain
              ? JSON.stringify(aiResponse.fallbackChain)
              : null,
            validationPassed: false,
            validationNotes: validation.notes,
            errorMessage: validation.notes,
            durationMs,
          },
        });

        await logAudit(userId, task.id, 'TASK_FAILED', validation.notes);
      }

      return prisma.agentTask.findUnique({
        where: { id: task.id },
        include: {
          steps: { orderBy: { stepIndex: 'asc' } },
          auditLogs: { orderBy: { timestamp: 'desc' } },
        },
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error('[AGENT ENGINE] Unexpected error during task execution:', errMsg);
      await markTaskFailed(task.id, userId, `Execution error: ${errMsg}`, 0);
      return prisma.agentTask.findUnique({
        where: { id: task.id },
        include: {
          steps: { orderBy: { stepIndex: 'asc' } },
          auditLogs: { orderBy: { timestamp: 'desc' } },
        },
      });
    }
  }
}

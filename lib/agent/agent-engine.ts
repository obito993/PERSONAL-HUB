/**
 * DEION HUB — Autonomous Agent Execution Engine
 *
 * Architecture:
 *   CREATED → PLANNING → RUNNING → VALIDATING → COMPLETED | FAILED
 *
 * Task Types:
 *   AI_GENERATION  = pure LLM content generation (e.g., math, code snippets)
 *   STUDY_DOCUMENT = queries user's uploaded study PDFs/textbooks
 *   DATA_QUERY     = queries user's tasks, habits, career data
 *   MEMORY_RECALL  = queries agent memory
 *   WEB_RESEARCH   = performs real server-side web research via web_search tool
 *   MIXED          = combination of above
 *
 * Provider cascade: Ollama → Gemini → Groq  (AIRouter)
 * Safety: Every task has a controlled lifecycle and WILL NEVER remain stuck in RUNNING.
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

type TaskType =
  | 'AI_GENERATION'
  | 'STUDY_DOCUMENT'
  | 'DATA_QUERY'
  | 'MEMORY_RECALL'
  | 'WEB_RESEARCH'
  | 'MIXED';

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

  // Ensure NO task step is left stuck in RUNNING or PENDING state
  await prisma.agentTaskStep.updateMany({
    where: {
      taskId,
      status: { in: ['RUNNING', 'PENDING'] },
    },
    data: {
      status: 'FAILED',
      resultText: reason,
    },
  });

  await logAudit(userId, taskId, 'TASK_FAILED', reason);
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 1: Execution plan determination
// ─────────────────────────────────────────────────────────────────────────────

function determineExecutionPlan(title: string, description: string): ExecutionPlan {
  const combined = `${title} ${description}`.toLowerCase().trim();

  // ── Web Research triggers: explicit web research / source fetching requests ──
  const researchTriggers = [
    'web search', 'web research', 'search the web', 'search online',
    'find sources', 'online sources', 'latest news', 'current news',
    'current market', 'find current information', 'find current info',
    'research the typical', 'research responsibilities', 'research data analyst'
  ];
  const requiresResearch = researchTriggers.some((t) => combined.includes(t));

  // ── Study library triggers: explicit user upload references ──
  const studyTriggers = [
    'my pdf', 'my textbook', 'uploaded', 'my notes', 'my document',
    'my book', 'my lecture', 'my study material', 'study library',
    'my uploaded', 'summarize my', 'from my study',
  ];
  const requiresStudy = studyTriggers.some((t) => combined.includes(t));

  // ── Data query triggers ──
  const habitTriggers = ['my habits', 'my habit list', 'active habits', 'habit tracker'];
  const taskTriggers = ['my task list', 'my tasks', 'list my tasks', 'what tasks'];
  const careerTriggers = ['my job applications', 'my career applications', 'my applications', 'job list'];

  const requiresHabits = habitTriggers.some((t) => combined.includes(t));
  const requiresTasks = taskTriggers.some((t) => combined.includes(t));
  const requiresCareer = careerTriggers.some((t) => combined.includes(t));
  const requiresData = requiresHabits || requiresTasks || requiresCareer;

  // ── Memory recall triggers ──
  const memoryTriggers = [
    'what did i tell you', 'what did i say', 'do you remember',
    'recall what i said', 'my preference', 'what i told you',
    'from our conversation', 'you previously',
  ];
  const requiresMemory = memoryTriggers.some((t) => combined.includes(t));

  // Build tools list
  const toolsToCall: string[] = [];
  if (requiresResearch) toolsToCall.push('web_search');
  if (requiresStudy) toolsToCall.push('search_study_library');
  if (requiresTasks) toolsToCall.push('list_user_tasks');
  if (requiresHabits) toolsToCall.push('list_user_habits');
  if (requiresCareer) toolsToCall.push('get_career_applications');
  if (requiresMemory) toolsToCall.push('search_agent_memories');

  // Classify task type
  let taskType: TaskType = 'AI_GENERATION';
  const activeTypesCount = [requiresResearch, requiresStudy, requiresData, requiresMemory].filter(Boolean).length;

  if (activeTypesCount > 1) {
    taskType = 'MIXED';
  } else if (requiresResearch) {
    taskType = 'WEB_RESEARCH';
  } else if (requiresStudy) {
    taskType = 'STUDY_DOCUMENT';
  } else if (requiresData) {
    taskType = 'DATA_QUERY';
  } else if (requiresMemory) {
    taskType = 'MEMORY_RECALL';
  }

  const rationale = toolsToCall.length > 0
    ? `Task requires execution of tools: ${toolsToCall.join(', ')}.`
    : 'Pure AI content-generation task. Calling AI provider directly.';

  return { taskType, rationale, toolsToCall };
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 2: Build AI execution prompt
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

  const hasWebResearch = toolResults.some((tr) => tr.toolName === 'web_search');

  if (toolResults.length > 0) {
    lines.push('');
    lines.push('REAL RESEARCH & DATA RETRIEVED FOR THIS TASK:');
    for (const tr of toolResults) {
      lines.push(`[${tr.toolName}]:`);
      lines.push(JSON.stringify(tr.result, null, 2));
    }
  }

  lines.push('');
  lines.push('EXECUTION & FORMATTING RULES:');
  lines.push('1. Execute the task COMPLETELY with exhaustive detail.');
  lines.push('2. If the task involves research or web searching, base your findings on the retrieved data provided above.');
  lines.push('3. When formatting research results, structure your output into these clear markdown sections:');
  lines.push('   - SUMMARY');
  lines.push('   - KEY FINDINGS');
  lines.push('   - PRIORITIZED CHECKLIST (if requested or applicable)');
  lines.push('   - SOURCES (list titles and URLs from the retrieved web_search data)');
  lines.push('4. Do NOT produce a generic placeholder message. Produce the actual requested content.');

  return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 3: Validate result
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

  // Hard fail: known generic completion strings
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

  // ── Math validation check ──
  const combined = `${title} ${description}`.toLowerCase();
  const mathMatch = combined.match(/calculate\s+([\d,.\s]+)\s*[×x*]\s*([\d,.\s]+)/i);
  if (mathMatch) {
    const a = parseInt(mathMatch[1].replace(/[,.\s]/g, ''), 10);
    const b = parseInt(mathMatch[2].replace(/[,.\s]/g, ''), 10);
    if (!isNaN(a) && !isNaN(b)) {
      const expected = a * b;
      const resultStripped = result.replace(/,/g, '').replace(/\s/g, '');
      const expectedStr = expected.toString();
      const expectedFormatted = expected.toLocaleString('en-US');
      if (!resultStripped.includes(expectedStr) && !result.includes(expectedFormatted)) {
        return {
          passed: false,
          notes: `Math task expected ${expectedFormatted} (${a} × ${b}) but was not found in the response.`,
        };
      }
    }
  }

  // Pass — substantive response
  return {
    passed: true,
    notes: `Validated. Length: ${trimmed.length} chars.`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// AgentEngine — public class
// ─────────────────────────────────────────────────────────────────────────────

export class AgentEngine {
  static async getUserSettings(userId: string, userName?: string) {
    let settings = await prisma.userAISettings.findUnique({ where: { userId } });
    if (!settings) {
      const firstName = userName ? userName.trim().split(' ')[0] : 'Personal';
      settings = await prisma.userAISettings.create({
        data: {
          userId,
          customName: `${firstName}'s Agent`,
          personality: 'helpful',
          memoryEnabled: true,
        },
      });
    }
    return settings;
  }

  static async processAgentChat(userId: string, message: string, history: any[] = []) {
    const userRecord = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });
    const userName = userRecord?.name || 'Hero';
    const settings = await this.getUserSettings(userId, userName);

    let memories: { category: string; content: string }[] = [];
    if (settings.memoryEnabled) {
      const rawMems = await AgentMemoryService.recallRelevantMemories(userId, message, 3);
      memories = rawMems.map((m) => ({ category: m.category, content: m.content }));
    }

    const firstName = userName.trim().split(' ')[0];
    const agentDisplayName = settings.customName || `${firstName}'s AI Agent`;

    const systemContext = [
      `You are ${agentDisplayName}, the dedicated Personal AI Agent for ${userName}.`,
      `Personality: ${settings.personality}.`,
      `Always address the user by name (${userName}).`,
    ];

    if (memories.length > 0) {
      systemContext.push('Relevant User Memories:');
      for (const m of memories) {
        systemContext.push(`- [${m.category.toUpperCase()}] ${m.content}`);
      }
    }

    const fullPrompt = `${systemContext.join('\n')}\n\nUser Message: ${message}`;

    const response = await AIRouter.generateText({
      mode: 'GENERAL',
      prompt: fullPrompt,
    });


    if (
      settings.memoryEnabled &&
      (message.toLowerCase().includes('remember') ||
        message.toLowerCase().includes('my favorite') ||
        message.toLowerCase().includes('i prefer') ||
        message.toLowerCase().includes('i always'))
    ) {
      await AgentMemoryService.saveMemory(userId, 'preference', message, 'conversation_auto', 2);
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
   * Create and fully execute an autonomous task with timeout protection.
   * Safety Guarantee: Task will NEVER remain stuck in RUNNING or PLANNING.
   */
  static async createAndRunTask(userId: string, title: string, description: string) {
    const startTime = Date.now();
    let stepCounter = 0;

    const userRecord = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });
    const userName = userRecord?.name || 'User';

    // ── 1. Create task record (PLANNING) ──────────────────────────────────
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

    // Timeout guard (45 seconds timeout)
    const taskExecutionPromise = (async () => {
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

      // ── 3. Memory recall ────────────────────────────────────────────────
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
            ? `Recalled ${memories.length} relevant memories.`
            : 'No relevant memories found for this task.'
        );
      }

      // ── 4. Tool execution (including Web Research) ──────────────────────
      await setTaskStatus(task.id, 'RUNNING', 30);
      const toolResults: { toolName: string; result: unknown }[] = [];

      for (const toolName of plan.toolsToCall) {
        stepCounter++;
        const toolStep = await createStep(task.id, stepCounter, `Tool: ${toolName}`, 'RUNNING');
        await logAudit(userId, task.id, 'TOOL_STARTED', `Executing tool: ${toolName}`, { toolName });

        const toolArgs: Record<string, unknown> = {};
        if (toolName === 'web_search') {
          toolArgs.query = title;
        } else if (toolName === 'search_study_library') {
          toolArgs.query = title;
        } else if (toolName === 'search_agent_memories') {
          toolArgs.query = `${title} ${description}`;
        }

        const toolRes = await AgentToolRegistry.executeTool(userId, toolName, toolArgs, task.id);

        if (!toolRes.success) {
          await failStep(toolStep.id, `Tool ${toolName} failed: ${toolRes.error}`, toolName);
          await logAudit(userId, task.id, 'TOOL_FAILED', `Tool ${toolName} failed: ${toolRes.error}`);
        } else {
          toolResults.push({ toolName, result: toolRes.result });

          let toolResultSummary: string;
          if (toolName === 'web_search') {
            const count = toolRes.result?.count ?? 0;
            toolResultSummary = count === 0
              ? 'Web search completed. 0 web results found.'
              : `Gathered web research from ${count} source(s): ${(toolRes.result?.sources ?? []).map((s: { title: string }) => s.title).join(', ')}`;
          } else if (toolName === 'search_study_library') {
            const count = toolRes.result?.count ?? 0;
            toolResultSummary = count === 0
              ? 'Found 0 study documents matching the query.'
              : `Found ${count} study document(s): ${(toolRes.result?.documents ?? []).map((d: { title: string }) => d.title).join(', ')}`;
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
      const aiStep = await createStep(task.id, stepCounter, 'Synthesize AI response', 'RUNNING');
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

      await completeStep(
        aiStep.id,
        `Generated response (${aiResponse.result.length} chars) via ${aiResponse.provider} (${aiResponse.model}).`
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
        await failStep(valStep.id, validation.notes);
        await prisma.agentTask.update({
          where: { id: task.id },
          data: {
            status: 'FAILED',
            progress: 90,
            resultSummary: aiResponse.result,
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
    })();

    // Race against 50s outer timeout to guarantee task NEVER stays RUNNING
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 50000);
    });

    const result = await Promise.race([taskExecutionPromise, timeoutPromise]);

    if (result === null) {
      console.warn(`[AGENT ENGINE] Task ${task.id} timed out after 50 seconds.`);
      const plan = determineExecutionPlan(title, description);
      let timeoutMsg: string;
      if (plan.taskType === 'WEB_RESEARCH') {
        timeoutMsg = 'WEB_RESEARCH_TIMEOUT: Web research task timed out after 50 seconds.';
      } else if (plan.taskType === 'AI_GENERATION') {
        timeoutMsg = 'AI_PROVIDER_TIMEOUT: Execution timed out after 50 seconds. AI provider cascade did not finish in time.';
      } else if (plan.taskType === 'STUDY_DOCUMENT') {
        timeoutMsg = 'TOOL_TIMEOUT: Study document query timed out after 50 seconds.';
      } else {
        timeoutMsg = 'TASK_EXECUTION_TIMEOUT: Task execution timed out after 50 seconds.';
      }

      await markTaskFailed(
        task.id,
        userId,
        timeoutMsg,
        50
      );
    }

    return prisma.agentTask.findUnique({
      where: { id: task.id },
      include: {
        steps: { orderBy: { stepIndex: 'asc' } },
        auditLogs: { orderBy: { timestamp: 'desc' } },
      },
    });
  }
}

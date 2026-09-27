/**
 * DEION HUB — Scheduled Automation Runner & Safety Checker
 *
 * Checks:
 *   1. Automation exists in DB
 *   2. Automation belongs to the specified user
 *   3. Automation is ACTIVE (enabled === true)
 *   4. Automation has not been deleted
 *
 * If deleted while scheduled, execution is skipped and cancelled safely.
 */

import { PrismaClient } from '@prisma/client';
import { AgentEngine } from './agent-engine';

const prisma = new PrismaClient();

export class AgentAutomationRunner {
  /**
   * Run a specific scheduled automation with full safety validation.
   */
  static async runAutomation(userId: string, automationId: string) {
    // 1. Fetch & verify existence, ownership, and active state
    const automation = await prisma.agentAutomation.findFirst({
      where: {
        id: automationId,
        userId, // strict user isolation
      },
    });

    // Safety check: if automation was deleted or disabled, SKIP execution
    if (!automation) {
      console.warn(`[AUTOMATION RUNNER] Skipped: Automation ${automationId} was deleted or not found.`);
      return { success: false, reason: 'DELETED_OR_NOT_FOUND' };
    }

    if (!automation.enabled) {
      console.warn(`[AUTOMATION RUNNER] Skipped: Automation "${automation.title}" is PAUSED.`);
      return { success: false, reason: 'PAUSED' };
    }

    // 2. Execute via AgentEngine as an autonomous task
    try {
      const taskTitle = `[AUTOMATION] ${automation.title}`;
      const task = await AgentEngine.createAndRunTask(
        userId,
        taskTitle,
        automation.prompt
      );

      // Calculate next run date
      const now = new Date();
      let nextRunAt: Date | null = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      if (automation.schedule === 'weekly') {
        nextRunAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      } else if (automation.schedule === 'one-time') {
        nextRunAt = null; // completed
      }

      // Update last run status on automation record
      await prisma.agentAutomation.update({
        where: { id: automation.id },
        data: {
          lastRunAt: now,
          lastRunStatus: task?.status || 'COMPLETED',
          lastRunResult: task?.resultSummary?.slice(0, 500) || 'Task completed.',
          nextRunAt,
          enabled: automation.schedule === 'one-time' ? false : automation.enabled,
        },
      });

      return { success: true, task };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[AUTOMATION RUNNER] Execution error for "${automation.title}":`, msg);

      await prisma.agentAutomation.update({
        where: { id: automation.id },
        data: {
          lastRunAt: new Date(),
          lastRunStatus: 'FAILED',
          lastRunResult: `Execution error: ${msg}`,
        },
      });

      return { success: false, reason: msg };
    }
  }

  /**
   * Process all pending active automations that are due for execution.
   */
  static async processDueAutomations() {
    const now = new Date();
    const dueAutomations = await prisma.agentAutomation.findMany({
      where: {
        enabled: true,
        OR: [
          { nextRunAt: { lte: now } },
          { nextRunAt: null },
        ],
      },
    });

    const results = [];
    for (const auto of dueAutomations) {
      const res = await this.runAutomation(auto.userId, auto.id);
      results.push({ id: auto.id, title: auto.title, result: res });
    }

    return results;
  }
}

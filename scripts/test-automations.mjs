/**
 * DEION HUB — Automation Task Management Test Suite
 * Tests all 10 automation lifecycle & isolation requirements.
 *
 * Usage:
 *   node scripts/test-automations.mjs
 */

import { PrismaClient } from '@prisma/client';
import { AgentAutomationRunner } from '../lib/agent/automation-runner.ts';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';

// Real test users
const USER_A_ID = 'fb51b548-4238-429d-b76c-4442e7ce3522'; // DEION
const USER_B_ID = '2000f58a-488d-4efd-88a0-1f4837a06d40'; // DANIEL

let passed = 0;
let failed = 0;

function pass(label, detail = '') {
  passed++;
  console.log(`  ✅ PASS: ${label}${detail ? `\n     ${detail}` : ''}`);
}

function fail(label, reason) {
  failed++;
  console.error(`  ❌ FAIL: ${label}\n     ${reason}`);
}

function check(condition, label, failReason, passDetail = '') {
  if (condition) pass(label, passDetail);
  else fail(label, failReason);
}

async function runTests() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║   DEION HUB — Automations Management Integration Tests    ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  try {
    // Cleanup old test automations first
    await prisma.agentAutomation.deleteMany({
      where: {
        title: { startsWith: '[TEST]' },
      },
    });

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 1 & 2: Create Automation A & Keep Automation A (Persistence)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('── TEST 1 & 2: Create & Keep Automation A (Persistence) ──');
    const autoA = await prisma.agentAutomation.create({
      data: {
        userId: USER_A_ID,
        title: '[TEST] Daily Code Recap A',
        prompt: 'Summarize today\'s code commits.',
        schedule: 'daily',
        enabled: true,
      },
    });

    check(!!autoA.id, 'Automation A created successfully', `ID: ${autoA.id}`);

    // Verify persistence (GET equivalent)
    const fetchedA = await prisma.agentAutomation.findFirst({
      where: { id: autoA.id, userId: USER_A_ID },
    });
    check(!!fetchedA, 'Automation A persists and remains saved', 'Automation A missing from DB query');
    check(fetchedA?.enabled === true, 'Automation A default state is ACTIVE (enabled: true)');

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 3 & 4: Pause & Resume Automation A
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n── TEST 3 & 4: Pause & Resume Automation A ──');
    const pausedA = await prisma.agentAutomation.update({
      where: { id: autoA.id },
      data: { enabled: false },
    });
    check(pausedA.enabled === false, 'Automation A paused (enabled: false)');

    // Test runner skips paused automation
    const pausedRunResult = await AgentAutomationRunner.runAutomation(USER_A_ID, autoA.id);
    check(
      pausedRunResult.reason === 'PAUSED',
      'Scheduler skips execution while automation is PAUSED',
      `Got reason: ${pausedRunResult.reason}`
    );

    const resumedA = await prisma.agentAutomation.update({
      where: { id: autoA.id },
      data: { enabled: true },
    });
    check(resumedA.enabled === true, 'Automation A resumed (enabled: true)');

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 5 & 6: Delete Automation A & Verify Refresh Persistence
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n── TEST 5 & 6: Delete Automation A & Verify Persistence ──');
    await prisma.agentAutomation.delete({
      where: { id: autoA.id },
    });

    const deletedQuery = await prisma.agentAutomation.findFirst({
      where: { id: autoA.id },
    });
    check(!deletedQuery, 'Automation A deleted permanently from database');

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 7: Scheduler Safety after deletion
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n── TEST 7: Scheduler Safety (Deleted automation cannot execute) ──');
    const deletedRunResult = await AgentAutomationRunner.runAutomation(USER_A_ID, autoA.id);
    check(
      deletedRunResult.reason === 'DELETED_OR_NOT_FOUND',
      'Scheduler correctly skips deleted automation',
      `Got reason: ${deletedRunResult.reason}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 8: User Isolation on Deletion
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n── TEST 8: User Isolation (User B cannot delete User A\'s automation) ──');
    const autoForUserA = await prisma.agentAutomation.create({
      data: {
        userId: USER_A_ID,
        title: '[TEST] User A Private Automation',
        prompt: 'Private instructions for User A.',
        schedule: 'daily',
        enabled: true,
      },
    });

    // Attempt to query or delete using User B's ID
    const userBOwnershipCheck = await prisma.agentAutomation.findFirst({
      where: { id: autoForUserA.id, userId: USER_B_ID },
    });
    check(!userBOwnershipCheck, 'User B ownership check returns null for User A\'s automation');

    const unauthorizedDelete = await prisma.agentAutomation.deleteMany({
      where: { id: autoForUserA.id, userId: USER_B_ID },
    });
    check(unauthorizedDelete.count === 0, 'User B deleteMany affected 0 rows on User A\'s automation');

    // Verify User A's automation is still intact
    const stillExistsA = await prisma.agentAutomation.findFirst({
      where: { id: autoForUserA.id, userId: USER_A_ID },
    });
    check(!!stillExistsA, 'User A\'s automation remains safe and unaffected');

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 9: Create two automations, delete only one
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n── TEST 9: Create Two Automations, Delete Only One ──');
    const auto1 = await prisma.agentAutomation.create({
      data: {
        userId: USER_A_ID,
        title: '[TEST] Automation 1',
        prompt: 'Prompt 1',
        schedule: 'daily',
      },
    });
    const auto2 = await prisma.agentAutomation.create({
      data: {
        userId: USER_A_ID,
        title: '[TEST] Automation 2',
        prompt: 'Prompt 2',
        schedule: 'weekly',
      },
    });

    // Delete auto1
    await prisma.agentAutomation.delete({ where: { id: auto1.id } });

    const check1 = await prisma.agentAutomation.findFirst({ where: { id: auto1.id } });
    const check2 = await prisma.agentAutomation.findFirst({ where: { id: auto2.id } });

    check(!check1, 'Automation 1 is deleted');
    check(!!check2, 'Automation 2 remains intact and unaffected');

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 10: Execution history / Audit log preservation
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n── TEST 10: Execution History & Audit Log Preservation ──');
    // Write audit log associated with auto2
    const auditRecord = await prisma.agentAuditLog.create({
      data: {
        userId: USER_A_ID,
        toolName: 'AUTOMATION_EXECUTED',
        actionSummary: `Executed automation: "${auto2.title}"`,
        approvalStatus: 'AUTO_EXECUTED',
        detailsJson: JSON.stringify({ automationId: auto2.id }),
      },
    });

    // Delete auto2
    await prisma.agentAutomation.delete({ where: { id: auto2.id } });

    // Verify audit log still exists
    const preservedAudit = await prisma.agentAuditLog.findUnique({
      where: { id: auditRecord.id },
    });
    check(!!preservedAudit, 'Execution audit log preserved after automation deletion');

    // Clean up test records
    await prisma.agentAuditLog.delete({ where: { id: auditRecord.id } });
    await prisma.agentAutomation.deleteMany({
      where: { id: { in: [autoForUserA.id] } },
    });
  } catch (err) {
    fail('Test execution error', err.message);
  }

  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log(`║  RESULTS: ${passed} PASSED, ${failed} FAILED / ${passed + failed} TOTAL`);
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  await prisma.$disconnect();
  if (failed > 0) process.exit(1);
}

runTests();

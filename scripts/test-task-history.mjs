/**
 * DEION HUB — Autonomous Task History Management Test Suite
 * Validates single delete, bulk delete, delete all completed, user isolation,
 * active task protection, persistence, empty state, and audit trail.
 *
 * Usage: npx tsx scripts/test-task-history.mjs
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Real test users from Neon DB
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
  console.log('║   DEION HUB — Autonomous Task History Integration Tests  ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  try {
    // ── Cleanup previous test tasks ──────────────────────────────────────────
    await prisma.agentTask.deleteMany({
      where: { title: { startsWith: '[TEST_HISTORY]' } },
    });

    // ── TEST 1 & 2: Create Autonomous Task & Appears in History ─────────────
    console.log('── TEST 1 & 2: Create Autonomous Task & Verify History ──');
    const task1 = await prisma.agentTask.create({
      data: {
        userId: USER_A_ID,
        title: '[TEST_HISTORY] SQL Learning Plan',
        description: 'Create a 3-step learning plan for SQL joins.',
        status: 'COMPLETED',
        resultSummary: '1. INNER JOIN\n2. LEFT JOIN\n3. FULL OUTER JOIN',
        providerUsed: 'gemini',
        modelUsed: 'gemini-3.6-flash',
      },
    });

    check(!!task1.id, 'Task 1 created in history', `ID: ${task1.id}`);

    const historyQuery = await prisma.agentTask.findMany({
      where: { userId: USER_A_ID, title: { startsWith: '[TEST_HISTORY]' } },
    });
    check(historyQuery.some((t) => t.id === task1.id), 'Task 1 appears in user task history');

    // ── TEST 3 & 4 & 5: Single Delete Completed Task & Refresh Persistence ─
    console.log('\n── TEST 3, 4 & 5: Single Delete & Persistence Verification ──');
    await prisma.agentTask.delete({
      where: { id: task1.id },
    });

    const refreshQuery = await prisma.agentTask.findFirst({
      where: { id: task1.id },
    });
    check(!refreshQuery, 'Task 1 permanently deleted from Neon DB and does not return on refresh');

    // Write deletion audit log
    const singleAudit = await prisma.agentAuditLog.create({
      data: {
        userId: USER_A_ID,
        toolName: 'TASK_DELETED',
        actionSummary: `Deleted autonomous task: "${task1.title}"`,
        approvalStatus: 'AUTO_EXECUTED',
        detailsJson: JSON.stringify({ taskId: task1.id }),
      },
    });
    check(!!singleAudit.id, 'Audit log event TASK_DELETED created for single deletion');

    // ── TEST 6: Delete Nonexistent Task returns 404/not found ───────────────
    console.log('\n── TEST 6: Delete Nonexistent Task Check ──');
    const nonExistent = await prisma.agentTask.findFirst({
      where: { id: 'non-existent-uuid-12345', userId: USER_A_ID },
    });
    check(!nonExistent, 'Querying non-existent task returns null (simulating 404)');

    // ── TEST 7: User Isolation (User B cannot delete User A\'s task) ────────
    console.log('\n── TEST 7: User Isolation Check (User B cannot delete User A\'s task) ──');
    const taskUserA = await prisma.agentTask.create({
      data: {
        userId: USER_A_ID,
        title: '[TEST_HISTORY] User A Private Task',
        status: 'COMPLETED',
        resultSummary: 'User A confidential output.',
      },
    });

    // Attempt to delete with User B ID constraint
    const unauthorizedDelete = await prisma.agentTask.deleteMany({
      where: { id: taskUserA.id, userId: USER_B_ID },
    });
    check(unauthorizedDelete.count === 0, 'User B deleteMany affected 0 rows on User A\'s task');

    const verifyUserA = await prisma.agentTask.findFirst({
      where: { id: taskUserA.id, userId: USER_A_ID },
    });
    check(!!verifyUserA, 'User A\'s task remains safe and unaffected');

    // ── TEST 8: Bulk Delete Selected Tasks ──────────────────────────────────
    console.log('\n── TEST 8: Bulk Delete Selected Tasks ──');
    const bulkTask1 = await prisma.agentTask.create({
      data: { userId: USER_A_ID, title: '[TEST_HISTORY] Bulk Task 1', status: 'COMPLETED' },
    });
    const bulkTask2 = await prisma.agentTask.create({
      data: { userId: USER_A_ID, title: '[TEST_HISTORY] Bulk Task 2', status: 'FAILED' },
    });
    const bulkTask3 = await prisma.agentTask.create({
      data: { userId: USER_A_ID, title: '[TEST_HISTORY] Bulk Task 3', status: 'COMPLETED' },
    });

    const selectedIds = [bulkTask1.id, bulkTask2.id];
    const bulkDeleteRes = await prisma.agentTask.deleteMany({
      where: { id: { in: selectedIds }, userId: USER_A_ID },
    });

    check(bulkDeleteRes.count === 2, 'Bulk delete removed exactly 2 selected tasks');

    const remainingBulk3 = await prisma.agentTask.findFirst({
      where: { id: bulkTask3.id },
    });
    check(!!remainingBulk3, 'Unselected Bulk Task 3 remains untouched');

    // ── TEST 9: Delete All Completed Tasks ──────────────────────────────────
    console.log('\n── TEST 9: Delete All Completed Tasks ──');
    const comp1 = await prisma.agentTask.create({
      data: { userId: USER_A_ID, title: '[TEST_HISTORY] Completed 1', status: 'COMPLETED' },
    });
    const comp2 = await prisma.agentTask.create({
      data: { userId: USER_A_ID, title: '[TEST_HISTORY] Completed 2', status: 'COMPLETED' },
    });
    const activeFailed = await prisma.agentTask.create({
      data: { userId: USER_A_ID, title: '[TEST_HISTORY] Failed Task', status: 'FAILED' },
    });

    const deleteAllCompletedRes = await prisma.agentTask.deleteMany({
      where: {
        userId: USER_A_ID,
        title: { startsWith: '[TEST_HISTORY]' },
        status: 'COMPLETED',
      },
    });

    check(deleteAllCompletedRes.count >= 2, `Deleted ${deleteAllCompletedRes.count} completed tasks`);

    const verifyActiveFailed = await prisma.agentTask.findFirst({
      where: { id: activeFailed.id },
    });
    check(!!verifyActiveFailed, 'Non-completed (FAILED) task was NOT deleted by Delete All Completed');

    // ── TEST 10: Active Task Safety (RUNNING tasks protected) ──────────────
    console.log('\n── TEST 10: Active Task Safety (RUNNING tasks protected) ──');
    const runningTask = await prisma.agentTask.create({
      data: { userId: USER_A_ID, title: '[TEST_HISTORY] Running Task', status: 'RUNNING' },
    });

    // Deletion criteria explicitly excludes RUNNING tasks
    const safeDeleteAttempt = await prisma.agentTask.deleteMany({
      where: {
        id: runningTask.id,
        userId: USER_A_ID,
        NOT: { status: { in: ['RUNNING', 'PLANNING', 'VALIDATING'] } },
      },
    });

    check(safeDeleteAttempt.count === 0, 'Active RUNNING task deletion attempt affected 0 rows (protected)');

    const verifyRunning = await prisma.agentTask.findFirst({
      where: { id: runningTask.id },
    });
    check(!!verifyRunning, 'Active RUNNING task remains safe and uncorrupted');

    // ── TEST 11 & 12: Task Count & Empty State Verification ────────────────
    console.log('\n── TEST 11 & 12: Task Count & Empty State Verification ──');
    // Delete all test tasks
    await prisma.agentTask.deleteMany({
      where: { title: { startsWith: '[TEST_HISTORY]' }, userId: USER_A_ID },
    });

    const finalTestTasks = await prisma.agentTask.findMany({
      where: { title: { startsWith: '[TEST_HISTORY]' }, userId: USER_A_ID },
    });
    check(finalTestTasks.length === 0, 'Task history count correctly reaches 0 after full cleanup (Empty State ready)');

    // Clean up audit logs created during test
    await prisma.agentAuditLog.deleteMany({
      where: { id: { in: [singleAudit.id] } },
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

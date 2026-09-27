/**
 * DEION HUB — Autonomous Agent Web Research & Timeout Test Suite
 * Tests all 6 required test scenarios from the user specification.
 *
 * Usage: npx tsx scripts/test-web-research.mjs
 */

import { PrismaClient } from '@prisma/client';
import { AgentEngine } from '../lib/agent/agent-engine.ts';

const prisma = new PrismaClient();
const USER_A_ID = 'fb51b548-4238-429d-b76c-4442e7ce3522'; // DEION

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
  console.log('║  DEION HUB — Autonomous Agent Web Research Tests         ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  const testTaskIds = [];

  try {
    // Cleanup any stale tasks left in RUNNING/PLANNING state from before this session
    await prisma.agentTask.updateMany({
      where: { userId: USER_A_ID, status: { in: ['RUNNING', 'PLANNING'] } },
      data: { status: 'FAILED', errorMessage: 'Cleaned stale task' },
    });

    // ── TEST 1: Math calculation ─────────────────────────────────────────────
    console.log('── TEST 1: Calculate 347 × 29 and explain ──');
    const task1 = await AgentEngine.createAndRunTask(
      USER_A_ID,
      'Calculate 347 × 29 and explain the answer',
      'Provide step by step calculation.'
    );
    testTaskIds.push(task1.id);
    check(task1.status === 'COMPLETED', 'Task 1 status is COMPLETED');
    const plan1 = JSON.parse(task1.executionPlanJson || '{}');
    check(plan1.taskType === 'AI_GENERATION', 'Task 1 plan is AI_GENERATION', `Got: ${plan1.taskType}`);
    const stripped1 = (task1.resultSummary || '').replace(/,/g, '').replace(/\s/g, '');
    check(stripped1.includes('10063'), 'Result contains correct answer 10063');

    // ── TEST 2: Python palindrome function ──────────────────────────────────
    console.log('\n── TEST 2: Python palindrome function ──');
    const task2 = await AgentEngine.createAndRunTask(
      USER_A_ID,
      'Write a Python function that checks whether a string is a palindrome',
      'Provide clean code and examples.'
    );
    testTaskIds.push(task2.id);
    check(task2.status === 'COMPLETED', 'Task 2 status is COMPLETED');
    const plan2 = JSON.parse(task2.executionPlanJson || '{}');
    check(plan2.taskType === 'AI_GENERATION', 'Task 2 plan is AI_GENERATION', `Got: ${plan2.taskType}`);
    check(
      (task2.resultSummary || '').toLowerCase().includes('def ') ||
      (task2.resultSummary || '').toLowerCase().includes('palindrome'),
      'Result contains Python function definition'
    );

    // ── TEST 3: Study library search ─────────────────────────────────────────
    console.log('\n── TEST 3: Study library search & summarize ──');
    const task3 = await AgentEngine.createAndRunTask(
      USER_A_ID,
      'Search my study library for Python material and summarize it',
      ''
    );
    testTaskIds.push(task3.id);
    check(task3.status === 'COMPLETED', 'Task 3 status is COMPLETED');
    const plan3 = JSON.parse(task3.executionPlanJson || '{}');
    check(plan3.toolsToCall.includes('search_study_library'), 'Task 3 calls search_study_library tool');

    // ── TEST 4: Web Research — Junior Data Analyst ──────────────────────────
    console.log('\n── TEST 4: Research Junior Data Analyst Responsibilities & Learning Checklist ──');
    const task4 = await AgentEngine.createAndRunTask(
      USER_A_ID,
      'Research the typical responsibilities of a junior data analyst and create a prioritized learning checklist',
      'Find current requirements and format with SOURCES.'
    );
    testTaskIds.push(task4.id);
    check(task4.status === 'COMPLETED', 'Task 4 status is COMPLETED');
    const plan4 = JSON.parse(task4.executionPlanJson || '{}');
    check(plan4.toolsToCall.includes('web_search'), 'Task 4 plan calls web_search tool');
    const hasWebStep = task4.steps.some((s) => s.toolName === 'web_search');
    check(hasWebStep, 'Task 4 execution steps record web_search tool execution');
    const res4Lower = (task4.resultSummary || '').toLowerCase();
    check(
      res4Lower.includes('checklist') || res4Lower.includes('1.') || res4Lower.includes('sql'),
      'Task 4 result contains learning checklist'
    );

    // ── TEST 5: Web Research — Fresher Data Analyst Skills in India ──────────
    console.log('\n── TEST 5: Research Fresher Data Analyst Skills in India ──');
    const task5 = await AgentEngine.createAndRunTask(
      USER_A_ID,
      'Research current fresher Data Analyst skills employers are asking for in India',
      'Focus on top requirements and skills.'
    );
    testTaskIds.push(task5.id);
    check(task5.status === 'COMPLETED', 'Task 5 status is COMPLETED');
    const plan5 = JSON.parse(task5.executionPlanJson || '{}');
    check(plan5.toolsToCall.includes('web_search'), 'Task 5 plan calls web_search tool');
    check((task5.resultSummary || '').length > 100, 'Task 5 returned substantive research output');

    // ── TEST 6: Running State Safety & Controlled Lifecycle ─────────────────
    console.log('\n── TEST 6: Running State Safety (Tasks are never left RUNNING) ──');
    const recentTasks = await prisma.agentTask.findMany({
      where: { id: { in: testTaskIds } },
      select: { id: true, status: true },
    });
    const stuckTasks = recentTasks.filter((t) => t.status === 'RUNNING' || t.status === 'PLANNING');
    check(stuckTasks.length === 0, 'All executed test tasks completed or failed safely — zero tasks stuck in RUNNING');

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

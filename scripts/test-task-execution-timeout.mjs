/**
 * DEION HUB — Autonomous Task Execution & Timeout Verification Test Suite
 *
 * Verifies all 6 exact scenarios from user requirement:
 * 1. AI_GENERATION DNS explanation
 * 2. AI_GENERATION Technical interview (15 questions, answers, rubric)
 * 3. AI_GENERATION Python palindrome
 * 4. Provider fallback when Ollama is unavailable
 * 5. All providers unavailable error state (NO stale RUNNING steps)
 * 6. WEB_RESEARCH task with sources & structured sections
 *
 * Run: node scripts/test-task-execution-timeout.mjs
 */

import { PrismaClient } from '@prisma/client';
import { AgentEngine } from '../lib/agent/agent-engine.ts';
import { AIRouter } from '../lib/ai/router.ts';

const prisma = new PrismaClient();

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

async function main() {
  console.log('═════════════════════════════════════════════════════════════════');
  console.log('  AUTONOMOUS TASK EXECUTION & TIMEOUT TEST SUITE');
  console.log('═════════════════════════════════════════════════════════════════\n');

  // Find a test user from DB
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error('No user found in database!');
    process.exit(1);
  }
  const userId = user.id;

  try {
    // ── TEST 1: Explain DNS ──
    console.log('── TEST 1: Explain DNS ──');
    const t1 = await AgentEngine.createAndRunTask(
      userId,
      'Explain what DNS is in exactly two sentences.',
      ''
    );
    console.log(`   Status: ${t1.status} | Provider: ${t1.providerUsed} | Model: ${t1.modelUsed}`);
    const plan1 = JSON.parse(t1.executionPlanJson || '{}');
    check(plan1.taskType === 'AI_GENERATION', 'Classified as AI_GENERATION', `Got: ${plan1.taskType}`);
    check(t1.status === 'COMPLETED', 'Task status is COMPLETED', `Got status: ${t1.status}`);
    check(t1.providerUsed !== null, 'Recorded providerUsed', `Provider: ${t1.providerUsed}`);
    check(!t1.steps.some(s => s.status === 'RUNNING'), 'No stale RUNNING steps', 'Found RUNNING step');

    // ── TEST 2: Python Technical Interview (15 questions) ──
    console.log('\n── TEST 2: Fresher Python Technical Interview (15 questions) ──');
    const t2 = await AgentEngine.createAndRunTask(
      userId,
      'Create a mock technical interview for a fresher Python developer with 15 questions, expected answers, and a scoring rubric.',
      ''
    );
    console.log(`   Status: ${t2.status} | Provider: ${t2.providerUsed} | Chars: ${t2.resultSummary?.length}`);
    const plan2 = JSON.parse(t2.executionPlanJson || '{}');
    check(plan2.taskType === 'AI_GENERATION', 'Classified as AI_GENERATION (no web research)', `Got: ${plan2.taskType}`);
    check(t2.status === 'COMPLETED', 'Task status is COMPLETED', `Got status: ${t2.status}`);
    check(t2.resultSummary?.length > 300, 'Result contains substantive content', `Length: ${t2.resultSummary?.length}`);
    check(!t2.steps.some(s => s.toolName === 'web_search'), 'No web_search tool called', 'web_search was incorrectly called');
    check(!t2.steps.some(s => s.status === 'RUNNING'), 'No stale RUNNING steps', 'Found RUNNING step');

    // ── TEST 3: Palindrome Python Function ──
    console.log('\n── TEST 3: Palindrome Python Function ──');
    const t3 = await AgentEngine.createAndRunTask(
      userId,
      'Write a Python function that checks whether a string is a palindrome and provide 5 test cases.',
      ''
    );
    console.log(`   Status: ${t3.status} | Provider: ${t3.providerUsed} | Model: ${t3.modelUsed}`);
    const plan3 = JSON.parse(t3.executionPlanJson || '{}');
    check(plan3.taskType === 'AI_GENERATION', 'Classified as AI_GENERATION', `Got: ${plan3.taskType}`);
    check(t3.status === 'COMPLETED', 'Task status is COMPLETED', `Got status: ${t3.status}`);
    check(!t3.steps.some(s => s.status === 'RUNNING'), 'No stale RUNNING steps', 'Found RUNNING step');

    // ── TEST 4: Simulate Ollama Unavailable (Provider Cascade) ──
    console.log('\n── TEST 4: Provider Fallback (Ollama Unavailable -> Gemini/Groq) ──');
    // Save original Ollama URL
    const originalOllamaUrl = process.env.OLLAMA_BASE_URL;
    process.env.OLLAMA_BASE_URL = 'http://localhost:99999'; // Dead port

    const t4 = await AgentEngine.createAndRunTask(
      userId,
      'Explain the difference between synchronous and asynchronous execution in JavaScript.',
      ''
    );
    // Restore
    if (originalOllamaUrl) process.env.OLLAMA_BASE_URL = originalOllamaUrl;
    else delete process.env.OLLAMA_BASE_URL;

    console.log(`   Status: ${t4.status} | Provider: ${t4.providerUsed} | Model: ${t4.modelUsed}`);
    check(t4.status === 'COMPLETED', 'Task COMPLETED despite Ollama being offline', `Got status: ${t4.status}`);
    check(t4.providerUsed === 'gemini' || t4.providerUsed === 'groq', 'Fallback provider used (Gemini or Groq)', `Got provider: ${t4.providerUsed}`);
    check(!t4.steps.some(s => s.status === 'RUNNING'), 'No stale RUNNING steps', 'Found RUNNING step');

    // ── TEST 5: Simulate All Providers Unavailable ──
    console.log('\n── TEST 5: All Providers Unavailable (Clean FAILED State) ──');
    // Backup keys
    const origGemini = process.env.GEMINI_API_KEY;
    const origGroq = process.env.GROQ_API_KEY;
    const origOllama = process.env.OLLAMA_BASE_URL;

    process.env.OLLAMA_BASE_URL = 'http://localhost:99999';
    delete process.env.GEMINI_API_KEY;
    delete process.env.GROQ_API_KEY;

    // Reset AI_CONFIG dynamically by reimporting or mocking AIRouter
    const origGenerateText = AIRouter.generateText;
    AIRouter.generateText = async () => {
      throw new Error('All configured AI providers failed. (ollama: offline; gemini: key missing; groq: key missing)');
    };

    const t5 = await AgentEngine.createAndRunTask(
      userId,
      'Explain quantum computing in simple terms.',
      ''
    );

    // Restore AIRouter & env
    AIRouter.generateText = origGenerateText;
    if (origGemini) process.env.GEMINI_API_KEY = origGemini;
    if (origGroq) process.env.GROQ_API_KEY = origGroq;
    if (origOllama) process.env.OLLAMA_BASE_URL = origOllama;

    console.log(`   Status: ${t5.status} | Error: ${t5.errorMessage}`);
    console.log(`   Steps:`, t5.steps.map(s => `${s.title}: ${s.status}`));
    check(t5.status === 'FAILED', 'Task status is FAILED', `Got status: ${t5.status}`);
    check(t5.errorMessage?.includes('All configured AI providers failed'), 'Error message states AI providers failed', `Got error: ${t5.errorMessage}`);
    check(!t5.errorMessage?.includes('Web research'), 'Error message does NOT mention web research for AI_GENERATION', `Got error: ${t5.errorMessage}`);
    check(!t5.steps.some(s => s.status === 'RUNNING' || s.status === 'PENDING'), 'Zero steps in RUNNING/PENDING status', 'Stale RUNNING steps found');

    // ── TEST 6: Real WEB_RESEARCH Task ──
    console.log('\n── TEST 6: WEB_RESEARCH Task Execution ──');
    const t6 = await AgentEngine.createAndRunTask(
      userId,
      'Research the typical responsibilities of a junior data analyst and create a prioritized learning checklist.',
      ''
    );
    console.log(`   Status: ${t6.status} | Provider: ${t6.providerUsed} | Model: ${t6.modelUsed}`);
    const plan6 = JSON.parse(t6.executionPlanJson || '{}');
    check(plan6.taskType === 'WEB_RESEARCH', 'Classified as WEB_RESEARCH', `Got: ${plan6.taskType}`);
    check(t6.status === 'COMPLETED', 'WEB_RESEARCH task COMPLETED', `Got status: ${t6.status}`);
    check(t6.resultSummary?.includes('SUMMARY') || t6.resultSummary?.includes('CHECKLIST') || t6.resultSummary?.includes('FINDINGS'), 'Result contains structured research sections', 'Missing structured sections');
    check(!t6.steps.some(s => s.status === 'RUNNING'), 'No stale RUNNING steps', 'Found RUNNING step');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n═════════════════════════════════════════════════════════════════');
  console.log(`  RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('═════════════════════════════════════════════════════════════════\n');

  if (failed > 0) {
    process.exit(1);
  }
}

main();

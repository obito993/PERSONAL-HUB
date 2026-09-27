/**
 * DEION HUB — Autonomous Agent Test Suite
 *
 * Usage (from the project directory, with dev server running on port 3000):
 *   node --experimental-vm-modules scripts/test-agent.mjs
 *   (or)
 *   npx tsx scripts/test-agent.mjs
 *
 * NOTE: You must be logged in first. Set COOKIE below from your browser's
 * dh_session cookie after logging in.
 *
 * Each test calls POST /api/agent/tasks and checks the response.
 */

const BASE_URL = 'http://localhost:3000';

// ─── CONFIGURE THIS ───────────────────────────────────────────────────────────
// Copy your dh_session cookie value from the browser (F12 → Application → Cookies)
const SESSION_COOKIE = process.env.DH_SESSION || '';
// ─────────────────────────────────────────────────────────────────────────────

if (!SESSION_COOKIE) {
  console.error('❌ ERROR: Set DH_SESSION env variable to your dh_session cookie value.');
  console.error('   Example: DH_SESSION="your_jwt_token" npx tsx scripts/test-agent.mjs');
  process.exit(1);
}

const HEADERS = {
  'Content-Type': 'application/json',
  Cookie: `dh_session=${SESSION_COOKIE}`,
};

let passed = 0;
let failed = 0;

async function createTask(title, description = '') {
  const res = await fetch(`${BASE_URL}/api/agent/tasks`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ title, description }),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  }
  const json = await res.json();
  return json.task;
}

function pass(testName, detail = '') {
  passed++;
  console.log(`\n✅ PASS: ${testName}${detail ? '\n   ' + detail : ''}`);
}

function fail(testName, reason) {
  failed++;
  console.error(`\n❌ FAIL: ${testName}\n   Reason: ${reason}`);
}

function assert(condition, testName, failReason, passDetail = '') {
  if (condition) pass(testName, passDetail);
  else fail(testName, failReason);
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST 1 — MATH: Calculate 347 × 29 = 10063
// ─────────────────────────────────────────────────────────────────────────────
async function test1_math() {
  console.log('\n─── TEST 1: Math Calculation (347 × 29 = 10063) ───');
  try {
    const task = await createTask('Calculate 347 × 29', 'Show the answer clearly.');
    console.log('   Status:', task.status);
    console.log('   Provider:', task.providerUsed, '/', task.modelUsed);
    console.log('   Duration:', task.durationMs, 'ms');
    console.log('   Result (first 200 chars):', task.resultSummary?.slice(0, 200));

    // Verify answer
    assert(
      task.resultSummary?.includes('10063'),
      'Math result contains 10063',
      `Expected "10063" in result. Got: "${task.resultSummary?.slice(0, 200)}"`,
      `Answer 10063 found. Provider: ${task.providerUsed}`
    );

    // Verify study library was NOT called
    const usedStudyTool = task.steps?.some((s) => s.toolName === 'search_study_library');
    assert(
      !usedStudyTool,
      'Math task: search_study_library NOT called',
      'search_study_library was incorrectly called for a math task',
      'Correctly skipped search_study_library'
    );

    // Verify task status
    assert(
      task.status === 'COMPLETED',
      'Math task COMPLETED',
      `Expected COMPLETED, got: ${task.status}`
    );
  } catch (err) {
    fail('TEST 1 — Math', err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST 2 — PYTHON: Explain list comprehensions
// ─────────────────────────────────────────────────────────────────────────────
async function test2_python() {
  console.log('\n─── TEST 2: Python List Comprehensions ───');
  try {
    const task = await createTask(
      'Explain Python list comprehensions to a beginner',
      'Include: 1) one-sentence explanation, 2) one simple example, 3) equivalent normal for-loop, 4) one common mistake.'
    );
    console.log('   Status:', task.status);
    console.log('   Provider:', task.providerUsed, '/', task.modelUsed);
    console.log('   Result length:', task.resultSummary?.length, 'chars');
    console.log('   Result (first 300 chars):', task.resultSummary?.slice(0, 300));

    assert(
      task.status === 'COMPLETED',
      'Python task COMPLETED',
      `Expected COMPLETED, got: ${task.status}`
    );

    assert(
      (task.resultSummary?.length ?? 0) > 100,
      'Python result has substantive content',
      `Result too short: ${task.resultSummary?.length} chars`,
      `Result length: ${task.resultSummary?.length} chars`
    );

    // Verify study library was NOT called
    const usedStudyTool = task.steps?.some((s) => s.toolName === 'search_study_library');
    assert(
      !usedStudyTool,
      'Python task: search_study_library NOT called',
      'search_study_library was incorrectly called for a Python explanation task',
      'Correctly skipped search_study_library'
    );
  } catch (err) {
    fail('TEST 2 — Python', err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST 3 — SQL: Explain JOINs with examples
// ─────────────────────────────────────────────────────────────────────────────
async function test3_sql() {
  console.log('\n─── TEST 3: SQL JOINs ───');
  try {
    const task = await createTask(
      'Explain INNER JOIN, LEFT JOIN and FULL OUTER JOIN',
      'For each: give a clear explanation AND a working SQL example with SELECT statement.'
    );
    console.log('   Status:', task.status);
    console.log('   Provider:', task.providerUsed, '/', task.modelUsed);
    console.log('   Result length:', task.resultSummary?.length, 'chars');
    console.log('   Result (first 400 chars):', task.resultSummary?.slice(0, 400));

    assert(
      task.status === 'COMPLETED',
      'SQL task COMPLETED',
      `Expected COMPLETED, got: ${task.status}. Error: ${task.errorMessage}`
    );

    // Check for JOIN types in result (case-insensitive)
    const res = task.resultSummary?.toLowerCase() ?? '';
    assert(res.includes('inner join'), 'SQL result contains INNER JOIN', 'INNER JOIN not found in result');
    assert(res.includes('left join'), 'SQL result contains LEFT JOIN', 'LEFT JOIN not found in result');

    // study library NOT called
    const usedStudyTool = task.steps?.some((s) => s.toolName === 'search_study_library');
    assert(!usedStudyTool, 'SQL task: search_study_library NOT called',
      'search_study_library was incorrectly called for a SQL explanation task');
  } catch (err) {
    fail('TEST 3 — SQL', err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST 4 — DIFFERENT TASKS produce DIFFERENT execution plans
// ─────────────────────────────────────────────────────────────────────────────
async function test4_differentTasks() {
  console.log('\n─── TEST 4: Different Tasks → Different Execution Plans ───');
  try {
    const [math, python, sql] = await Promise.all([
      createTask('Add 50 and 75'),
      createTask('Write a Python hello world function'),
      createTask('Explain what a database index does'),
    ]);

    const mathPlan = JSON.parse(math.executionPlanJson ?? '{}');
    const pythonPlan = JSON.parse(python.executionPlanJson ?? '{}');
    const sqlPlan = JSON.parse(sql.executionPlanJson ?? '{}');

    console.log('   Math plan:', mathPlan.taskType, '| tools:', mathPlan.toolsToCall?.join(',') || 'none');
    console.log('   Python plan:', pythonPlan.taskType, '| tools:', pythonPlan.toolsToCall?.join(',') || 'none');
    console.log('   SQL plan:', sqlPlan.taskType, '| tools:', sqlPlan.toolsToCall?.join(',') || 'none');
    console.log('   Math result:', math.resultSummary?.slice(0, 100));
    console.log('   Python result:', python.resultSummary?.slice(0, 100));
    console.log('   SQL result:', sql.resultSummary?.slice(0, 100));

    // All should be AI_GENERATION (no tools)
    assert(
      mathPlan.taskType === 'AI_GENERATION',
      'Math classified as AI_GENERATION',
      `Expected AI_GENERATION, got: ${mathPlan.taskType}`
    );

    // Results must be different from each other
    const resultsAreDifferent =
      math.resultSummary !== python.resultSummary &&
      math.resultSummary !== sql.resultSummary &&
      python.resultSummary !== sql.resultSummary;

    assert(
      resultsAreDifferent,
      'Three different tasks produce three different results',
      'Two or more tasks produced identical results — task-specific execution is broken'
    );
  } catch (err) {
    fail('TEST 4 — Different Tasks', err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST 5 — STUDY TOOL: explicitly asks for study library search
// ─────────────────────────────────────────────────────────────────────────────
async function test5_studyTool() {
  console.log('\n─── TEST 5: Study Library Tool Selection ───');
  try {
    const task = await createTask(
      'Search my study library for uploaded documents about SQL',
      'Summarize the relevant documents. If there are none, report that honestly.'
    );
    console.log('   Status:', task.status);
    console.log('   Provider:', task.providerUsed, '/', task.modelUsed);
    console.log('   Steps:', task.steps?.map((s) => `${s.title}(${s.status})`).join(', '));
    console.log('   Result (first 200 chars):', task.resultSummary?.slice(0, 200));

    // Verify study library WAS called for this task
    const usedStudyTool = task.steps?.some((s) => s.toolName === 'search_study_library');
    assert(
      usedStudyTool,
      'Study task: search_study_library WAS called',
      'search_study_library was not called despite the task explicitly requesting a library search'
    );

    assert(
      task.status === 'COMPLETED',
      'Study task COMPLETED',
      `Expected COMPLETED, got: ${task.status}. Error: ${task.errorMessage}`
    );
  } catch (err) {
    fail('TEST 5 — Study Tool', err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST 6 — PERSISTENCE: Completed tasks survive a GET request
// ─────────────────────────────────────────────────────────────────────────────
async function test6_persistence() {
  console.log('\n─── TEST 6: Task Persistence ───');
  try {
    // Create a task
    const created = await createTask('List the 3 primary colors of light (RGB)');
    const taskId = created?.id;
    assert(!!taskId, 'Task created with an ID', 'Task creation returned no ID');

    // Re-fetch via GET
    const res = await fetch(`${BASE_URL}/api/agent/tasks`, { headers: HEADERS });
    const json = await res.json();
    const found = json.tasks?.find((t) => t.id === taskId);

    assert(
      !!found,
      'Task found in GET /api/agent/tasks after creation',
      'Task was not returned by GET after creation'
    );
    assert(
      !!found?.resultSummary,
      'Persisted task has resultSummary',
      'resultSummary is missing after persistence',
      `resultSummary length: ${found?.resultSummary?.length}`
    );
    assert(
      !!found?.providerUsed,
      'Persisted task has providerUsed',
      'providerUsed is missing',
      `Provider: ${found?.providerUsed}`
    );
    assert(
      found?.steps?.length > 0,
      'Persisted task has execution steps',
      `steps array is empty or missing. Count: ${found?.steps?.length}`
    );
  } catch (err) {
    fail('TEST 6 — Persistence', err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST 7 — PROVIDER FALLBACK: Verify Ollama → Gemini → Groq cascade
// ─────────────────────────────────────────────────────────────────────────────
async function test7_providerFallback() {
  console.log('\n─── TEST 7: Provider Information ───');
  try {
    const task = await createTask(
      'Explain what a REST API is in 3 sentences',
      'Be concise and clear.'
    );
    console.log('   Provider used:', task.providerUsed);
    console.log('   Model used:', task.modelUsed);
    console.log('   Fallback occurred:', task.fallbackChain ? JSON.parse(task.fallbackChain) : 'none');

    const validProviders = ['ollama', 'gemini', 'groq'];
    assert(
      validProviders.includes(task.providerUsed),
      `Provider recorded is a known provider (got: ${task.providerUsed})`,
      `Provider "${task.providerUsed}" is not in expected list: ${validProviders.join(', ')}`
    );

    assert(
      !!task.modelUsed && task.modelUsed.length > 2,
      `Model recorded (got: ${task.modelUsed})`,
      'modelUsed is missing or empty'
    );

    assert(
      task.status === 'COMPLETED',
      'Provider fallback task COMPLETED',
      `Task failed: ${task.errorMessage}`
    );
  } catch (err) {
    fail('TEST 7 — Provider Fallback', err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST 8 — SECURITY: Unauthorized access returns 401
// ─────────────────────────────────────────────────────────────────────────────
async function test8_security() {
  console.log('\n─── TEST 8: Unauthorized Access Returns 401 ───');
  try {
    const res = await fetch(`${BASE_URL}/api/agent/tasks`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      // No cookie — unauthenticated
    });
    assert(
      res.status === 401,
      'GET /api/agent/tasks without auth returns 401',
      `Expected 401, got: ${res.status}`
    );

    const postRes = await fetch(`${BASE_URL}/api/agent/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Hack test' }),
    });
    assert(
      postRes.status === 401,
      'POST /api/agent/tasks without auth returns 401',
      `Expected 401, got: ${postRes.status}`
    );
  } catch (err) {
    fail('TEST 8 — Security', err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Run all tests
// ─────────────────────────────────────────────────────────────────────────────
async function runAll() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║   DEION HUB — Autonomous Agent Test Suite                ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Session Cookie: ${SESSION_COOKIE ? SESSION_COOKIE.slice(0, 20) + '...' : 'NOT SET'}`);

  await test1_math();
  await test2_python();
  await test3_sql();
  await test4_differentTasks();
  await test5_studyTool();
  await test6_persistence();
  await test7_providerFallback();
  await test8_security();

  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log(`║  RESULTS: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  if (failed > 0) process.exit(1);
}

runAll().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});

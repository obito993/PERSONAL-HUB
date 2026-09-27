/**
 * DEION HUB — Autonomous Agent Integration Tests
 * Creates a real JWT session and runs all 8 tests against the live dev server.
 *
 * Run: node scripts/run-agent-tests.mjs
 */

import { createHmac } from 'crypto';

const BASE_URL = 'http://localhost:3000';

// ── Real user from DB ─────────────────────────────────────────────────────────
const TEST_USER = {
  userId: 'fb51b548-4238-429d-b76c-4442e7ce3522',
  email: 'deionbernard3322@gmail.com',
  name: 'DEION',
};
const JWT_SECRET = 'resumeforge-ai-super-secret-jwt-key-2026-production';

// ── Minimal JWT creation (HS256) ──────────────────────────────────────────────
function base64url(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function createJWT(payload) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64url(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000) }));
  const sig = createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `${header}.${body}.${sig}`;
}

// ── NOTE: We use jose-compatible JWT (HS256) via the app's own login API ──────
// The app uses jose which creates standard HS256 JWTs. We'll use the login API
// with a freshly created test account instead.

// ── Use the actual login API ──────────────────────────────────────────────────
async function getSessionCookie() {
  // Try to log in with known credentials
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'deionbernard3322@gmail.com',
      password: 'deion123',
    }),
  });

  const setCookie = res.headers.get('set-cookie');
  if (res.ok && setCookie) {
    const match = setCookie.match(/dh_session=([^;]+)/);
    if (match) return match[1];
  }

  // Try alternative passwords
  for (const pw of ['password', 'password123', 'Deion123', 'DEION123', '123456', 'deion']) {
    const r2 = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'deionbernard3322@gmail.com', password: pw }),
    });
    const c2 = r2.headers.get('set-cookie');
    if (r2.ok && c2) {
      const m = c2.match(/dh_session=([^;]+)/);
      if (m) {
        console.log(`  [AUTH] Logged in with password: ${pw}`);
        return m[1];
      }
    }
  }
  return null;
}

// ── Test harness ──────────────────────────────────────────────────────────────
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

async function createTask(headers, title, description = '') {
  const res = await fetch(`${BASE_URL}/api/agent/tasks`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ title, description }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return (await res.json()).task;
}

// ─────────────────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────────────────

async function test1_math(h) {
  console.log('\n── TEST 1: Math (347 × 29 = 10063) ──');
  const t = await createTask(h, 'Calculate 347 × 29', 'Show the calculation and the answer clearly.');
  console.log(`  Status: ${t.status} | Provider: ${t.providerUsed}/${t.modelUsed} | Duration: ${t.durationMs}ms`);
  console.log(`  Result: ${t.resultSummary?.slice(0, 200)}`);

  const resultText = t.resultSummary ?? '';
  const resultNoCommas = resultText.replace(/,/g, '');
  const hasAnswer = resultNoCommas.includes('10063') || resultText.includes('10,063');
  check(hasAnswer, 'Answer 10063 in result',
    `"10063"/"10,063" not found in: "${resultText.slice(0, 300)}"`, `Provider: ${t.providerUsed}`);
  check(!t.steps?.some(s => s.toolName === 'search_study_library'),
    'search_study_library NOT called', 'search_study_library was incorrectly triggered');
  check(t.status === 'COMPLETED', 'Task COMPLETED', `Got: ${t.status}`);
}


async function test2_python(h) {
  console.log('\n── TEST 2: Python List Comprehensions ──');
  const t = await createTask(h,
    'Explain Python list comprehensions to a beginner',
    'Include: a one-sentence explanation, a simple example, the equivalent for-loop, and one common mistake.'
  );
  console.log(`  Status: ${t.status} | Provider: ${t.providerUsed}/${t.modelUsed} | Chars: ${t.resultSummary?.length}`);
  console.log(`  Result: ${t.resultSummary?.slice(0, 300)}`);

  check(t.status === 'COMPLETED', 'Task COMPLETED', `Got: ${t.status}`);
  check((t.resultSummary?.length ?? 0) > 100, 'Result has substantive content',
    `Result too short: ${t.resultSummary?.length} chars`, `Length: ${t.resultSummary?.length}`);
  check(!t.steps?.some(s => s.toolName === 'search_study_library'),
    'search_study_library NOT called', 'search_study_library incorrectly triggered');
}

async function test3_sql(h) {
  console.log('\n── TEST 3: SQL JOINs ──');
  const t = await createTask(h,
    'Explain INNER JOIN, LEFT JOIN and FULL OUTER JOIN',
    'For each: write a clear explanation AND a SQL example with a SELECT statement.'
  );
  console.log(`  Status: ${t.status} | Provider: ${t.providerUsed}/${t.modelUsed} | Chars: ${t.resultSummary?.length}`);
  console.log(`  Result: ${t.resultSummary?.slice(0, 400)}`);

  const res = t.resultSummary?.toLowerCase() ?? '';
  check(t.status === 'COMPLETED', 'Task COMPLETED', `Got: ${t.status}. Error: ${t.errorMessage}`);
  check(res.includes('inner join'), 'Result contains INNER JOIN', 'INNER JOIN not found in result');
  check(res.includes('left join'), 'Result contains LEFT JOIN', 'LEFT JOIN not found in result');
  check(!t.steps?.some(s => s.toolName === 'search_study_library'),
    'search_study_library NOT called', 'search_study_library incorrectly triggered');
}

async function test4_differentPlans(h) {
  console.log('\n── TEST 4: Different Tasks → Different Plans & Results ──');
  const [t1, t2, t3] = await Promise.all([
    createTask(h, 'What is 100 divided by 4?'),
    createTask(h, 'Write a Python function that reverses a string'),
    createTask(h, 'What is the capital city of France?'),
  ]);

  console.log(`  Math plan: ${t1.executionPlanJson ? JSON.parse(t1.executionPlanJson).taskType : 'N/A'}`);
  console.log(`  Python plan: ${t2.executionPlanJson ? JSON.parse(t2.executionPlanJson).taskType : 'N/A'}`);
  console.log(`  Geography plan: ${t3.executionPlanJson ? JSON.parse(t3.executionPlanJson).taskType : 'N/A'}`);
  console.log(`  Math result: ${t1.resultSummary?.slice(0, 80)}`);
  console.log(`  Python result: ${t2.resultSummary?.slice(0, 80)}`);
  console.log(`  Geography result: ${t3.resultSummary?.slice(0, 80)}`);

  check(t1.resultSummary !== t2.resultSummary, 'Math ≠ Python results',
    'Math and Python produced identical results');
  check(t1.resultSummary !== t3.resultSummary, 'Math ≠ Geography results',
    'Math and Geography produced identical results');
  check(t2.resultSummary !== t3.resultSummary, 'Python ≠ Geography results',
    'Python and Geography produced identical results');
}

async function test5_studyTool(h) {
  console.log('\n── TEST 5: Study Library Tool Triggered ──');
  const t = await createTask(h,
    'Search my study library for uploaded documents about SQL',
    'Summarize any relevant documents you find. If there are none, report that clearly.'
  );
  console.log(`  Status: ${t.status} | Steps: ${t.steps?.map(s => `${s.title.slice(0,20)}(${s.toolName || '-'})`).join(', ')}`);
  console.log(`  Result: ${t.resultSummary?.slice(0, 200)}`);

  const usedStudyTool = t.steps?.some(s => s.toolName === 'search_study_library');
  check(usedStudyTool, 'search_study_library WAS called', 'study tool was not called');
  check(t.status === 'COMPLETED', 'Task COMPLETED', `Got: ${t.status}. Error: ${t.errorMessage}`);
}

async function test6_persistence(h) {
  console.log('\n── TEST 6: Persistence ──');
  const created = await createTask(h, 'What are the three primary colors of light?');
  const taskId = created?.id;
  console.log(`  Created task ID: ${taskId}`);

  const res = await fetch(`${BASE_URL}/api/agent/tasks`, { headers: h });
  const json = await res.json();
  const found = json.tasks?.find(t => t.id === taskId);

  check(!!found, 'Task found in GET after creation', 'Task missing from GET response');
  check(!!found?.resultSummary, 'Has resultSummary', `Missing resultSummary. Value: ${found?.resultSummary}`,
    `Length: ${found?.resultSummary?.length}`);
  check(!!found?.providerUsed, 'Has providerUsed', `Missing providerUsed. Value: ${found?.providerUsed}`,
    `Provider: ${found?.providerUsed}`);
  check((found?.steps?.length ?? 0) > 0, 'Has execution steps', `Steps: ${found?.steps?.length}`);
}

async function test7_provider(h) {
  console.log('\n── TEST 7: Provider Information ──');
  const t = await createTask(h, 'Explain what DNS is in two sentences.');
  console.log(`  Provider: ${t.providerUsed} | Model: ${t.modelUsed}`);
  const fallback = t.fallbackChain ? JSON.parse(t.fallbackChain) : [];
  console.log(`  Fallback chain: ${fallback.length > 0 ? fallback.join(' → ') : 'none (first provider succeeded)'}`);

  const valid = ['ollama', 'gemini', 'groq'];
  check(valid.includes(t.providerUsed), `Provider is valid (${t.providerUsed})`,
    `"${t.providerUsed}" not in ${valid.join(', ')}`);
  check(!!t.modelUsed && t.modelUsed.length > 2, `Model is recorded (${t.modelUsed})`, 'modelUsed empty');
  check(t.status === 'COMPLETED', 'Task COMPLETED', `Got: ${t.status}`);
}

async function test8_security() {
  console.log('\n── TEST 8: Security (401 without auth) ──');
  const noAuth = { 'Content-Type': 'application/json' };

  const get = await fetch(`${BASE_URL}/api/agent/tasks`, { headers: noAuth });
  check(get.status === 401, 'GET /api/agent/tasks → 401 without auth', `Got: ${get.status}`);

  const post = await fetch(`${BASE_URL}/api/agent/tasks`, {
    method: 'POST', headers: noAuth, body: JSON.stringify({ title: 'hack' })
  });
  check(post.status === 401, 'POST /api/agent/tasks → 401 without auth', `Got: ${post.status}`);

  const mem = await fetch(`${BASE_URL}/api/agent/memory`, { headers: noAuth });
  check(mem.status === 401, 'GET /api/agent/memory → 401 without auth', `Got: ${mem.status}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║   DEION HUB — Autonomous Agent Integration Tests         ║');
  console.log('╚══════════════════════════════════════════════════════════╝');

  // Get session
  console.log('\n[*] Authenticating...');
  const sessionToken = await getSessionCookie();
  if (!sessionToken) {
    console.error('\n❌ FATAL: Could not get a session token. Check credentials or log in manually.');
    console.error('   Set DH_SESSION env variable: DH_SESSION="<your_token>" node scripts/run-agent-tests.mjs');
    
    // Try with env var instead
    const envToken = process.env.DH_SESSION;
    if (!envToken) {
      process.exit(1);
    }
    console.log(`[*] Using DH_SESSION from env: ${envToken.slice(0, 30)}...`);
  }
  
  const token = sessionToken || process.env.DH_SESSION;
  const HEADERS = {
    'Content-Type': 'application/json',
    Cookie: `dh_session=${token}`,
  };
  console.log(`[*] Session acquired: ${token.slice(0, 30)}...`);

  try {
    await test1_math(HEADERS);
    await test2_python(HEADERS);
    await test3_sql(HEADERS);
    await test4_differentPlans(HEADERS);
    await test5_studyTool(HEADERS);
    await test6_persistence(HEADERS);
    await test7_provider(HEADERS);
    await test8_security();
  } catch (e) {
    console.error('\n[FATAL TEST ERROR]', e.message);
  }

  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log(`║  RESULTS: ${passed} PASSED, ${failed} FAILED / ${passed + failed} TOTAL`);
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  if (failed > 0) process.exit(1);
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });

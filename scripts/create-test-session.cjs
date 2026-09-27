// Creates a valid dh_session JWT for testing (bypasses bcrypt login)
// Run: node scripts/create-test-session.cjs

const { SignJWT } = require('jose');

const USER_ID = 'fb51b548-4238-429d-b76c-4442e7ce3522';
const EMAIL = 'deionbernard3322@gmail.com';
const NAME = 'DEION';
const JWT_SECRET = 'resumeforge-ai-super-secret-jwt-key-2026-production';

async function main() {
  const secret = new TextEncoder().encode(JWT_SECRET);
  const token = await new SignJWT({
    userId: USER_ID,
    email: EMAIL,
    name: NAME,
    lastActivityAt: Date.now(),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret);

  console.log(token);
}

main().catch(e => { console.error(e.message); process.exit(1); });

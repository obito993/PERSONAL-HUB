/**
 * Diagnostic script — checks the actual User records in Neon PostgreSQL
 * to determine whether the userId in JWT sessions exist.
 * Prints User IDs and emails (no passwords exposed).
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== Neon PostgreSQL User Table Diagnostic ===\n');

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, createdAt: true }
  });

  if (users.length === 0) {
    console.log('NO USERS FOUND in the database.');
    console.log('\nThis confirms the root cause: The Neon database does not have the user account');
    console.log('that was used to generate the JWT session cookie (dh_session).');
    console.log('\nFix: Sign up again via /signup, then try uploading a PDF.');
  } else {
    console.log(`Found ${users.length} user(s):`);
    users.forEach(u => {
      console.log(`  ID: ${u.id}`);
      console.log(`  Name: ${u.name}`);
      console.log(`  Email: ${u.email}`);
      console.log(`  Created: ${u.createdAt.toISOString()}`);
      console.log('  ---');
    });
  }

  // Also check StudyDocument count
  const docCount = await prisma.studyDocument.count();
  console.log(`\nStudyDocument rows in DB: ${docCount}`);

  // List StudyDocument user FK values
  const docs = await prisma.studyDocument.findMany({
    select: { id: true, userId: true, title: true, createdAt: true }
  });
  if (docs.length > 0) {
    console.log('Existing StudyDocuments:');
    docs.forEach(d => {
      const userExists = users.some(u => u.id === d.userId);
      console.log(`  Doc: ${d.title} | userId: ${d.userId} | User Exists: ${userExists}`);
    });
  }
}

main()
  .catch(e => { console.error('Diagnostic Error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

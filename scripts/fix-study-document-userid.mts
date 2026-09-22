/**
 * Drops the stale UNIQUE constraint StudyDocument_userId_key from Neon PostgreSQL.
 * This index was erroneously created by an earlier db push and prevents multiple
 * StudyDocument rows from sharing the same userId (one user can only have one document).
 * 
 * The correct design is: one User -> many StudyDocuments (no unique constraint on userId).
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking for stale StudyDocument_userId_key unique index...');

  // Check if the unique constraint exists
  const result: any[] = await prisma.$queryRaw`
    SELECT indexname
    FROM pg_indexes
    WHERE tablename = 'StudyDocument'
    AND indexname = 'StudyDocument_userId_key'
  `;

  if (result.length > 0) {
    console.log('Found stale UNIQUE constraint: StudyDocument_userId_key. Dropping...');
    await prisma.$executeRaw`DROP INDEX IF EXISTS "StudyDocument_userId_key"`;
    console.log('✓ Dropped StudyDocument_userId_key');
  } else {
    console.log('StudyDocument_userId_key not found — checking case variants...');

    // Also try lowercase table name
    const result2: any[] = await prisma.$queryRaw`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'StudyDocument'
    `;
    console.log('All indexes on StudyDocument table:', result2.map((r: any) => r.indexname));

    const result3: any[] = await prisma.$queryRaw`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'StudyDocument'
      AND indexdef LIKE '%userId%'
      AND indexdef LIKE '%UNIQUE%'
    `;

    if (result3.length > 0) {
      for (const idx of result3) {
        console.log(`Dropping unique index: ${idx.indexname}`);
        await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "${idx.indexname}"`);
        console.log(`✓ Dropped ${idx.indexname}`);
      }
    } else {
      console.log('No stale UNIQUE indexes on userId found. Constraint may have a different source.');
    }
  }

  console.log('\nDone. Verifying StudyDocument table has no userId unique constraint...');

  const verify: any[] = await prisma.$queryRaw`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE tablename = 'StudyDocument'
  `;
  console.log('Current indexes on StudyDocument:');
  verify.forEach((r: any) => console.log(' -', r.indexname, ':', r.indexdef));
}

main()
  .catch(e => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

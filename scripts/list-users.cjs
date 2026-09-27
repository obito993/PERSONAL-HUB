const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.findMany({ select: { id: true, email: true, name: true }, take: 5 })
  .then(u => { console.log(JSON.stringify(u)); })
  .catch(e => { console.error(e.message); })
  .finally(() => p.$disconnect());

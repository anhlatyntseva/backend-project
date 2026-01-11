const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  console.log('[check] DATABASE_URL=', process.env.DATABASE_URL);
  const p = await prisma.property.findUnique({ where: { id: 'h0123456-78f0-1234-5678-9abcdef01234' } });
  console.log('[check] property exists?', !!p);
  if (p) console.log('[check] title=', p.title);
  await prisma.$disconnect();
})();
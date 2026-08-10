import { prisma } from '../src/lib/prisma';

async function main() {
  const license1 = await prisma.license.upsert({
    where: { key: 'XFT-SEED-0001-ABCD' },
    update: {},
    create: {
      key: 'XFT-SEED-0001-ABCD',
    },
  });

  const license2 = await prisma.license.upsert({
    where: { key: 'XFT-SEED-0002-EFGH' },
    update: {},
    create: {
      key: 'XFT-SEED-0002-EFGH',
    },
  });

  console.log('Database seeded:', { license1, license2 });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

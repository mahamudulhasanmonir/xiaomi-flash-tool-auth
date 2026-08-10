import { prisma } from '../src/lib/prisma';

async function main() {
  try {
    const licenses = await prisma.license.findMany();
    console.log('✅ Connected. Found licenses:', licenses.length);
  } catch (error) {
    console.error('❌ Connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

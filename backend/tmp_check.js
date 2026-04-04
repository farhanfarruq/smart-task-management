const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const projects = await prisma.project.findMany();
  console.log('---START---');
  console.dir(projects, { depth: null });
  console.log('---END---');
}
main().finally(() => process.exit(0));

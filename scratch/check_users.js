const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://barber:barber@127.0.0.1:5432/barberstudio';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany();
  console.log('--- USUARIOS EN BD ---');
  users.forEach(u => {
    console.log(`ID: ${u.id} | Email: ${u.email} | Role: ${u.role}`);
  });
}

main().catch(e => console.error(e)).finally(() => {
  prisma.$disconnect();
  pool.end();
});

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://barber:barber@127.0.0.1:5432/barberstudio';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'stoney.s.lopez@gmail.com';
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (user) {
    console.log(`Usuario encontrado: ${user.id} | Role: ${user.role}`);
    const updated = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    });
    console.log(`¡ÉXITO! Usuario promovido a ADMIN: ${updated.email}`);
  } else {
    console.log(`EL USUARIO ${email} NO EXISTE EN LA DB TODAVÍA.`);
    console.log(`Asegúrate de haber completado el registro en el navegador.`);
  }
}

main().catch(e => console.error(e)).finally(() => {
  prisma.$disconnect();
  pool.end();
});

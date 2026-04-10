import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const connectionString = process.env.DATABASE_URL || 'postgresql://barber:barber@127.0.0.1:5432/barberstudio'

/**
 * Pool size: keep low on serverless (many instances × connections = DB overload).
 * Prefer PgBouncer / Prisma Accelerate / Neon pooler in production DATABASE_URL.
 */
const poolMax = Math.min(50, Math.max(1, parseInt(process.env.PG_POOL_MAX || '10', 10) || 10))

const pool = new Pool({
  connectionString,
  max: poolMax,
  idleTimeoutMillis: 20_000,
  connectionTimeoutMillis: 15_000,
})
const adapter = new PrismaPg(pool)

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

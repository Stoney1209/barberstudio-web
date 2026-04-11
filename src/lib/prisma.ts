import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const connectionString = process.env.DATABASE_URL || 'postgresql://barber:barber@127.0.0.1:5432/barberstudio'

// En Vercel Serverless, limitamos el pool a 1 conexión por instancia para no saturar Supabase.
const isVercel = process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_ENV
const defaultMax = isVercel ? 1 : 10
const poolMax = Math.min(50, Math.max(1, parseInt(process.env.PG_POOL_MAX || String(defaultMax), 10)))

const pool = new Pool({
  connectionString,
  max: poolMax,
  idleTimeoutMillis: 5_000,
  connectionTimeoutMillis: 10_000,
})

const adapter = new PrismaPg(pool)

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

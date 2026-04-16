import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const checks: Record<string, string> = {}
  let allHealthy = true

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = 'healthy'
  } catch {
    checks.database = 'unhealthy'
    allHealthy = false
  }

  const status = allHealthy ? 200 : 503
  return NextResponse.json(
    {
      status: allHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks,
    },
    {
      status,
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'X-Health-Check': 'true',
      },
    }
  )
}

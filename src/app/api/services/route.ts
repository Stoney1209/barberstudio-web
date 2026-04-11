import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { parseOffsetPagination } from '@/lib/pagination'
import { getWriteApiRatelimit } from '@/lib/rate-limit'

const ServiceInput = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  duration: z.number().int().positive(),
  imageUrl: z.string().optional(),
  category: z.enum(['FADE', 'CLASSIC', 'GRADIENT', 'BEARD', 'SHAVE']),
})

const CACHE_MAX_AGE = 60 // seconds

async function checkRateLimit(req: NextRequest): Promise<NextResponse | null> {
  const rl = getWriteApiRatelimit()
  if (!rl) return null

  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? 'unknown'
  const { success, reset } = await rl.limit(`write:${ip}`)
  
  if (!success) {
    const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000))
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Intenta de nuevo en unos segundos.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }
  return null
}

export async function POST(req: NextRequest) {
  const rateLimitError = await checkRateLimit(req)
  if (rateLimitError) return rateLimitError

  const authResult = await requireRole(['ADMIN'])
  if (authResult instanceof NextResponse) return authResult

  try {
    const body = await req.json()
    const parsed = ServiceInput.parse(body)

    const service = await prisma.service.create({
      data: {
        name: parsed.name,
        description: parsed.description,
        price: parsed.price,
        duration: parsed.duration,
        imageUrl: parsed.imageUrl,
        category: parsed.category,
      },
    })

    return NextResponse.json({ service }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos de entrada inválidos', details: err.flatten() }, { status: 400 })
    }
    console.error('services POST:', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const { skip, take, page, limit } = parseOffsetPagination(searchParams, { defaultLimit: 200, maxLimit: 500 })

    const rows = await prisma.service.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        duration: true,
        imageUrl: true,
        category: true,
      },
      orderBy: { name: 'asc' },
      skip,
      take: take + 1,
    })

    const hasMore = rows.length > take
    const services = hasMore ? rows.slice(0, take) : rows

    return NextResponse.json(
      { services, pagination: { page, limit, hasMore } },
      {
        headers: {
          'Cache-Control': `public, max-age=${CACHE_MAX_AGE}, s-maxage=${CACHE_MAX_AGE}`,
        },
      }
    )
  } catch (err) {
    console.error('services GET:', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { parseOffsetPagination } from '@/lib/pagination'

const ServiceInput = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  duration: z.number().int().positive(),
  imageUrl: z.string().optional(),
  category: z.enum(['FADE', 'CLASSIC', 'GRADIENT', 'BEARD', 'SHAVE']),
})

export async function POST(req: NextRequest) {
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

  return NextResponse.json({
    services,
    pagination: { page, limit, hasMore },
  })
}

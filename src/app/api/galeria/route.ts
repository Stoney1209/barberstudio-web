import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { parseOffsetPagination } from '@/lib/pagination'

const GalleryInput = z.object({
  imageUrl: z.string().url(),
  caption: z.string().optional(),
  category: z.enum(['FADE', 'CLASSIC', 'GRADIENT', 'BEARD']).optional(),
  barberId: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const barberId = searchParams.get('barberId')
    const { skip, take, page, limit } = parseOffsetPagination(searchParams, { defaultLimit: 60, maxLimit: 200 })

    const where: Record<string, unknown> = {}
    if (category) where.category = category
    if (barberId) where.barberId = barberId

    const rows = await prisma.gallery.findMany({
      where,
      include: {
        barber: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: take + 1,
    })

    const hasMore = rows.length > take
    const gallery = hasMore ? rows.slice(0, take) : rows

    return NextResponse.json({ gallery, pagination: { page, limit, hasMore } })
  } catch (err) {
    console.error('gallery GET:', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const authResult = await requireRole(['ADMIN', 'BARBER'])
  if (authResult instanceof NextResponse) return authResult

  try {
    const body = await req.json()
    const data = GalleryInput.parse(body)

    if (!data.imageUrl.startsWith('https://res.cloudinary.com/')) {
      return NextResponse.json({ error: 'Solo se permiten imágenes de Cloudinary' }, { status: 400 })
    }

    const gallery = await prisma.gallery.create({
      data: {
        imageUrl: data.imageUrl,
        caption: data.caption,
        category: data.category || 'FADE',
        barberId: data.barberId || null,
      },
    })

    return NextResponse.json({ gallery }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: err.flatten() }, { status: 400 })
    }
    console.error('gallery POST:', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

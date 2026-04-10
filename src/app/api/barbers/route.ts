import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { requireRole } from '@/lib/auth'
import { parseOffsetPagination } from '@/lib/pagination'

const BarberInput = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const includeAvailability = searchParams.get('includeAvailability') === 'true'
    const { skip, take, page, limit } = parseOffsetPagination(searchParams, { defaultLimit: 100, maxLimit: 200 })

    const rows = await prisma.user.findMany({
      where: { role: 'BARBER' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        ...(includeAvailability && {
          availabilities: { where: { isActive: true } },
        }),
      },
      orderBy: { name: 'asc' },
      skip,
      take: take + 1,
    })

    const hasMore = rows.length > take
    const barbers = hasMore ? rows.slice(0, take) : rows

    return NextResponse.json({ barbers, pagination: { page, limit, hasMore } })
  } catch (err) {
    console.error('barbers GET:', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const authResult = await requireRole(['ADMIN'])
  if (authResult instanceof NextResponse) return authResult

  try {
    const body = await req.json()
    const parsed = BarberInput.parse(body)

    const barber = await prisma.user.create({
      data: {
        name: parsed.name,
        email: parsed.email,
        phone: parsed.phone,
        role: 'BARBER',
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    return NextResponse.json({ barber }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos de entrada inválidos', details: err.flatten() }, { status: 400 })
    }
    console.error('barbers POST:', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

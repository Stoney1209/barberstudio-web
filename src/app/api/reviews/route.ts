import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { parseOffsetPagination } from '@/lib/pagination'

const ReviewInput = z.object({
  appointmentId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const barberId = searchParams.get('barberId')
    const serviceId = searchParams.get('serviceId')

    const appointmentFilter: { barberId?: string; serviceId?: string } = {}
    if (barberId) appointmentFilter.barberId = barberId
    if (serviceId) appointmentFilter.serviceId = serviceId

    const where =
      Object.keys(appointmentFilter).length > 0 ? { appointment: appointmentFilter } : {}

    const { skip, take, page, limit } = parseOffsetPagination(searchParams, { defaultLimit: 100, maxLimit: 200 })

    const rows = await prisma.review.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
        appointment: { select: { service: { select: { name: true } }, barber: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: take + 1,
    })

    const hasMore = rows.length > take
    const reviews = hasMore ? rows.slice(0, take) : rows

    return NextResponse.json({ reviews, pagination: { page, limit, hasMore } })
  } catch (err) {
    console.error('reviews GET:', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const authResult = await requireAuth()
  if (authResult instanceof NextResponse) return authResult
  const { userId } = authResult

  try {
    const body = await req.json()
    const data = ReviewInput.parse(body)

    const appointment = await prisma.appointment.findUnique({
      where: { id: data.appointmentId },
      include: { review: true },
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 })
    }

    // C-6: Verify that the authenticated user is the client who had the appointment
    if (appointment.clientId !== userId) {
      return NextResponse.json({ error: 'Prohibido: Solo el cliente de la cita puede reseñar' }, { status: 403 })
    }

    if (appointment.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Solo puedes reseñar citas completadas' }, { status: 400 })
    }

    if (appointment.review) {
      return NextResponse.json({ error: 'Esta cita ya tiene una reseña' }, { status: 409 })
    }

    const review = await prisma.review.create({
      data: {
        appointmentId: data.appointmentId,
        clientId: userId, // Use verified userId
        rating: data.rating,
        comment: data.comment,
      },
      include: {
        client: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: err.flatten() }, { status: 400 })
    }
    console.error('reviews POST:', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

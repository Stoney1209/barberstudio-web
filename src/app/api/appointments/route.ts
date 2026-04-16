import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { parseOffsetPagination } from '@/lib/pagination'
import { resolveBarberDayWindow, validateAppointmentTimeWindow } from '@/lib/booking-validation'
import { getLocalDateString, parseDateOnlyAsUTC } from '@/lib/booking-utils'
import type { Prisma } from '@prisma/client'

// ── Fix 3: clientId ya NO se acepta desde el body — se toma de la sesión ──
const AppointmentInput = z.object({
  barberId: z.string(),
  serviceId: z.string(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  notes: z.string().optional(),
})

type ConflictError = Error & { code?: string }

async function verifyBarber(barberId: string) {
  const barber = await prisma.user.findUnique({ where: { id: barberId } })
  if (!barber || barber.role !== 'BARBER') return null
  return barber
}

async function verifyService(serviceId: string) {
  return prisma.service.findUnique({ where: { id: serviceId } })
}

export async function POST(req: NextRequest) {
  // ── Fix 3: requerir sesión activa ──
  const authResult = await requireAuth()
  if (authResult instanceof NextResponse) return authResult
  const { userId } = authResult

  try {
    const body = await req.json()
    const data = AppointmentInput.parse(body)

    const [barber, service, client] = await Promise.all([
      verifyBarber(data.barberId),
      verifyService(data.serviceId),
      prisma.user.findUnique({ where: { id: userId } }),
    ])

    if (!barber) {
      return NextResponse.json({ error: 'Barbero no válido' }, { status: 400 })
    }
    if (!service) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
    }
    if (!client) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    const appointmentDate = parseDateOnlyAsUTC(data.date)
    const today = getLocalDateString(new Date())
    
    // M-4: Validation for future date
    if (data.date < today) {
      return NextResponse.json({ error: 'La fecha de la cita debe ser futura' }, { status: 400 })
    }

    const dayWindow = await resolveBarberDayWindow(data.barberId, appointmentDate)
    if (dayWindow.status === 'closed') {
      return NextResponse.json({ error: 'El barbero no atiende este día' }, { status: 400 })
    }
    const timeValidation = validateAppointmentTimeWindow(
      data.startTime,
      data.endTime,
      service.duration,
      dayWindow.startMin,
      dayWindow.endMin
    )
    if (!timeValidation.ok) {
      return NextResponse.json({ error: timeValidation.error }, { status: 400 })
    }

    // Transacción + bloqueo advisory por barbero+día para reducir carreras concurrentes (doble booking).
    const lockKey = `${data.barberId}|${data.date}`
    const appointment = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe('SELECT pg_advisory_xact_lock(abs(hashtext($1::text)))', lockKey)

      const existing = await tx.appointment.findFirst({
        where: {
          barberId: data.barberId,
          date: appointmentDate,
          status: { not: 'CANCELLED' },
          OR: [
            { startTime: { lte: data.startTime }, endTime: { gt: data.startTime } },
            { startTime: { lt: data.endTime }, endTime: { gte: data.endTime } },
            { startTime: { gte: data.startTime }, endTime: { lte: data.endTime } },
          ],
        },
      })

      if (existing) {
        // Lanzar un error reconocible para el catch externo
        const err: ConflictError = new Error('CONFLICT')
        err.code = 'CONFLICT'
        throw err
      }

      return tx.appointment.create({
        data: {
          clientId: userId,
          barberId: data.barberId,
          serviceId: data.serviceId,
          date: appointmentDate,
          startTime: data.startTime,
          endTime: data.endTime,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          notes: data.notes,
        },
      })
    })

    return NextResponse.json({ appointment }, { status: 201 })
  } catch (err: unknown) {
    const maybeConflict = err as ConflictError
    if (maybeConflict?.code === 'CONFLICT') {
      return NextResponse.json({ error: 'Conflicto de horario' }, { status: 409 })
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos de entrada inválidos', details: err.flatten() }, { status: 400 })
    }
    console.error('appointments POST:', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  // ── Fix 3: requerir sesión para listar citas ──
  const authResult = await requireAuth()
  if (authResult instanceof NextResponse) return authResult
  const { userId } = authResult

  try {
    const dbUser = await prisma.user.findUnique({ where: { id: userId } })
    const { searchParams } = new URL(req.url)
    const barberId = searchParams.get('barberId')
    const clientId = searchParams.get('clientId')
    const date = searchParams.get('date')
    const status = searchParams.get('status')
    const forReview = searchParams.get('forReview')

    const where: Prisma.AppointmentWhereInput = {}

    // ADMIN y BARBER pueden filtrar por cualquier barbero/cliente
    // CLIENT solo puede ver sus propias citas
    if (dbUser?.role === 'CLIENT') {
      where.clientId = userId
    } else {
      if (barberId) where.barberId = barberId
      if (clientId) where.clientId = clientId
    }

    if (date) where.date = parseDateOnlyAsUTC(date)

    if (status) where.status = status

    if (forReview === 'true' && dbUser?.role === 'CLIENT') {
      where.status = 'COMPLETED'
      where.review = null
    }

    const { skip, take, page, limit } = parseOffsetPagination(searchParams, { defaultLimit: 100, maxLimit: 500 })

    const rows = await prisma.appointment.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, email: true } },
        barber: { select: { id: true, name: true } },
        service: { select: { id: true, name: true, price: true, duration: true } },
      },
      orderBy: { date: 'asc' },
      skip,
      take: take + 1,
    })

    const hasMore = rows.length > take
    const appointments = hasMore ? rows.slice(0, take) : rows

    return NextResponse.json({ appointments, pagination: { page, limit, hasMore } })
  } catch (err) {
    console.error('appointments GET:', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

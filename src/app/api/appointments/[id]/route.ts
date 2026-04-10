import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth, getSessionUser } from '@/lib/auth'

const AppointmentUpdate = z.object({
  date: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'PARTIALLY_PAID', 'CANCELLED']).optional(),
  notes: z.string().optional(),
})

/**
 * Helper: verifica que el usuario autenticado pueda acceder a esta cita.
 * Roles permitidos: el propio cliente, el barbero asignado, o un ADMIN.
 */
async function canAccessAppointment(
  userId: string,
  appointmentId: string
): Promise<
  | { allowed: true; appointment: Awaited<ReturnType<typeof prisma.appointment.findUnique>> }
  | { allowed: false; response: NextResponse }
> {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      client: { select: { id: true, name: true, email: true, phone: true } },
      barber: { select: { id: true, name: true, email: true } },
      service: { select: { id: true, name: true, price: true, duration: true } },
    },
  })

  if (!appointment) {
    return {
      allowed: false,
      response: NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 }),
    }
  }

  const dbUser = await prisma.user.findUnique({ where: { id: userId } })
  const isOwner = appointment.clientId === userId
  const isBarber = appointment.barberId === userId
  const isAdmin = dbUser?.role === 'ADMIN'

  if (!isOwner && !isBarber && !isAdmin) {
    return {
      allowed: false,
      response: NextResponse.json({ error: 'Prohibido' }, { status: 403 }),
    }
  }

  return { allowed: true, appointment }
}

// ─── GET /api/appointments/[id] ───────────────────────────────────────────────
export async function GET(req: NextRequest, ctx: { params: { id: string } }) {
  const { id } = ctx.params

  // Fix 2: requerir sesión
  const authResult = await requireAuth()
  if (authResult instanceof NextResponse) return authResult
  const { userId } = authResult

  // Fix 2: verificar ownership / rol
  const access = await canAccessAppointment(userId, id)
  if (!access.allowed) return access.response

  return NextResponse.json({ appointment: access.appointment })
}

// ─── PUT /api/appointments/[id] ───────────────────────────────────────────────
export async function PUT(req: NextRequest, ctx: { params: { id: string } }) {
  const { id } = ctx.params

  // Fix 2: requerir sesión
  const authResult = await requireAuth()
  if (authResult instanceof NextResponse) return authResult
  const { userId } = authResult

  // Fix 2: verificar ownership / rol antes de modificar
  const access = await canAccessAppointment(userId, id)
  if (!access.allowed) return access.response

  try {
    const body = await req.json()
    const parsed = AppointmentUpdate.parse(body)

    const data: any = { ...parsed }
    if (parsed.date) {
      data.date = new Date(parsed.date)
    }

    if (parsed.startTime && parsed.endTime) {
      const existingAppointment = access.appointment!
      const existing = await prisma.appointment.findFirst({
        where: {
          barberId: existingAppointment.barberId,
          date: existingAppointment.date,
          status: { not: 'CANCELLED' },
          id: { not: id },
          OR: [
            { startTime: { lte: parsed.startTime }, endTime: { gt: parsed.startTime } },
            { startTime: { lt: parsed.endTime }, endTime: { gte: parsed.endTime } },
          ],
        },
      })

      if (existing) {
        return NextResponse.json({ error: 'Conflicto de horario' }, { status: 409 })
      }
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data,
      include: {
        client: { select: { id: true, name: true } },
        barber: { select: { id: true, name: true } },
        service: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ appointment })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: err.flatten() }, { status: 400 })
    }
    console.error('appointments/[id] PUT:', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// ─── DELETE /api/appointments/[id] ────────────────────────────────────────────
export async function DELETE(req: NextRequest, ctx: { params: { id: string } }) {
  const { id } = ctx.params

  // Fix 2: requerir sesión
  const authResult = await requireAuth()
  if (authResult instanceof NextResponse) return authResult
  const { userId } = authResult

  // Fix 2: verificar ownership / rol antes de cancelar
  const access = await canAccessAppointment(userId, id)
  if (!access.allowed) return access.response

  try {
    await prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('appointments/[id] DELETE:', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
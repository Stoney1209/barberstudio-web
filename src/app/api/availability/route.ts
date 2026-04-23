import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { resolveBarberDayWindow } from '@/lib/booking-validation'
import {
  slotStartsInWindow,
  minutesToHHMM,
  hhmmToMinutes,
  getLocalDateString,
  parseDateOnlyAsUTC,
  SLOT_STEP_MINUTES,
} from '@/lib/booking-utils'

const SLOT_DURATION = SLOT_STEP_MINUTES

const CACHE_MAX_AGE = 30 // seconds

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const barberId = searchParams.get('barberId')
    const date = searchParams.get('date')
    const durationRequested = parseInt(searchParams.get('duration') || '30', 10)

    if (!barberId) {
      return NextResponse.json({ error: 'Parámetro requerido: barberId' }, { status: 400 })
    }

    if (!date) {
      const availabilities = await prisma.availability.findMany({
        where: { barberId },
        take: 500,
      })
      return NextResponse.json({ availabilities })
    }

    const barber = await prisma.user.findUnique({
      where: { id: barberId },
      select: { id: true, name: true },
    })
    if (!barber) {
      return NextResponse.json({ error: 'Barbero no encontrado' }, { status: 404 })
    }

    const dateObj = parseDateOnlyAsUTC(date)
    const dayWindow = await resolveBarberDayWindow(barberId, dateObj)

    if (dayWindow.status === 'closed') {
      return NextResponse.json(
        {
          barber,
          date,
          durationRequested,
          closedDay: true,
          message: 'El barbero no atiende este día',
          workingHours: null,
          availableSlots: [],
        },
        {
          headers: {
            'Cache-Control': `public, max-age=${CACHE_MAX_AGE}, s-maxage=${CACHE_MAX_AGE}`,
          },
        }
      )
    }

    const { startMin, endMin } = dayWindow

    const appointments = await prisma.appointment.findMany({
      where: {
        barberId,
        date: dateObj,
        status: { not: 'CANCELLED' },
      },
      select: { startTime: true, endTime: true },
      take: 500,
    })

    const occupiedSlots: string[] = []
    appointments.forEach((apt) => {
      let currentMin = hhmmToMinutes(apt.startTime)
      const endMin = hhmmToMinutes(apt.endTime)
      while (currentMin < endMin) {
        occupiedSlots.push(minutesToHHMM(currentMin))
        currentMin += SLOT_DURATION
      }
    })

    const allSlots = slotStartsInWindow(startMin, endMin, SLOT_DURATION)

    const availableSlots = allSlots.filter((slot, index) => {
      // Si la fecha es hoy, filtrar horarios pasados
      if (date === getLocalDateString(new Date())) {
        const now = new Date()
        const nowMinutes = now.getHours() * 60 + now.getMinutes()
        const slotMinutes = hhmmToMinutes(slot)
        if (slotMinutes <= nowMinutes) return false
      }

      if (occupiedSlots.includes(slot)) return false

      const slotsNeeded = Math.ceil(durationRequested / SLOT_DURATION)
      if (slotsNeeded <= 1) return true

      for (let i = 0; i < slotsNeeded; i++) {
        const nextSlot = allSlots[index + i]
        if (!nextSlot || occupiedSlots.includes(nextSlot)) return false

        if (i > 0) {
          const prevSlot = allSlots[index + i - 1]
          const prevMin = hhmmToMinutes(prevSlot)
          const currMin = hhmmToMinutes(nextSlot)
          if (currMin - prevMin !== SLOT_DURATION) return false
        }
      }

      return true
    })

    return NextResponse.json(
      {
        barber,
        date,
        durationRequested,
        closedDay: false,
        workingHours: {
          start: minutesToHHMM(startMin),
          end: minutesToHHMM(endMin),
        },
        availableSlots,
      },
      {
        headers: {
          'Cache-Control': `public, max-age=${CACHE_MAX_AGE}, s-maxage=${CACHE_MAX_AGE}`,
        },
      }
    )
  } catch (err) {
    console.error('availability GET:', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

const AvailabilityInput = z.object({
  barberId: z.string(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  isActive: z.boolean().optional(),
})

export async function POST(req: NextRequest) {
  const authResult = await requireRole(['ADMIN', 'BARBER'])
  if (authResult instanceof NextResponse) return authResult

  try {
    const body = await req.json()
    const parsed = AvailabilityInput.parse(body)

    const availability = await prisma.availability.upsert({
      where: {
        barberId_dayOfWeek: { barberId: parsed.barberId, dayOfWeek: parsed.dayOfWeek },
      },
      create: {
        barberId: parsed.barberId,
        dayOfWeek: parsed.dayOfWeek,
        startTime: parsed.startTime,
        endTime: parsed.endTime,
        isActive: parsed.isActive ?? true,
      },
      update: {
        startTime: parsed.startTime,
        endTime: parsed.endTime,
        isActive: parsed.isActive ?? true,
      },
    })

    return NextResponse.json({ availability })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos de entrada inválidos', details: err.flatten() }, { status: 400 })
    }
    console.error('availability POST:', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

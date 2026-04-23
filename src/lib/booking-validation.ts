import { prisma } from '@/lib/prisma'
import {
  hhmmToMinutes,
  isSlotAlignedToGrid,
} from './booking-utils'

/** Debe coincidir con el fallback histórico en `src/app/api/availability/route.ts` */
export const DEFAULT_WORKING_START_MIN = 9 * 60
export const DEFAULT_WORKING_END_MIN = 21 * 60

export type BarberDayWindow =
  | { status: 'closed' }
  | { status: 'open'; startMin: number; endMin: number }

/**
 * Si el barbero tiene al menos un horario activo en BD, solo abre los días con registro explícito.
 * Si no tiene ninguno, se usa el horario por defecto 9:00–21:00 todos los días (onboarding).
 *
 * Optimized: single query fetching all active availabilities for this barber,
 * then checking in-memory if the specific day is present.
 */
export async function resolveBarberDayWindow(barberId: string, appointmentDate: Date): Promise<BarberDayWindow> {
  const dayOfWeek = appointmentDate.getUTCDay()

  const activeAvailabilities = await prisma.availability.findMany({
    where: { barberId, isActive: true },
    select: { dayOfWeek: true, startTime: true, endTime: true },
  })

  if (activeAvailabilities.length === 0) {
    // No configured schedule — use default hours for all days (onboarding)
    return {
      status: 'open',
      startMin: DEFAULT_WORKING_START_MIN,
      endMin: DEFAULT_WORKING_END_MIN,
    }
  }

  const row = activeAvailabilities.find(a => a.dayOfWeek === dayOfWeek)

  if (!row) {
    return { status: 'closed' }
  }

  return {
    status: 'open',
    startMin: hhmmToMinutes(row.startTime),
    endMin: hhmmToMinutes(row.endTime),
  }
}

export function validateAppointmentTimeWindow(
  startTime: string,
  endTime: string,
  serviceDurationMinutes: number,
  windowStartMin: number,
  windowEndMin: number
): { ok: true } | { ok: false; error: string } {
  const startMin = hhmmToMinutes(startTime)
  const endMin = hhmmToMinutes(endTime)
  if (!Number.isFinite(startMin) || !Number.isFinite(endMin)) {
    return { ok: false, error: 'Formato de hora inválido' }
  }
  if (startMin >= endMin) {
    return { ok: false, error: 'La hora de inicio debe ser anterior a la de fin' }
  }
  if (endMin - startMin !== serviceDurationMinutes) {
    return { ok: false, error: 'El rango horario no coincide con la duración del servicio' }
  }
  if (!isSlotAlignedToGrid(startMin)) {
    return { ok: false, error: 'La hora de inicio debe coincidir con franjas de 30 minutos' }
  }
  if (startMin < windowStartMin || endMin > windowEndMin) {
    return { ok: false, error: 'El horario está fuera de la disponibilidad del barbero' }
  }
  return { ok: true }
}

import { prisma } from '@/lib/prisma'

/** Debe coincidir con el fallback histórico en `src/app/api/availability/route.ts` */
export const DEFAULT_WORKING_START_MIN = 9 * 60
export const DEFAULT_WORKING_END_MIN = 21 * 60

export const SLOT_STEP_MINUTES = 30

export function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map((x) => parseInt(x, 10))
  if (Number.isNaN(h) || Number.isNaN(m)) return NaN
  return h * 60 + m
}

export function minutesToHHMM(totalMin: number): string {
  const h = Math.floor(totalMin / 60) % 24
  const m = totalMin % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/**
 * Inicios de franjas de `slotLength` min dentro de [startMin, endMin) (fin exclusivo del último bloque).
 */
export function slotStartsInWindow(startMin: number, endMin: number, slotLength = SLOT_STEP_MINUTES): string[] {
  const out: string[] = []
  for (let t = startMin; t + slotLength <= endMin; t += slotLength) {
    out.push(minutesToHHMM(t))
  }
  return out
}

export type BarberDayWindow =
  | { status: 'closed' }
  | { status: 'open'; startMin: number; endMin: number }

/**
 * Si el barbero tiene al menos un horario activo en BD, solo abre los días con registro explícito.
 * Si no tiene ninguno, se usa el horario por defecto 9:00–21:00 todos los días (onboarding).
 */
export async function resolveBarberDayWindow(barberId: string, appointmentDate: Date): Promise<BarberDayWindow> {
  const dayOfWeek = appointmentDate.getDay()

  const configuredActive = await prisma.availability.count({
    where: { barberId, isActive: true },
  })

  const row = await prisma.availability.findFirst({
    where: { barberId, dayOfWeek, isActive: true },
  })

  if (configuredActive > 0 && !row) {
    return { status: 'closed' }
  }

  if (row) {
    return {
      status: 'open',
      startMin: hhmmToMinutes(row.startTime),
      endMin: hhmmToMinutes(row.endTime),
    }
  }

  return {
    status: 'open',
    startMin: DEFAULT_WORKING_START_MIN,
    endMin: DEFAULT_WORKING_END_MIN,
  }
}

export function getLocalDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function isSlotAlignedToGrid(startMin: number): boolean {
  if (!Number.isFinite(startMin)) return false
  return startMin % SLOT_STEP_MINUTES === 0
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

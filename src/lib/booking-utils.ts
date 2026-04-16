/**
 * Utilidades de fecha y tiempo seguras para ser usadas tanto en Client como en Server.
 * No deben importar nada que dependa de Node.js o Prisma.
 */

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

export function getLocalDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseDateOnlyAsUTC(dateString: string): Date {
  return new Date(`${dateString}T00:00:00.000Z`)
}

/**
 * Obtiene la fecha en formato YYYY-MM-DD usando los métodos UTC.
 * Útil para fechas que se guardaron como Medianoche UTC.
 */
export function getUTCDateString(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getStoredDateString(value: Date | string): string {
  return getUTCDateString(typeof value === 'string' ? new Date(value) : value)
}

export function formatStoredDate(
  value: Date | string,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return date.toLocaleDateString(locale, { timeZone: 'UTC', ...options })
}

export function isSlotAlignedToGrid(startMin: number): boolean {
  if (!Number.isFinite(startMin)) return false
  return startMin % SLOT_STEP_MINUTES === 0
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

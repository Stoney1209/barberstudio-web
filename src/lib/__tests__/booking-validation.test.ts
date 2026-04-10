import { validateAppointmentTimeWindow, hhmmToMinutes, DEFAULT_WORKING_START_MIN, DEFAULT_WORKING_END_MIN } from '../booking-validation'

describe('validateAppointmentTimeWindow', () => {
  it('accepts a slot inside default window with matching duration', () => {
    const r = validateAppointmentTimeWindow('10:00', '10:30', 30, DEFAULT_WORKING_START_MIN, DEFAULT_WORKING_END_MIN)
    expect(r).toEqual({ ok: true })
  })

  it('rejects when end exceeds window', () => {
    const r = validateAppointmentTimeWindow('20:30', '21:30', 60, DEFAULT_WORKING_START_MIN, DEFAULT_WORKING_END_MIN)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toContain('disponibilidad')
  })

  it('rejects duration mismatch', () => {
    const r = validateAppointmentTimeWindow('10:00', '10:30', 60, DEFAULT_WORKING_START_MIN, DEFAULT_WORKING_END_MIN)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toContain('duración')
  })

  it('rejects non-slot-aligned start', () => {
    const r = validateAppointmentTimeWindow('10:15', '10:45', 30, DEFAULT_WORKING_START_MIN, DEFAULT_WORKING_END_MIN)
    expect(r.ok).toBe(false)
  })
})

describe('hhmmToMinutes', () => {
  it('parses HH:mm', () => {
    expect(hhmmToMinutes('09:30')).toBe(9 * 60 + 30)
  })
})

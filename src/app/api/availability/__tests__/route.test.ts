import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GET, POST } from '../route'

const p = prisma as unknown as {
  user: { findUnique: jest.Mock }
  availability: { findMany: jest.Mock; findFirst: jest.Mock; count: jest.Mock; upsert: jest.Mock }
  appointment: { findMany: jest.Mock }
}

describe('GET /api/availability', () => {
  beforeEach(() => {
    p.availability.count.mockResolvedValue(0)
    p.availability.findFirst.mockResolvedValue(null)
  })
  it('returns 400 when barberId is missing', async () => {
    const req = new NextRequest('http://localhost/api/availability?date=2026-06-15')
    const res = await GET(req)
    expect(res.status).toBe(400)
  })

  it('returns availabilities when date is omitted', async () => {
    const rows = [{ id: 'a1', barberId: 'b1', dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }]
    p.availability.findMany.mockResolvedValue(rows)

    const req = new NextRequest('http://localhost/api/availability?barberId=b1')
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.availabilities).toEqual(rows)
  })

  it('returns 404 when barber does not exist', async () => {
    p.user.findUnique.mockResolvedValue(null)

    const req = new NextRequest('http://localhost/api/availability?barberId=missing&date=2026-06-15')
    const res = await GET(req)
    expect(res.status).toBe(404)
  })

  it('returns empty slots when barber has schedule but not this weekday', async () => {
    p.user.findUnique.mockResolvedValue({ id: 'b1', name: 'Barber' })
    p.availability.count.mockResolvedValue(1)
    p.availability.findFirst.mockResolvedValue(null)

    const req = new NextRequest('http://localhost/api/availability?barberId=b1&date=2026-06-15')
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.closedDay).toBe(true)
    expect(body.availableSlots).toEqual([])
  })

  it('computes available slots excluding booked times', async () => {
    p.user.findUnique.mockResolvedValue({ id: 'b1', name: 'Barber' })
    p.appointment.findMany.mockResolvedValue([
      { startTime: '10:00', endTime: '10:30' },
    ])

    const req = new NextRequest('http://localhost/api/availability?barberId=b1&date=2026-06-15')
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.availableSlots).not.toContain('10:00')
    expect(body.availableSlots).toContain('09:00')
  })
})

describe('POST /api/availability', () => {
  it('returns 401 when not authenticated', async () => {
    (requireRole as jest.Mock).mockResolvedValueOnce(
      NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    )

    const req = new NextRequest('http://localhost/api/availability', {
      method: 'POST',
      body: JSON.stringify({
        barberId: 'b1',
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 403 when user is CLIENT', async () => {
    (requireRole as jest.Mock).mockResolvedValueOnce(
      NextResponse.json({ error: 'Prohibido' }, { status: 403 })
    )

    const req = new NextRequest('http://localhost/api/availability', {
      method: 'POST',
      body: JSON.stringify({
        barberId: 'b1',
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await POST(req)
    expect(res.status).toBe(403)
  })

  it('upserts availability for BARBER', async () => {
    (requireRole as jest.Mock).mockResolvedValueOnce({ userId: 'test-user-id', role: 'BARBER' })
    const saved = {
      id: 'av1',
      barberId: 'b1',
      dayOfWeek: 2,
      startTime: '10:00',
      endTime: '18:00',
      isActive: true,
    }
    p.availability.upsert.mockResolvedValue(saved)

    const req = new NextRequest('http://localhost/api/availability', {
      method: 'POST',
      body: JSON.stringify({
        barberId: 'b1',
        dayOfWeek: 2,
        startTime: '10:00',
        endTime: '18:00',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.availability).toEqual(saved)
  })
})

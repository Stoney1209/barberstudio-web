import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GET, POST } from '../route'

const p = prisma as unknown as {
  user: { findUnique: jest.Mock; findMany: jest.Mock }
  service: { findUnique: jest.Mock }
  appointment: { findMany: jest.Mock; findFirst: jest.Mock; create: jest.Mock }
  availability: { findFirst: jest.Mock; count: jest.Mock }
  $transaction: jest.Mock
}

function tomorrowDateString() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

describe('POST /api/appointments', () => {
  beforeEach(() => {
    p.availability.findFirst.mockResolvedValue(null)
    p.availability.count.mockResolvedValue(0)
    ;(requireAuth as jest.Mock).mockResolvedValue({ userId: 'test-user-id' })
  })

  it('creates an appointment when data is valid and no conflict', async () => {
    const barberId = 'barber-1'
    const serviceId = 'svc-1'
    const dateStr = tomorrowDateString()

    p.user.findUnique.mockImplementation(async (args: { where: { id: string } }) => {
      if (args.where.id === barberId) return { id: barberId, role: 'BARBER', name: 'B' }
      if (args.where.id === 'test-user-id') return { id: 'test-user-id', role: 'CLIENT', name: 'C' }
      return null
    })
    p.service.findUnique.mockResolvedValue({ id: serviceId, name: 'Cut', duration: 30 })

    const created = {
      id: 'apt-1',
      clientId: 'test-user-id',
      barberId,
      serviceId,
      date: new Date(dateStr + 'T00:00:00'),
      startTime: '10:00',
      endTime: '10:30',
      status: 'PENDING',
      paymentStatus: 'PENDING',
    }
    p.appointment.findFirst.mockResolvedValue(null)
    p.appointment.create.mockResolvedValue(created)
    const $executeRawUnsafe = jest.fn().mockResolvedValue(undefined)
    p.$transaction.mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) =>
      cb({
        appointment: {
          findFirst: p.appointment.findFirst,
          create: p.appointment.create,
        },
        $executeRawUnsafe,
      })
    )

    const req = new NextRequest('http://localhost/api/appointments', {
      method: 'POST',
      body: JSON.stringify({
        barberId,
        serviceId,
        date: dateStr,
        startTime: '10:00',
        endTime: '10:30',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.appointment.clientId).toBe('test-user-id')
    expect(p.appointment.create).toHaveBeenCalled()
    expect($executeRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining('pg_advisory_xact_lock'),
      `${barberId}|${dateStr}`
    )
  })

  it('returns 401 when not authenticated', async () => {
    ;(requireAuth as jest.Mock).mockResolvedValueOnce(
      NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    )

    const req = new NextRequest('http://localhost/api/appointments', {
      method: 'POST',
      body: JSON.stringify({
        barberId: 'b',
        serviceId: 's',
        date: tomorrowDateString(),
        startTime: '10:00',
        endTime: '11:00',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 for invalid barber', async () => {
    p.user.findUnique.mockImplementation(async (args: { where: { id: string } }) => {
      if (args.where.id === 'test-user-id') return { id: 'test-user-id', role: 'CLIENT' }
      return { id: args.where.id, role: 'CLIENT' }
    })
    p.service.findUnique.mockResolvedValue({ id: 's', name: 'X' })

    const req = new NextRequest('http://localhost/api/appointments', {
      method: 'POST',
      body: JSON.stringify({
        barberId: 'not-barber',
        serviceId: 's',
        date: tomorrowDateString(),
        startTime: '10:00',
        endTime: '11:00',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
    const j = await res.json()
    expect(j.error).toContain('Barbero')
  })

  it('returns 404 when service missing', async () => {
    p.user.findUnique.mockImplementation(async (args: { where: { id: string } }) => {
      if (args.where.id === 'barber-1') return { id: 'barber-1', role: 'BARBER' }
      if (args.where.id === 'test-user-id') return { id: 'test-user-id', role: 'CLIENT' }
      return null
    })
    p.service.findUnique.mockResolvedValue(null)

    const req = new NextRequest('http://localhost/api/appointments', {
      method: 'POST',
      body: JSON.stringify({
        barberId: 'barber-1',
        serviceId: 'missing',
        date: tomorrowDateString(),
        startTime: '10:00',
        endTime: '11:00',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await POST(req)
    expect(res.status).toBe(404)
  })

  it('returns 400 when date is in the past', async () => {
    p.user.findUnique.mockImplementation(async (args: { where: { id: string } }) => {
      if (args.where.id === 'b1') return { id: 'b1', role: 'BARBER' }
      if (args.where.id === 'test-user-id') return { id: 'test-user-id', role: 'CLIENT' }
      return null
    })
    p.service.findUnique.mockResolvedValue({ id: 's1', name: 'X' })

    const req = new NextRequest('http://localhost/api/appointments', {
      method: 'POST',
      body: JSON.stringify({
        barberId: 'b1',
        serviceId: 's1',
        date: '2000-01-01',
        startTime: '10:00',
        endTime: '11:00',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when startTime >= endTime', async () => {
    p.user.findUnique.mockImplementation(async (args: { where: { id: string } }) => {
      if (args.where.id === 'b1') return { id: 'b1', role: 'BARBER' }
      if (args.where.id === 'test-user-id') return { id: 'test-user-id', role: 'CLIENT' }
      return null
    })
    p.service.findUnique.mockResolvedValue({ id: 's1', name: 'X', duration: 30 })

    const req = new NextRequest('http://localhost/api/appointments', {
      method: 'POST',
      body: JSON.stringify({
        barberId: 'b1',
        serviceId: 's1',
        date: tomorrowDateString(),
        startTime: '11:00',
        endTime: '10:00',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when barber does not work that weekday', async () => {
    const dateStr = tomorrowDateString()
    p.availability.count.mockResolvedValue(2)
    p.availability.findFirst.mockResolvedValue(null)
    p.user.findUnique.mockImplementation(async (args: { where: { id: string } }) => {
      if (args.where.id === 'b1') return { id: 'b1', role: 'BARBER' }
      if (args.where.id === 'test-user-id') return { id: 'test-user-id', role: 'CLIENT' }
      return null
    })
    p.service.findUnique.mockResolvedValue({ id: 's1', name: 'Cut', duration: 30 })

    const req = new NextRequest('http://localhost/api/appointments', {
      method: 'POST',
      body: JSON.stringify({
        barberId: 'b1',
        serviceId: 's1',
        date: dateStr,
        startTime: '10:00',
        endTime: '10:30',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
    const j = await res.json()
    expect(j.error).toContain('no atiende este día')
  })

  it('returns 400 when time is outside barber availability window', async () => {
    const dateStr = tomorrowDateString()
    p.availability.count.mockResolvedValue(1)
    p.availability.findFirst.mockResolvedValue({
      id: 'av1',
      barberId: 'b1',
      dayOfWeek: new Date(dateStr + 'T00:00:00').getDay(),
      startTime: '09:00',
      endTime: '12:00',
      isActive: true,
    })
    p.user.findUnique.mockImplementation(async (args: { where: { id: string } }) => {
      if (args.where.id === 'b1') return { id: 'b1', role: 'BARBER' }
      if (args.where.id === 'test-user-id') return { id: 'test-user-id', role: 'CLIENT' }
      return null
    })
    p.service.findUnique.mockResolvedValue({ id: 's1', name: 'Cut', duration: 30 })

    const req = new NextRequest('http://localhost/api/appointments', {
      method: 'POST',
      body: JSON.stringify({
        barberId: 'b1',
        serviceId: 's1',
        date: dateStr,
        startTime: '14:00',
        endTime: '14:30',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
    const j = await res.json()
    expect(j.error).toContain('disponibilidad')
  })

  it('returns 409 on schedule conflict', async () => {
    const dateStr = tomorrowDateString()
    p.user.findUnique.mockImplementation(async (args: { where: { id: string } }) => {
      if (args.where.id === 'b1') return { id: 'b1', role: 'BARBER' }
      if (args.where.id === 'test-user-id') return { id: 'test-user-id', role: 'CLIENT' }
      return null
    })
    p.service.findUnique.mockResolvedValue({ id: 's1', name: 'X', duration: 30 })

    p.$transaction.mockRejectedValueOnce(Object.assign(new Error('CONFLICT'), { code: 'CONFLICT' }))

    const req = new NextRequest('http://localhost/api/appointments', {
      method: 'POST',
      body: JSON.stringify({
        barberId: 'b1',
        serviceId: 's1',
        date: dateStr,
        startTime: '10:00',
        endTime: '10:30',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await POST(req)
    expect(res.status).toBe(409)
  })
})

describe('GET /api/appointments', () => {
  beforeEach(() => {
    ;(requireAuth as jest.Mock).mockResolvedValue({ userId: 'test-user-id' })
  })

  it('returns 401 when not authenticated', async () => {
    ;(requireAuth as jest.Mock).mockResolvedValueOnce(
      NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    )
    const req = new NextRequest('http://localhost/api/appointments')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('scopes to own appointments for CLIENT role', async () => {
    p.user.findUnique.mockResolvedValue({ id: 'test-user-id', role: 'CLIENT' })
    p.appointment.findMany.mockResolvedValue([])

    const req = new NextRequest('http://localhost/api/appointments?barberId=other')
    const res = await GET(req)

    expect(res.status).toBe(200)
    expect(p.appointment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ clientId: 'test-user-id' }),
        skip: 0,
        take: 101,
      })
    )
  })

  it('allows ADMIN to filter by barberId and date', async () => {
    p.user.findUnique.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' })
    p.appointment.findMany.mockResolvedValue([])

    const req = new NextRequest('http://localhost/api/appointments?barberId=b1&date=2026-06-15')
    const res = await GET(req)

    expect(res.status).toBe(200)
    expect(p.appointment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          barberId: 'b1',
          date: new Date('2026-06-15T00:00:00'),
        }),
        skip: 0,
        take: 101,
      })
    )
  })
})

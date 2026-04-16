import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GET, PUT, DELETE } from '../route'
import { parseDateOnlyAsUTC } from '@/lib/booking-utils'

const p = prisma as unknown as {
  user: { findUnique: jest.Mock }
  appointment: { findUnique: jest.Mock; findFirst: jest.Mock; update: jest.Mock }
}

const baseAppointment = {
  id: 'apt-1',
  clientId: 'test-user-id',
  barberId: 'barber-1',
  serviceId: 's1',
  date: parseDateOnlyAsUTC('2026-06-01'),
  startTime: '10:00',
  endTime: '10:30',
  status: 'PENDING',
  client: { id: 'test-user-id', name: 'C', email: 'c@x.com', phone: null },
  barber: { id: 'barber-1', name: 'B', email: 'b@x.com' },
  service: { id: 's1', name: 'Cut', price: 20, duration: 30 },
}

describe('GET /api/appointments/[id]', () => {
  beforeEach(() => {
    (requireAuth as jest.Mock).mockResolvedValue({ userId: 'test-user-id' })
  })

  it('returns 401 when unauthenticated', async () => {
    (requireAuth as jest.Mock).mockResolvedValueOnce(
      NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    )
    const req = new NextRequest('http://localhost/api/appointments/apt-1')
    const res = await GET(req, { params: { id: 'apt-1' } })
    expect(res.status).toBe(401)
  })

  it('returns appointment for client owner', async () => {
    p.appointment.findUnique.mockResolvedValue(baseAppointment)
    p.user.findUnique.mockResolvedValue({ id: 'test-user-id', role: 'CLIENT' })

    const req = new NextRequest('http://localhost/api/appointments/apt-1')
    const res = await GET(req, { params: { id: 'apt-1' } })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.appointment.id).toBe('apt-1')
  })

  it('returns 404 when appointment missing', async () => {
    p.appointment.findUnique.mockResolvedValue(null)

    const req = new NextRequest('http://localhost/api/appointments/x')
    const res = await GET(req, { params: { id: 'x' } })
    expect(res.status).toBe(404)
  })

  it('returns 403 for unrelated user', async () => {
    p.appointment.findUnique.mockResolvedValue({
      ...baseAppointment,
      clientId: 'other-client',
      barberId: 'other-barber',
    })
    p.user.findUnique.mockResolvedValue({ id: 'test-user-id', role: 'CLIENT' })

    const req = new NextRequest('http://localhost/api/appointments/apt-1')
    const res = await GET(req, { params: { id: 'apt-1' } })
    expect(res.status).toBe(403)
  })
})

describe('PUT /api/appointments/[id]', () => {
  it('updates appointment when no conflict', async () => {
    p.appointment.findUnique.mockResolvedValue({ ...baseAppointment })
    p.user.findUnique.mockResolvedValue({ id: 'test-user-id', role: 'CLIENT' })
    p.appointment.findFirst.mockResolvedValue(null)
    p.appointment.update.mockResolvedValue({ ...baseAppointment, status: 'CONFIRMED' })

    const req = new NextRequest('http://localhost/api/appointments/apt-1', {
      method: 'PUT',
      body: JSON.stringify({ status: 'CONFIRMED', startTime: '11:00', endTime: '11:30' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await PUT(req, { params: { id: 'apt-1' } })
    expect(res.status).toBe(200)
    expect(p.appointment.update).toHaveBeenCalled()
  })

  it('returns 409 when time slot conflicts', async () => {
    p.appointment.findUnique.mockResolvedValue({ ...baseAppointment })
    p.user.findUnique.mockResolvedValue({ id: 'test-user-id', role: 'CLIENT' })
    p.appointment.findFirst.mockResolvedValue({ id: 'other-apt' })

    const req = new NextRequest('http://localhost/api/appointments/apt-1', {
      method: 'PUT',
      body: JSON.stringify({ startTime: '11:00', endTime: '11:30' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await PUT(req, { params: { id: 'apt-1' } })
    expect(res.status).toBe(409)
  })
})

describe('DELETE /api/appointments/[id]', () => {
  it('soft-cancels appointment', async () => {
    p.appointment.findUnique.mockResolvedValue({ ...baseAppointment })
    p.user.findUnique.mockResolvedValue({ id: 'test-user-id', role: 'CLIENT' })
    p.appointment.update.mockResolvedValue({ ...baseAppointment, status: 'CANCELLED' })

    const req = new NextRequest('http://localhost/api/appointments/apt-1', { method: 'DELETE' })
    const res = await DELETE(req, { params: { id: 'apt-1' } })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.ok).toBe(true)
    expect(p.appointment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: 'CANCELLED' },
      })
    )
  })
})

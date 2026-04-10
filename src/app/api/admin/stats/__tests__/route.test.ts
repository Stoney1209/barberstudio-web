import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { GET } from '../route'

const p = prisma as unknown as {
  user: { findUnique: jest.Mock; count: jest.Mock }
  appointment: {
    count: jest.Mock
    groupBy: jest.Mock
    findMany: jest.Mock
  }
  service: { count: jest.Mock; findMany: jest.Mock }
  $queryRaw: jest.Mock
}

describe('GET /api/admin/stats', () => {
  it('returns 403 for non-admin', async () => {
    p.user.findUnique.mockResolvedValue({ id: 'test-user-id', role: 'BARBER' })

    const req = new NextRequest('http://localhost/api/admin/stats')
    const res = await GET(req)
    expect(res.status).toBe(403)
  })

  it('returns aggregated stats for ADMIN', async () => {
    p.user.findUnique.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' })

    p.appointment.count.mockResolvedValueOnce(100).mockResolvedValueOnce(5).mockResolvedValueOnce(20)
    p.appointment.groupBy.mockResolvedValueOnce([
      { status: 'CONFIRMED', _count: 10 },
      { status: 'COMPLETED', _count: 5 },
    ])
    p.user.count.mockResolvedValueOnce(30).mockResolvedValueOnce(3)
    p.service.count.mockResolvedValue(8)

    const recent = [
      {
        id: 'a1',
        date: new Date('2026-06-01'),
        startTime: '10:00',
        status: 'CONFIRMED',
        client: { name: 'C' },
        barber: { name: 'B' },
        service: { name: 'Fade', price: 25 },
      },
    ]
    p.appointment.findMany.mockResolvedValueOnce(recent)

    p.$queryRaw.mockResolvedValueOnce([{ sum: 30 }]).mockResolvedValueOnce([{ sum: 15 }])

    p.appointment.groupBy.mockResolvedValueOnce([{ serviceId: 's1', _count: 7 }])
    p.service.findMany.mockResolvedValue([{ id: 's1', name: 'Fade' }])

    const req = new NextRequest('http://localhost/api/admin/stats')
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.appointments.total).toBe(100)
    expect(body.users.clients).toBe(30)
    expect(body.revenue.total).toBe(30)
    expect(body.revenue.thisWeek).toBe(15)
    expect(body.topServices[0].serviceName).toBe('Fade')
    expect(body.recentAppointments[0].client).toBe('C')
  })
})

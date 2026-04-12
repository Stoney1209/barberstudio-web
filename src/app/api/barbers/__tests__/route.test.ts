import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GET, POST } from '../route'

const p = prisma as unknown as {
  user: { findUnique: jest.Mock; findMany: jest.Mock; create: jest.Mock }
}

describe('GET /api/barbers', () => {
  it('lists barbers', async () => {
    p.user.findMany.mockResolvedValue([{ id: 'b1', name: 'B', email: 'b@x.com', phone: null }])

    const req = new NextRequest('http://localhost/api/barbers')
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.barbers).toHaveLength(1)
    expect(body.pagination).toMatchObject({ hasMore: false })
    expect(p.user.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 0, take: 101 }))
  })

  it('includes availability when requested', async () => {
    p.user.findMany.mockResolvedValue([
      {
        id: 'b1',
        name: 'B',
        email: 'b@x.com',
        phone: null,
        availabilities: [{ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }],
      },
    ])

    const req = new NextRequest('http://localhost/api/barbers?includeAvailability=true')
    const res = await GET(req)

    expect(res.status).toBe(200)
    expect(p.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          availabilities: expect.anything(),
        }),
      })
    )
  })
})

describe('POST /api/barbers', () => {
  it('returns 403 for non-admin', async () => {
    (requireRole as jest.Mock).mockResolvedValueOnce(
      NextResponse.json({ error: 'Prohibido' }, { status: 403 })
    )

    const req = new NextRequest('http://localhost/api/barbers', {
      method: 'POST',
      body: JSON.stringify({ name: 'B', email: 'b@x.com' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await POST(req)
    expect(res.status).toBe(403)
  })

  it('creates barber as ADMIN', async () => {
    (requireRole as jest.Mock).mockResolvedValueOnce({ userId: 'admin', role: 'ADMIN' })
    p.user.create.mockResolvedValue({ id: 'new-b', name: 'New', email: 'new@x.com' })

    const req = new NextRequest('http://localhost/api/barbers', {
      method: 'POST',
      body: JSON.stringify({ name: 'New', email: 'new@x.com', phone: '+1' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.barber.email).toBe('new@x.com')
  })
})

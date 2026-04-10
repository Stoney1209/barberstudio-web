import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GET, POST } from '../route'

const p = prisma as unknown as {
  review: { findMany: jest.Mock; create: jest.Mock }
  appointment: { findUnique: jest.Mock }
}

describe('GET /api/reviews', () => {
  it('returns reviews', async () => {
    p.review.findMany.mockResolvedValue([
      {
        id: 'r1',
        rating: 5,
        client: { id: 'c1', name: 'C' },
        appointment: { service: { name: 'Fade' }, barber: { name: 'B' } },
      },
    ])

    const req = new NextRequest('http://localhost/api/reviews?barberId=b1')
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.reviews).toHaveLength(1)
    expect(p.review.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          appointment: expect.objectContaining({ barberId: 'b1' }),
        }),
        skip: 0,
        take: 101,
      })
    )
  })

  it('combines barberId and serviceId filters', async () => {
    p.review.findMany.mockResolvedValue([])

    const req = new NextRequest('http://localhost/api/reviews?barberId=b1&serviceId=s1')
    await GET(req)

    expect(p.review.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          appointment: { barberId: 'b1', serviceId: 's1' },
        },
      })
    )
  })
})

describe('POST /api/reviews', () => {
  it('returns 401 when unauthenticated', async () => {
    ;(auth as unknown as jest.Mock).mockResolvedValueOnce({ userId: null })

    const req = new NextRequest('http://localhost/api/reviews', {
      method: 'POST',
      body: JSON.stringify({ appointmentId: 'a1', rating: 5 }),
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 404 when appointment missing', async () => {
    p.appointment.findUnique.mockResolvedValue(null)

    const req = new NextRequest('http://localhost/api/reviews', {
      method: 'POST',
      body: JSON.stringify({ appointmentId: 'missing', rating: 5 }),
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await POST(req)
    expect(res.status).toBe(404)
  })

  it('returns 403 when caller is not the client', async () => {
    p.appointment.findUnique.mockResolvedValue({
      id: 'a1',
      clientId: 'other',
      status: 'COMPLETED',
      review: null,
    })

    const req = new NextRequest('http://localhost/api/reviews', {
      method: 'POST',
      body: JSON.stringify({ appointmentId: 'a1', rating: 5 }),
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await POST(req)
    expect(res.status).toBe(403)
  })

  it('returns 400 when appointment not completed', async () => {
    p.appointment.findUnique.mockResolvedValue({
      id: 'a1',
      clientId: 'test-user-id',
      status: 'PENDING',
      review: null,
    })

    const req = new NextRequest('http://localhost/api/reviews', {
      method: 'POST',
      body: JSON.stringify({ appointmentId: 'a1', rating: 5 }),
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 409 when review already exists', async () => {
    p.appointment.findUnique.mockResolvedValue({
      id: 'a1',
      clientId: 'test-user-id',
      status: 'COMPLETED',
      review: { id: 'r0' },
    })

    const req = new NextRequest('http://localhost/api/reviews', {
      method: 'POST',
      body: JSON.stringify({ appointmentId: 'a1', rating: 5 }),
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await POST(req)
    expect(res.status).toBe(409)
  })

  it('creates review for completed appointment', async () => {
    p.appointment.findUnique.mockResolvedValue({
      id: 'a1',
      clientId: 'test-user-id',
      status: 'COMPLETED',
      review: null,
    })
    const review = {
      id: 'r-new',
      appointmentId: 'a1',
      clientId: 'test-user-id',
      rating: 4,
      comment: 'Great',
      client: { id: 'test-user-id', name: 'Me' },
    }
    p.review.create.mockResolvedValue(review)

    const req = new NextRequest('http://localhost/api/reviews', {
      method: 'POST',
      body: JSON.stringify({ appointmentId: 'a1', rating: 4, comment: 'Great' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.review.rating).toBe(4)
  })
})

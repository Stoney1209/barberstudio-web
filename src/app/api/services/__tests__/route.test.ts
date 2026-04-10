import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { GET, POST } from '../route'

const p = prisma as unknown as {
  user: { findUnique: jest.Mock }
  service: { findMany: jest.Mock; create: jest.Mock }
}

describe('GET /api/services', () => {
  it('returns paginated services', async () => {
    const services = [
      { id: '1', name: 'Fade', description: null, price: 25, duration: 30, imageUrl: null, category: 'FADE' },
    ]
    p.service.findMany.mockResolvedValue(services)

    const req = new NextRequest('http://localhost/api/services?page=1&limit=200')
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.services).toEqual(services)
    expect(body.pagination).toEqual(expect.objectContaining({ page: 1, limit: 200, hasMore: false }))
    expect(p.service.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 201 })
    )
  })
})

describe('POST /api/services', () => {
  it('returns 403 for non-admin', async () => {
    p.user.findUnique.mockResolvedValue({ id: 'test-user-id', role: 'BARBER' })

    const req = new NextRequest('http://localhost/api/services', {
      method: 'POST',
      body: JSON.stringify({
        name: 'New',
        price: 10,
        duration: 20,
        category: 'FADE',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await POST(req)
    expect(res.status).toBe(403)
  })

  it('creates service for ADMIN', async () => {
    p.user.findUnique.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' })
    const created = {
      id: 'svc-new',
      name: 'Beard',
      description: 'trim',
      price: 15,
      duration: 20,
      imageUrl: null,
      category: 'BEARD',
    }
    p.service.create.mockResolvedValue(created)

    const req = new NextRequest('http://localhost/api/services', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Beard',
        description: 'trim',
        price: 15,
        duration: 20,
        category: 'BEARD',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.service.name).toBe('Beard')
  })

  it('returns 400 on invalid payload', async () => {
    p.user.findUnique.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' })

    const req = new NextRequest('http://localhost/api/services', {
      method: 'POST',
      body: JSON.stringify({ name: '', price: -1, duration: 0, category: 'FADE' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})

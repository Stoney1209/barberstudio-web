import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { GET, PUT, DELETE } from '../route'

const p = prisma as unknown as {
  user: { findUnique: jest.Mock }
  service: { findUnique: jest.Mock; update: jest.Mock; delete: jest.Mock }
}

describe('GET /api/services/[id]', () => {
  it('returns 404 when missing', async () => {
    p.service.findUnique.mockResolvedValue(null)
    const req = new NextRequest('http://localhost/api/services/x')
    const res = await GET(req, { params: { id: 'x' } })
    expect(res.status).toBe(404)
  })

  it('returns service', async () => {
    const svc = {
      id: 's1',
      name: 'Fade',
      description: null,
      price: 20,
      duration: 30,
      imageUrl: null,
      category: 'FADE',
    }
    p.service.findUnique.mockResolvedValue(svc)

    const req = new NextRequest('http://localhost/api/services/s1')
    const res = await GET(req, { params: { id: 's1' } })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.service).toEqual(svc)
  })
})

describe('PUT /api/services/[id]', () => {
  beforeEach(() => {
    p.user.findUnique.mockResolvedValue({ id: 'test-user-id', role: 'ADMIN' })
  })

  it('updates service', async () => {
    p.service.update.mockResolvedValue({
      id: 's1',
      name: 'Updated',
      price: 22,
      duration: 30,
      category: 'FADE',
    })

    const req = new NextRequest('http://localhost/api/services/s1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Updated', price: 22 }),
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await PUT(req, { params: { id: 's1' } })
    expect(res.status).toBe(200)
  })
})

describe('DELETE /api/services/[id]', () => {
  beforeEach(() => {
    p.user.findUnique.mockResolvedValue({ id: 'test-user-id', role: 'ADMIN' })
  })

  it('deletes service', async () => {
    p.service.delete.mockResolvedValue({})

    const req = new NextRequest('http://localhost/api/services/s1', { method: 'DELETE' })
    const res = await DELETE(req, { params: { id: 's1' } })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.ok).toBe(true)
  })
})

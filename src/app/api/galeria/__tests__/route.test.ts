import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { GET, POST } from '../route'

const p = prisma as unknown as {
  gallery: { findMany: jest.Mock; create: jest.Mock }
  user: { findUnique: jest.Mock }
}

describe('GET /api/galeria', () => {
  it('returns gallery items with filters', async () => {
    p.gallery.findMany.mockResolvedValue([
      { id: 'g1', imageUrl: 'https://res.cloudinary.com/x', category: 'FADE', barber: null },
    ])

    const req = new NextRequest('http://localhost/api/galeria?category=FADE&barberId=b1')
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.pagination).toMatchObject({ page: 1 })
    expect(p.gallery.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ category: 'FADE', barberId: 'b1' }),
        skip: 0,
        take: 61,
      })
    )
  })
})

describe('POST /api/galeria', () => {
  it('rejects non-Cloudinary URLs', async () => {
    p.user.findUnique.mockResolvedValue({ id: 'test-user-id', role: 'BARBER' })

    const req = new NextRequest('http://localhost/api/galeria', {
      method: 'POST',
      body: JSON.stringify({
        imageUrl: 'https://evil.com/img.png',
        category: 'FADE',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('creates gallery entry with Cloudinary URL', async () => {
    p.user.findUnique.mockResolvedValue({ id: 'test-user-id', role: 'BARBER' })
    const row = {
      id: 'g1',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/x',
      caption: 'Cut',
      category: 'FADE',
      barberId: 'b1',
    }
    p.gallery.create.mockResolvedValue(row)

    const req = new NextRequest('http://localhost/api/galeria', {
      method: 'POST',
      body: JSON.stringify({
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/x',
        caption: 'Cut',
        category: 'FADE',
        barberId: 'b1',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.gallery.imageUrl).toContain('cloudinary')
  })
})

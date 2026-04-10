import { NextRequest } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { GET } from '../route'

const p = prisma as unknown as {
  user: { findUnique: jest.Mock; create: jest.Mock }
}

describe('GET /api/auth/me', () => {
  it('returns 401 when unauthenticated', async () => {
    ;(auth as unknown as jest.Mock).mockResolvedValueOnce({ userId: null })

    const req = new NextRequest('http://localhost/api/auth/me')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('returns existing db user', async () => {
    const existing = {
      id: 'test-user-id',
      name: 'Existing',
      email: 'e@x.com',
      phone: null,
      role: 'CLIENT',
      createdAt: new Date('2026-01-01'),
    }
    p.user.findUnique.mockResolvedValue(existing)

    const req = new NextRequest('http://localhost/api/auth/me')
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.user.email).toBe('e@x.com')
    expect(p.user.create).not.toHaveBeenCalled()
  })

  it('creates CLIENT user from Clerk when missing in DB', async () => {
    p.user.findUnique.mockResolvedValue(null)
    const created = {
      id: 'test-user-id',
      name: 'Test User',
      email: 'clerk@example.com',
      phone: null,
      role: 'CLIENT',
      createdAt: new Date(),
    }
    p.user.create.mockResolvedValue(created)

    const req = new NextRequest('http://localhost/api/auth/me')
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.user.role).toBe('CLIENT')
    expect(p.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ id: 'test-user-id', role: 'CLIENT' }),
      })
    )
  })

  it('returns 400 when Clerk user has no email', async () => {
    p.user.findUnique.mockResolvedValue(null)
    const client = await clerkClient()
    ;(client.users.getUser as jest.Mock).mockResolvedValueOnce({
      firstName: 'X',
      lastName: 'Y',
      emailAddresses: [],
      phoneNumbers: [],
    })

    const req = new NextRequest('http://localhost/api/auth/me')
    const res = await GET(req)
    expect(res.status).toBe(400)
  })

  it('returns 500 when Clerk getUser fails', async () => {
    p.user.findUnique.mockResolvedValue(null)
    const client = await clerkClient()
    ;(client.users.getUser as jest.Mock).mockRejectedValueOnce(new Error('clerk down'))

    const req = new NextRequest('http://localhost/api/auth/me')
    const res = await GET(req)
    expect(res.status).toBe(500)
  })
})

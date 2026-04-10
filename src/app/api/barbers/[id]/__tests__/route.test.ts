import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PUT, DELETE } from '../route'

const p = prisma as unknown as {
  user: { findUnique: jest.Mock; update: jest.Mock; delete: jest.Mock }
}

describe('PUT /api/barbers/[id]', () => {
  it('updates barber as ADMIN', async () => {
    p.user.findUnique.mockResolvedValue({ id: 'admin', role: 'ADMIN' })
    p.user.update.mockResolvedValue({ id: 'b1', name: 'Updated', email: 'u@x.com', phone: null })

    const req = new NextRequest('http://localhost/api/barbers/b1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Updated' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await PUT(req, { params: { id: 'b1' } })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.barber.name).toBe('Updated')
  })
})

describe('DELETE /api/barbers/[id]', () => {
  it('returns 204 on success', async () => {
    p.user.findUnique.mockResolvedValue({ id: 'admin', role: 'ADMIN' })
    p.user.delete.mockResolvedValue({})

    const req = new NextRequest('http://localhost/api/barbers/b1', { method: 'DELETE' })
    const res = await DELETE(req, { params: { id: 'b1' } })

    expect(res.status).toBe(204)
  })
})

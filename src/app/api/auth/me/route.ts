import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { ensureDbUser } from '@/lib/auth'

export async function GET() {
  try {
    const dbUser = await ensureDbUser()
    if (!dbUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        phone: dbUser.phone,
        role: dbUser.role,
        createdAt: dbUser.createdAt,
      }
    })
  } catch (err) {
    console.error('auth/me GET:', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

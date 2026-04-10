import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { ensureUserFromClerk } from '@/lib/sync-clerk-user'

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const client = await clerkClient()
    const clerkUser = await client.users.getUser(userId)

    let dbUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!dbUser) {
      try {
        dbUser = await ensureUserFromClerk(userId, clerkUser, { applyAdminPromotion: false })
      } catch (e: unknown) {
        if (e instanceof Error && e.message === 'MISSING_EMAIL') {
          return NextResponse.json(
            { error: 'Tu cuenta de Clerk no tiene email; añade uno para continuar.' },
            { status: 400 }
          )
        }
        throw e
      }
    }

    return NextResponse.json({
      user: {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        phone: dbUser.phone,
        role: dbUser.role,
        createdAt: dbUser.createdAt,
      },
      clerk: {
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
      },
    })
  } catch (err) {
    console.error('auth/me GET:', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

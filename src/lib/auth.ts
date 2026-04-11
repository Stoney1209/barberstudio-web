import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export type UserRole = 'CLIENT' | 'BARBER' | 'ADMIN'

export interface AuthenticatedUser {
  userId: string
  role: UserRole
}

export async function auth() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { userId: null }
  
  let defaultRole: UserRole = 'CLIENT'
  const adminString = (process.env.ADMIN_EMAILS || '').toLowerCase()
  if (adminString.includes(user.email?.toLowerCase() || '')) {
    defaultRole = 'ADMIN'
  }

  const dbUser = await prisma.user.upsert({
    where: { email: user.email! },
    update: {
        role: defaultRole === 'ADMIN' ? 'ADMIN' : undefined
    },
    create: {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.full_name || user.email!.split('@')[0],
      role: defaultRole
    }
  })

  return { userId: dbUser.id }
}

export async function requireAuth(): Promise<{ userId: string } | NextResponse> {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  return { userId }
}

export async function requireRole(
  allowedRoles: UserRole[]
): Promise<AuthenticatedUser | NextResponse> {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({ where: { id: userId } })
  if (!dbUser) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 })
  }

  if (!allowedRoles.includes(dbUser.role as UserRole)) {
    return NextResponse.json({ error: 'Prohibido' }, { status: 403 })
  }

  return { userId, role: dbUser.role as UserRole }
}

export async function getSessionUser() {
  const { userId } = await auth()
  if (!userId) return null
  return prisma.user.findUnique({ where: { id: userId } })
}
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export type UserRole = 'CLIENT' | 'BARBER' | 'ADMIN'

export interface AuthenticatedUser {
  userId: string
  role: UserRole
}

/**
 * Lightweight auth check — returns the Supabase user ID if authenticated.
 * Does NOT upsert the user into the database.
 */
export async function getSupabaseUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * Ensures the authenticated user exists in our database.
 * Should be called sparingly (login redirect, /api/auth/me), not on every request.
 */
export async function ensureDbUser() {
  const user = await getSupabaseUser()
  if (!user || !user.email) return null

  let defaultRole: UserRole = 'CLIENT'
  const adminString = (process.env.ADMIN_EMAILS || '').toLowerCase()
  if (adminString.includes(user.email.toLowerCase())) {
    defaultRole = 'ADMIN'
  }

  const dbUser = await prisma.user.upsert({
    where: { email: user.email },
    update: {
        role: defaultRole === 'ADMIN' ? 'ADMIN' : undefined
    },
    create: {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.email.split('@')[0],
      role: defaultRole
    }
  })

  return dbUser
}

/**
 * Returns the authenticated user's DB id. Uses a simple findUnique instead of upsert.
 * The user record is expected to already exist (created at login via ensureDbUser).
 */
export async function auth() {
  const user = await getSupabaseUser()
  if (!user || !user.email) return { userId: null }
  
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
  })

  if (!dbUser) {
    // Fallback: user authenticated in Supabase but not in our DB yet.
    // This can happen on first access after signup. Create the record.
    const fallback = await ensureDbUser()
    return { userId: fallback?.id ?? null }
  }

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
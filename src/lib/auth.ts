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
  
  // Sync Supabase User with Prisma User automatically
  let defaultRole = 'CLIENT'
  if (process.env.ADMIN_EMAILS && process.env.ADMIN_EMAILS.includes(user.email!)) {
    defaultRole = 'ADMIN'
  }

  const dbUser = await prisma.user.upsert({
    where: { email: user.email! },
    update: {
        // Here we could update name or picture if wanted
    },
    create: {
      id: user.id, // Keep IDs perfectly in sync
      email: user.email!,
      name: user.user_metadata?.full_name || user.email!.split('@')[0],
      role: defaultRole as UserRole
    }
  })

  return { userId: dbUser.id }
}

/**
 * Verifica que haya una sesión activa.
 * Devuelve { userId } o una NextResponse 401.
 */
export async function requireAuth(): Promise<{ userId: string } | NextResponse> {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  return { userId }
}

/**
 * Verifica sesión activa Y que el rol del usuario en BD sea uno de los permitidos.
 * Devuelve { userId, role } o una NextResponse 401/403.
 */
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

/**
 * Obtiene el usuario de BD asociado a la sesión activa.
 * Devuelve el user o null si no hay sesión / no existe en BD.
 */
export async function getSessionUser() {
  const { userId } = await auth()
  if (!userId) return null
  return prisma.user.findUnique({ where: { id: userId } })
}

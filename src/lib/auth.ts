import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export type UserRole = 'CLIENT' | 'BARBER' | 'ADMIN'

export interface AuthenticatedUser {
  userId: string
  role: UserRole
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

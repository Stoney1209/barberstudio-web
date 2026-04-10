import type { UserRole } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { resolveInitialRoleFromClerk, type ClerkUserLike } from '@/lib/admin-roles'

export type SyncUserOptions = {
  /** When true, new users get ADMIN/CLIENT from Clerk metadata + ADMIN_EMAILS. When false, new users are always CLIENT. */
  applyAdminPromotion: boolean
}

function buildUserCreateData(userId: string, clerkUser: ClerkUserLike & { firstName?: string | null; lastName?: string | null; phoneNumbers?: { phoneNumber: string }[] }, applyAdminPromotion: boolean) {
  const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress
  if (!primaryEmail?.trim()) {
    throw new Error('MISSING_EMAIL')
  }

  const name =
    `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() ||
    primaryEmail.split('@')[0] ||
    'User'

  const role: UserRole = applyAdminPromotion ? resolveInitialRoleFromClerk(clerkUser) : 'CLIENT'

  return {
    id: userId,
    name,
    email: primaryEmail.trim(),
    phone: clerkUser.phoneNumbers?.[0]?.phoneNumber ?? null,
    role,
  }
}

/**
 * Single path to mirror Clerk users into Postgres (used by /api/auth/me and admin layout).
 */
export async function ensureUserFromClerk(
  userId: string,
  clerkUser: ClerkUserLike & { firstName?: string | null; lastName?: string | null; phoneNumbers?: { phoneNumber: string }[] },
  options: SyncUserOptions
) {
  const existing = await prisma.user.findUnique({ where: { id: userId } })
  if (existing) {
    return existing
  }

  const data = buildUserCreateData(userId, clerkUser, options.applyAdminPromotion)
  return prisma.user.create({ data })
}

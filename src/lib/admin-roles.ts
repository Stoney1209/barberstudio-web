export type ClerkUserLike = {
  emailAddresses: { emailAddress: string }[]
  publicMetadata?: Record<string, unknown>
}

/**
 * Admin access for dashboard: Clerk publicMetadata.role === "admin"
 * and/or email listed in ADMIN_EMAILS (comma-separated, case-insensitive).
 */
export function resolveInitialRoleFromClerk(clerkUser: ClerkUserLike): 'ADMIN' | 'CLIENT' {
  const meta = clerkUser.publicMetadata as Record<string, unknown> | undefined
  if (meta?.role === 'admin' || meta?.role === 'ADMIN') {
    return 'ADMIN'
  }

  const allowlist = process.env.ADMIN_EMAILS?.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean) ?? []
  if (allowlist.length === 0) {
    return 'CLIENT'
  }

  const emails = clerkUser.emailAddresses.map((e) => e.emailAddress.toLowerCase())
  const isAdmin = emails.some((email) => allowlist.includes(email))
  return isAdmin ? 'ADMIN' : 'CLIENT'
}

import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { clerkClient } from '@clerk/nextjs/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { ensureUserFromClerk } from '@/lib/sync-clerk-user'

/**
 * Sync Clerk users into Postgres (CLERK_WEBHOOK_SIGNING_SECRET required).
 * Configure in Clerk Dashboard → Webhooks → user.created (and optionally user.updated).
 */
export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req)

    if (evt.type === 'user.created') {
      const userId = evt.data.id
      try {
        const client = await clerkClient()
        const clerkUser = await client.users.getUser(userId)
        await ensureUserFromClerk(userId, clerkUser, { applyAdminPromotion: true })
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
          // Race: user already inserted by /api/auth/me or another webhook delivery
        } else {
          throw e
        }
      }
    }

    if (evt.type === 'user.updated') {
      const userId = evt.data.id
      const d = evt.data as {
        email_addresses?: { id: string; email_address: string }[]
        primary_email_address_id?: string | null
        first_name?: string | null
        last_name?: string | null
      }
      const primary = d.email_addresses?.find((e) => e.id === d.primary_email_address_id)
      const email = primary?.email_address ?? d.email_addresses?.[0]?.email_address
      const name =
        `${d.first_name ?? ''} ${d.last_name ?? ''}`.trim() || email?.split('@')[0] || undefined

      await prisma.user.updateMany({
        where: { id: userId },
        data: {
          ...(email ? { email } : {}),
          ...(name ? { name } : {}),
        },
      })
    }

    return NextResponse.json({ received: true })
  } catch (e) {
    console.error('clerk webhook:', e)
    return NextResponse.json({ error: 'Webhook inválido' }, { status: 400 })
  }
}

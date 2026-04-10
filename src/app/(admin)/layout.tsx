import React from 'react'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { ensureUserFromClerk } from '@/lib/sync-clerk-user'
import '@/styles/globals.css'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  let dbUser = await prisma.user.findUnique({ where: { id: userId } })

  if (!dbUser) {
    const client = await clerkClient()
    const clerkUser = await client.users.getUser(userId)
    try {
      dbUser = await ensureUserFromClerk(userId, clerkUser, { applyAdminPromotion: true })
    } catch (e: unknown) {
      if (e instanceof Error && e.message === 'MISSING_EMAIL') {
        redirect('/sign-in')
      }
      throw e
    }
  }

  if (dbUser.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-mesh bg-noise">
      <AdminSidebar />
      <main className="lg:ml-72 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}

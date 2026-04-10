import React from 'react'
import { getSessionUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import '@/styles/globals.css'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const dbUser = await getSessionUser()

  if (!dbUser) {
    redirect('/login')
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

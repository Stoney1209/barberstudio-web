import React from 'react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ClientAppointmentsContent } from './ClientAppointmentsContent'

export const dynamic = 'force-dynamic'

export default async function MisCitasPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  const appointments = await prisma.appointment.findMany({
    where: { clientId: userId },
    include: {
      barber: { select: { name: true } },
      service: { select: { name: true, price: true } },
    },
    orderBy: { date: 'desc' },
  })

  // Convert Decimal to Number for the client component
  const formattedAppointments = appointments.map(apt => ({
    ...apt,
    barber: {
      ...apt.barber,
      name: apt.barber.name ?? 'Barbero'
    },
    service: {
      ...apt.service,
      price: Number(apt.service.price)
    }
  }))

  return (
    <div className="min-h-screen bg-gradient-mesh bg-noise pt-20 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-16">
          <p className="text-gold/60 text-xs uppercase tracking-[0.4em] mb-4">Área del Cliente</p>
          <h1 className="text-5xl font-display text-white italic">Mis <span className="text-gold">Reservas</span></h1>
        </header>

        <ClientAppointmentsContent initialAppointments={formattedAppointments} />
      </div>
    </div>
  )
}

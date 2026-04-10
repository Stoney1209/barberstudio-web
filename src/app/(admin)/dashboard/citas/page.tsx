import React from 'react'
import { prisma } from '@/lib/prisma'
import { AdminCitasClient } from './AdminCitasClient'

export const dynamic = 'force-dynamic'

export default async function AdminCitasPage() {
  const appointments = await prisma.appointment.findMany({
    include: {
      client: { select: { id: true, name: true, email: true, phone: true } },
      barber: { select: { id: true, name: true } },
      service: { select: { id: true, name: true, price: true, duration: true } },
    },
    orderBy: { date: 'desc' },
  })

  // Format Decimal to Number for Client Component
  const formattedAppointments = appointments.map(apt => ({
    ...apt,
    service: apt.service ? {
      ...apt.service,
      price: Number(apt.service.price)
    } : null
  }))

  return <AdminCitasClient initialAppointments={formattedAppointments} />
}
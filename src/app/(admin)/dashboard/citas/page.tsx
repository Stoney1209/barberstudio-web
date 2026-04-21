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

  // Format data to match AppointmentRow type
  const formattedAppointments = appointments.map(apt => ({
    id: apt.id,
    date: apt.date,
    startTime: apt.startTime,
    endTime: apt.endTime,
    status: apt.status,
    client: {
      name: apt.client.name ?? undefined,
      email: apt.client.email ?? undefined,
    },
    barber: {
      name: apt.barber.name ?? undefined,
    },
    service: apt.service ? {
      name: apt.service.name,
      price: Number(apt.service.price),
    } : undefined,
  }))

  return <AdminCitasClient initialAppointments={formattedAppointments} />
}
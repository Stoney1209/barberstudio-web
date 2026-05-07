import React from 'react'
import ServicesClient from './ServicesClient'
import { prisma } from '@/lib/prisma'

export const revalidate = 60 // Revalidate every 60 seconds

export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    orderBy: { name: 'asc' }
  })

  // Convert Decimal to number for the client component
  const formattedServices = services.map(s => ({
    ...s,
    price: Number(s.price)
  }))

  return <ServicesClient initialServices={formattedServices} />
}

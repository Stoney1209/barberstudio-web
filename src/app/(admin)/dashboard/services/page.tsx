import React from 'react'
import { prisma } from '@/lib/prisma'
import AdminServicesClient from './AdminServicesClient'


async function getServices() {
  return prisma.service.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      duration: true,
      imageUrl: true,
      category: true,
    },
  })
}

export default async function AdminServicios() {
  const rawServices = await getServices()
  const services = rawServices.map(s => ({
    ...s,
    price: Number(s.price)
  }))

  return <AdminServicesClient initialServices={services} />
}

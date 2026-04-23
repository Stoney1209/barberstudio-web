import React from 'react'
import { prisma } from '@/lib/prisma'
import { LandingContent } from '@/components/landing/LandingContent'

export const revalidate = 3600 // revalidate every hour

export default async function Landing() {
  const services = await prisma.service.findMany({
    take: 6,
    orderBy: { price: 'desc' }
  })

  const reviews = await prisma.review.findMany({
    take: 4,
    include: { client: true }
  })

  const formattedServices = services.map(s => ({
    ...s,
    price: Number(s.price)
  }))

  return <LandingContent initialServices={formattedServices} initialReviews={reviews} />
}

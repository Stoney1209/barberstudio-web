import React from 'react'
import { prisma } from '@/lib/prisma'
import { LandingContent } from '@/components/landing/LandingContent'

export const dynamic = 'force-dynamic'

export default async function Landing() {
  const services = await prisma.service.findMany({
    take: 6,
    orderBy: { price: 'desc' }
  })

  const reviews = await prisma.review.findMany({
    take: 4,
    include: { client: true }
  })

  return <LandingContent initialServices={services} initialReviews={reviews} />
}

import { prisma } from '@/lib/prisma'
import AdminAvailabilityClient from './AdminAvailabilityClient'

export const dynamic = 'force-dynamic'

export default async function AvailabilityAdminPage() {
  const barbers = await prisma.user.findMany({
    where: { role: 'BARBER' },
    select: { id: true, name: true, email: true },
  })

  return <AdminAvailabilityClient initialBarbers={barbers} />
}

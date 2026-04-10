import { prisma } from '@/lib/prisma'
import AdminBarbersClient from './AdminBarbersClient'

export const dynamic = 'force-dynamic'

async function getBarbers() {
  const barbers = await prisma.user.findMany({
    where: { role: 'BARBER' },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return barbers
}

export default async function BarbersAdminPage() {
  const barbers = await getBarbers()

  return <AdminBarbersClient initialBarbers={barbers} />
}

import { PrismaClient, ServiceCategory, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const upsertUser = async (email: string, name: string, role: UserRole) => {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return existing
    return prisma.user.create({ data: { email, name, role } })
  }

  await upsertUser('admin@barberstudio.test', 'Admin', UserRole.ADMIN)
  const barberUser = await upsertUser('barber@barberstudio.test', 'Carlos Barber', UserRole.BARBER)
  await upsertUser('cliente@barberstudio.test', 'Cliente Demo', UserRole.CLIENT)

  const services = [
    {
      name: 'Corte Clasico',
      description: 'Corte limpio y estilizado',
      price: 22.0,
      duration: 45,
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1699999999/barber/classic-cut.jpg',
      category: ServiceCategory.CLASSIC,
    },
    {
      name: 'Desvanecido',
      description: 'Desvanecido progresivo con acabado suave',
      price: 30.0,
      duration: 60,
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1699999999/barber/fade-cut.jpg',
      category: ServiceCategory.FADE,
    },
    {
      name: 'Barba y Cabeza',
      description: 'Cuidado de barba y lavado de cabeza',
      price: 28.0,
      duration: 40,
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1699999999/barber/beard.jpg',
      category: ServiceCategory.BEARD,
    },
  ]

  for (const service of services) {
    await prisma.service.create({
      data: {
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        imageUrl: service.imageUrl,
        category: service.category,
      },
    })
  }

  if (barberUser?.id) {
    await prisma.availability.create({
      data: {
        barberId: barberUser.id,
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        isActive: true,
      },
    }).catch(() => {})
  }

  console.log('Seed completed')
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
  })

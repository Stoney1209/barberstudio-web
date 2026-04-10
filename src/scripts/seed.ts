import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create sample users (admin, barber, client)
  const upsertUser = async (email: string, name: string, role: string) => {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return existing
    return prisma.user.create({ data: { email, name, role: role as any } })
  }

  const admin = await upsertUser('admin@barberstudio.test', 'Admin', 'ADMIN')
  const barberUser = await upsertUser('barber@barberstudio.test', 'Carlos Barber', 'BARBER')
  const clientUser = await upsertUser('cliente@barberstudio.test', 'Cliente Demo', 'CLIENT')

// Create sample services with image URLs hosted on Cloudinary (placeholders)
   const services = [
     {
       name: 'Corte Clásico',
       description: 'Corte limpio y estilizado',
       price: 22.0,
       duration: 45,
       imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1699999999/barber/classic-cut.jpg',
       category: 'CLASSIC',
     },
     {
       name: 'Desvanecido',
       description: 'Desvanecido progresivo con acabado suave',
       price: 30.0,
       duration: 60,
       imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1699999999/barber/fade-cut.jpg',
       category: 'FADE',
     },
     {
       name: 'Barba y Cabeza',
       description: 'Cuidado de barba y lavado de cabeza',
       price: 28.0,
       duration: 40,
       imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1699999999/barber/beard.jpg',
       category: 'BEARD',
     },
   ]

   for (const s of services) {
     await prisma.service.create({ data: {
       name: s.name,
       description: s.description,
       price: s.price,
       duration: s.duration,
       imageUrl: s.imageUrl,
       category: s.category as any,
     }})
   }

  // Availability for barber
  if (barberUser?.id) {
    await prisma.availability.create({
      data: {
        barberId: barberUser.id,
        dayOfWeek: 1, // Monday
        startTime: '09:00',
        endTime: '17:00',
        isActive: true,
      }
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

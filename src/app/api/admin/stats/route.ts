import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { Prisma, AppointmentStatus } from '@prisma/client'

export async function GET(req: NextRequest) {
  const authResult = await requireRole(['ADMIN'])
  if (authResult instanceof NextResponse) return authResult

  try {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalAppointments,
      weeklyAppointments,
      monthlyAppointments,
      appointmentsByStatus,
      activeClients,
      activeBarbers,
      servicesCount,
      recentAppointments,
      totalRevenueRow,
      weeklyRevenueRow,
    ] = await Promise.all([
      prisma.appointment.count(),
      prisma.appointment.count({ where: { date: { gte: startOfWeek } } }),
      prisma.appointment.count({ where: { date: { gte: startOfMonth } } }),
      prisma.appointment.groupBy({ by: ['status'], _count: true }),
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.user.count({ where: { role: 'BARBER' } }),
      prisma.service.count(),
      prisma.appointment.findMany({
        take: 10,
        orderBy: { date: 'desc' },
        include: {
          client: { select: { name: true } },
          barber: { select: { name: true } },
          service: { select: { name: true, price: true } },
        },
      }),
      prisma.$queryRaw<[{ sum: Prisma.Decimal | null }]>`
        SELECT COALESCE(SUM(s.price), 0) AS sum
        FROM "Appointment" a
        INNER JOIN "Service" s ON s.id = a."serviceId"
        WHERE a.status <> ${AppointmentStatus.CANCELLED}
      `,
      prisma.$queryRaw<[{ sum: Prisma.Decimal | null }]>`
        SELECT COALESCE(SUM(s.price), 0) AS sum
        FROM "Appointment" a
        INNER JOIN "Service" s ON s.id = a."serviceId"
        WHERE a.status <> ${AppointmentStatus.CANCELLED}
          AND a.date >= ${startOfWeek}
      `,
    ])

    const totalRevenue = Number(totalRevenueRow[0]?.sum ?? 0)
    const weeklyRevenue = Number(weeklyRevenueRow[0]?.sum ?? 0)

    const serviceCounts = await prisma.appointment.groupBy({
      by: ['serviceId'],
      _count: true,
      orderBy: { _count: { serviceId: 'desc' } },
      take: 5,
    })

    const services = await prisma.service.findMany({
      where: { id: { in: serviceCounts.map((s) => s.serviceId) } },
    })
    const topServices = serviceCounts.map((s) => ({
      serviceId: s.serviceId,
      serviceName: services.find((srv) => srv.id === s.serviceId)?.name || 'Unknown',
      count: s._count,
    }))

    return NextResponse.json({
      appointments: {
        total: totalAppointments,
        thisWeek: weeklyAppointments,
        thisMonth: monthlyAppointments,
        byStatus: appointmentsByStatus.reduce(
          (acc, s) => {
            acc[s.status] = s._count
            return acc
          },
          {} as Record<string, number>
        ),
      },
      revenue: { total: totalRevenue, thisWeek: weeklyRevenue },
      users: { clients: activeClients, barbers: activeBarbers },
      services: servicesCount,
      topServices,
      recentAppointments: recentAppointments.map((apt) => ({
        id: apt.id,
        date: apt.date,
        startTime: apt.startTime,
        status: apt.status,
        client: apt.client?.name,
        barber: apt.barber?.name,
        service: apt.service?.name,
      })),
    })
  } catch (err) {
    console.error('admin/stats GET:', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

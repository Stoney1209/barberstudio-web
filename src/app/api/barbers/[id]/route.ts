import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { z } from 'zod'

const BarberUpdateInput = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
})

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await requireRole(['ADMIN'])
  if (authResult instanceof NextResponse) return authResult

  try {
    const barber = await prisma.user.findUnique({
      where: { id: params.id, role: 'BARBER' },
    })
    if (!barber) {
      return NextResponse.json({ error: 'Barbero no encontrado' }, { status: 404 })
    }

    const body = await req.json()
    const parsed = BarberUpdateInput.parse(body)

    const updatedBarber = await prisma.user.update({
      where: { id: params.id },
      data: {
        name: parsed.name,
        email: parsed.email,
        phone: parsed.phone,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    })

    return NextResponse.json({ barber: updatedBarber })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: err.flatten() }, { status: 400 })
    }
    console.error('barber PUT:', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await requireRole(['ADMIN'])
  if (authResult instanceof NextResponse) return authResult

  try {
    const barber = await prisma.user.findUnique({
      where: { id: params.id, role: 'BARBER' },
    })
    if (!barber) {
      return NextResponse.json({ error: 'Barbero no encontrado' }, { status: 404 })
    }

    await prisma.user.delete({
      where: { id: params.id },
    })
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    console.error('barber DELETE:', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

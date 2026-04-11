import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

const ServiceInput = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  duration: z.number().int().positive(),
  imageUrl: z.string().optional(),
  category: z.enum(['FADE', 'CLASSIC', 'GRADIENT', 'BEARD', 'SHAVE']),
})

const ServiceUpdate = ServiceInput.partial()

export async function GET(req: NextRequest, ctx: { params: { id: string } }) {
  const { id } = ctx.params
  try {
    const service = await prisma.service.findUnique({
      where: { id },
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
    if (!service) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
    }
    return NextResponse.json({ service })
  } catch (err) {
    console.error('services/[id] GET:', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, ctx: { params: { id: string } }) {
  const authResult = await requireRole(['ADMIN'])
  if (authResult instanceof NextResponse) return authResult

  const { id } = ctx.params
  try {
    const body = await req.json()
    const parsed = ServiceUpdate.parse(body)

    const service = await prisma.service.update({
      where: { id },
      data: parsed,
    })
    return NextResponse.json({ service })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos de entrada inválidos', details: err.flatten() }, { status: 400 })
    }
    console.error('services/[id] PUT:', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, ctx: { params: { id: string } }) {
  const authResult = await requireRole(['ADMIN'])
  if (authResult instanceof NextResponse) return authResult

  const { id } = ctx.params
  try {
    const service = await prisma.service.findUnique({ where: { id } })
    if (!service) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
    }

    await prisma.service.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('services/[id] DELETE:', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
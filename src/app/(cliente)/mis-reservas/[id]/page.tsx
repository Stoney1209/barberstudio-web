import React from 'react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Scissors, Calendar, Clock, MapPin, ArrowLeft } from 'lucide-react'
import { PrintButton } from './PrintButton'

export default async function TicketPage({ params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const appointment = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: {
      barber: { select: { name: true, email: true } },
      service: { select: { name: true, price: true, duration: true, description: true } },
      client: { select: { name: true } }
    }
  })

  if (!appointment || appointment.clientId !== userId) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-black pt-32 pb-24 px-6 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        
        <Link 
          href="/mis-reservas" 
          className="inline-flex items-center gap-2 text-gold/40 hover:text-gold transition-colors text-[10px] uppercase tracking-widest mb-12 group"
        >
          <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
          Volver a mis reservas
        </Link>

        {/* The Ticket Itself */}
        <div className="glass border border-gold/20 overflow-hidden relative shadow-3xl">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gold shadow-glow" />
           
           {/* Perforation visual effect */}
           <div className="absolute top-1/2 -left-4 w-8 h-8 rounded-full bg-black border border-gold/20 -translate-y-1/2" />
           <div className="absolute top-1/2 -right-4 w-8 h-8 rounded-full bg-black border border-gold/20 -translate-y-1/2" />
           <div className="absolute top-1/2 left-4 right-4 h-px border-t border-dashed border-gold/10 -translate-y-1/2" />

           <div className="p-12 pb-24 text-center">
              <p className="text-gold/40 text-[10px] uppercase tracking-[0.6em] mb-4">Confirmación Oficial</p>
              <h1 className="text-4xl md:text-6xl font-display text-white italic mb-12">Ticket de <span className="text-gold">Caballero</span></h1>
              
              <div className="bg-surface-elevated/40 p-8 border border-gold/5 flex flex-col md:flex-row items-center justify-between gap-12">
                 <div className="text-left space-y-1">
                    <p className="text-[10px] text-muted/40 uppercase tracking-widest">Master Barbero</p>
                    <p className="text-2xl font-display text-white tracking-wide">{appointment.barber.name}</p>
                 </div>
                 <div className="text-right space-y-1">
                    <p className="text-[10px] text-muted/40 uppercase tracking-widest">Servicio Seleccionado</p>
                    <p className="text-2xl font-display text-gold italic">{appointment.service.name}</p>
                 </div>
              </div>
           </div>

           <div className="p-12 pt-24 grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                 <div className="flex items-start gap-4">
                    <Calendar className="text-gold mt-1" size={18} />
                    <div>
                       <p className="text-[9px] text-muted/40 uppercase tracking-[0.3em] mb-1">Fecha de la Cita</p>
                       <p className="text-white font-medium uppercase tracking-widest">{appointment.date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4">
                    <Clock className="text-gold mt-1" size={18} />
                    <div>
                       <p className="text-[9px] text-muted/40 uppercase tracking-[0.3em] mb-1">Horario Reservado</p>
                       <p className="text-white font-medium tracking-widest">{appointment.startTime} — {appointment.endTime}</p>
                    </div>
                 </div>
              </div>

              <div className="space-y-8">
                 <div className="flex items-start gap-4">
                    <MapPin className="text-gold mt-1" size={18} />
                    <div>
                       <p className="text-[9px] text-muted/40 uppercase tracking-[0.3em] mb-1">Ubicación del Estudio</p>
                       <p className="text-white font-medium tracking-widest underline decoration-gold/20">Av. Principal 123, Centro</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4">
                    <Scissors className="text-gold mt-1" size={18} />
                    <div>
                       <p className="text-[9px] text-muted/40 uppercase tracking-[0.3em] mb-1">Inversión de Estilo</p>
                       <p className="text-2xl font-display text-white">${Number(appointment.service.price)}</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* QR Code Placeholder (Mock) */}
           <div className="p-12 border-t border-gold/5 bg-surface-elevated/20 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1 text-center md:text-left">
                 <p className="text-[9px] text-gold/60 uppercase tracking-widest font-black mb-1">Código de Referencia</p>
                 <p className="text-xs text-muted/60 font-mono tracking-tighter uppercase">{appointment.id}</p>
              </div>
              <div className="w-24 h-24 bg-white/5 border border-white/10 flex items-center justify-center p-2">
                 {/* QR Mock */}
                 <div className="w-full h-full bg-gradient-to-br from-gold/40 to-black p-1">
                    <div className="w-full h-full bg-black flex items-center justify-center text-[10px] text-gold/40 font-mono text-center">
                       STU-QR
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="mt-12 flex justify-center gap-6">
           <PrintButton />
        </div>

      </div>
    </div>
  )
}

"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'
import Stepper from '@/components/booking/Stepper'
import { useToast } from '@/components/ui/ToastContext'

type ServiceOption = { id: string; name: string; duration: number; price: number; category: string }
type BarberOption = { id: string; name: string }

const ReservarPage: React.FC = () => {
  const [services, setServices] = useState<ServiceOption[]>([])
  const [barbers, setBarbers] = useState<BarberOption[]>([])
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const r1 = await fetch('/api/services')
        const j1 = await r1.json()
        const s = j1.services ?? j1
        if (Array.isArray(s)) {
          setServices(s as ServiceOption[])
        }
        const r2 = await fetch('/api/barbers')
        const j2 = await r2.json()
        const b = j2.barbers ?? j2
        if (Array.isArray(b)) {
          setBarbers(b as BarberOption[])
        }
      } catch {
        // Silently ignore fetch errors, loading state will handle it
      }
      finally { setLoading(false) }
    }
    load()
  }, [])

  // No local state handles redirect now, logic inside handleComplete

  const handleComplete = async (data: any) => {
    setIsSubmitting(true)
    
    const payload = {
      barberId: data.barberId,
      serviceId: data.serviceId,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
    }
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        showToast('Error al procesar la reserva', 'error')
        return
      }
      showToast('¡Cita agendada con éxito!', 'success')
      setTimeout(() => {
         window.location.href = '/mis-reservas'
      }, 2000)
    } catch {
      showToast('Error de conexión', 'error')
    }
    finally { setIsSubmitting(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-mesh bg-noise pt-20 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-gold/60 text-sm uppercase tracking-widest mb-3">Reservación</p>
          <h1 className="text-4xl md:text-5xl font-display font-light text-white mb-4">
            Agenda tu <span className="text-gold">Cita</span>
          </h1>
          <p className="text-muted/70">
            Selecciona el servicio, barbero y horario de tu preferencia
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
          </div>
        ) : (
          <Stepper onComplete={handleComplete} services={services} barbers={barbers} isSubmitting={isSubmitting} />
        )}

        {/* Feedback handled by Global Toasts */}
      </div>
    </div>
  )
}

export default ReservarPage
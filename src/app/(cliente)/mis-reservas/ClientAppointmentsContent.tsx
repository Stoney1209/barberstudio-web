'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, Scissors, CreditCard, ChevronRight, XCircle, Loader2, AlertTriangle, X } from 'lucide-react'
import { useToast } from '@/components/ui/ToastContext'
import { formatStoredDate } from '@/lib/booking-utils'

type Appointment = {
  id: string
  date: Date
  startTime: string
  endTime: string
  status: string
  barber: { name: string }
  service: { name: string, price: number }
}

type CancellationModalProps = {
  appointment: Appointment
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isCancelling: boolean
}

const CancellationModal: React.FC<CancellationModalProps> = ({ appointment, isOpen, onClose, onConfirm, isCancelling }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
        />
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ pointerEvents: 'none' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={{ pointerEvents: 'auto' }}
            className="w-full max-w-md bg-[#1a1a1a] border border-gold/20 rounded-xl overflow-hidden shadow-2xl"
          >
            <div className="relative p-8 pb-6">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-muted/40 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="text-red-500" size={32} />
              </div>
              
              <h3 className="text-2xl font-display text-white italic text-center mb-2">
                Cancelar Cita
              </h3>
              <p className="text-sm text-muted/60 text-center mb-6">
                ¿Estás seguro de que deseas cancelar esta reservación?
              </p>
              
              <div className="glass p-4 rounded-lg mb-6 border border-gold/10">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-gold/10">
                  <span className="text-xs text-gold/60 uppercase tracking-widest">Servicio</span>
                  <span className="text-white font-medium">{appointment.service.name}</span>
                </div>
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-gold/10">
                  <span className="text-xs text-gold/60 uppercase tracking-widest">Fecha</span>
                  <span className="text-white">
                    {formatStoredDate(appointment.date, 'es-ES', {
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long',
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-gold/10">
                  <span className="text-xs text-gold/60 uppercase tracking-widest">Hora</span>
                  <span className="text-white">{appointment.startTime} — {appointment.endTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gold/60 uppercase tracking-widest">Barbero</span>
                  <span className="text-white">{appointment.barber.name}</span>
                </div>
              </div>
              
              <p className="text-xs text-muted/40 text-center mb-6">
                Esta acción no se puede deshacer
              </p>
            </div>
            
            <div className="flex gap-3 p-4 pt-0">
              <button
                onClick={onClose}
                disabled={isCancelling}
                className="flex-1 px-6 py-3 border border-gold/20 text-gold text-xs uppercase tracking-widest font-bold rounded-lg hover:bg-gold/5 transition-all disabled:opacity-50"
              >
                Mantener Cita
              </button>
              <button
                onClick={onConfirm}
                disabled={isCancelling}
                className="flex-1 px-6 py-3 bg-red-500/20 border border-red-500/30 text-red-400 text-xs uppercase tracking-widest font-bold rounded-lg hover:bg-red-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCancelling ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Cancelando...
                  </>
                ) : (
                  <>
                    <XCircle size={14} />
                    Cancelar
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </>
    )}
  </AnimatePresence>
)

export const ClientAppointmentsContent: React.FC<{ initialAppointments: any[] }> = ({ initialAppointments }) => {
  const { showToast } = useToast()
  const [appointments, setAppointments] = useState(initialAppointments)
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [showModal, setShowModal] = useState<string | null>(null)

  const handleCancel = async (id: string) => {
    setShowModal(id)
  }

  const handleConfirmCancel = async () => {
    const id = showModal
    if (!id) return
    
    setCancelling(id)
    setShowModal(null)

    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' })
      })

      if (res.ok) {
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'CANCELLED' } : a))
        showToast('Cita cancelada correctamente', 'info')
      } else {
        showToast('No se pudo cancelar la cita', 'error')
      }
    } catch {
      showToast('Error de comunicación', 'error')
    } finally {
      setCancelling(null)
    }
  }

  const selectedAppointment = appointments.find(a => a.id === showModal)

  return (
    <div className="space-y-6">
      {selectedAppointment && (
        <CancellationModal
          appointment={selectedAppointment}
          isOpen={!!showModal}
          onClose={() => setShowModal(null)}
          onConfirm={handleConfirmCancel}
          isCancelling={cancelling === showModal}
        />
      )}
      <AnimatePresence>
        {appointments.length > 0 ? (
          appointments.map((apt, idx) => (
            <motion.div
              key={apt.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`glass p-8 border border-gold/10 hover:border-gold/30 transition-all group relative overflow-hidden ${apt.status === 'CANCELLED' ? 'opacity-50 grayscale' : ''}`}
            >
              <div className="flex flex-col md:flex-row justify-between gap-8 items-start md:items-center relative z-10">
                
                {/* Time & Date */}
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center justify-center p-4 bg-gold/5 border border-gold/10 rounded-sm min-w-[80px]">
                    <span className="text-[10px] uppercase text-gold/60 font-black tracking-widest">{formatStoredDate(apt.date, 'es-ES', { month: 'short' })}</span>
                    <span className="text-3xl font-display text-white">{formatStoredDate(apt.date, 'en-US', { day: 'numeric' })}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-gold mb-1">
                       <Clock size={12} />
                       <span className="text-xs font-bold tracking-widest uppercase">{apt.startTime} — {apt.endTime}</span>
                    </div>
                    <div className={`text-[10px] px-2 py-0.5 rounded-full inline-block uppercase font-black tracking-tighter ${
                      apt.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                      apt.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500' :
                      'bg-gold/20 text-gold'
                    }`}>
                       {apt.status === 'PENDING' ? 'Pendiente' : 
                        apt.status === 'CONFIRMED' ? 'Confirmada' : 
                        apt.status === 'CANCELLED' ? 'Cancelada' : 'Completada'}
                    </div>
                  </div>
                </div>

                {/* Service & Barber */}
                <div className="flex-1">
                   <h3 className="text-2xl font-display text-white italic group-hover:text-gold transition-colors">{apt.service.name}</h3>
                   <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5 text-xs text-muted/60">
                         <Scissors size={10} className="text-gold/40" />
                         <span>Master: {apt.barber.name}</span>
                      </div>
                      <div className="w-1 h-1 rounded-full bg-gold/20" />
                      <div className="flex items-center gap-1.5 text-xs text-muted/60">
                         <CreditCard size={10} className="text-gold/40" />
                         <span>${apt.service.price}</span>
                      </div>
                   </div>
                </div>

                {/* Actions */}
                 <div className="flex items-center gap-4 w-full md:w-auto pt-6 md:pt-0 border-t md:border-t-0 border-gold/5">
                   {apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && (
                     <motion.button 
                       whileHover={{ scale: 1.05, color: '#f87171' }}
                       whileTap={{ scale: 0.95 }}
                       onClick={() => handleCancel(apt.id)}
                       disabled={cancelling === apt.id}
                       className="flex items-center gap-2 text-[10px] text-muted/40 hover:text-red-400 uppercase tracking-widest font-black transition-all disabled:opacity-50"
                     >
                        {cancelling === apt.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                        {cancelling === apt.id ? 'Cancelando...' : 'Cancelar'}
                     </motion.button>
                   )}
                   <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                     <Link 
                       href={`/mis-reservas/${apt.id}`}
                       className="flex-1 md:flex-none text-center px-6 py-3 border border-gold/20 text-gold text-[10px] uppercase tracking-widest font-bold hover:bg-gold/5 transition-all block"
                     >
                        Detalles
                     </Link>
                   </motion.div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-32 text-center glass border-dashed border-gold/10"
          >
            <Calendar className="mx-auto mb-6 text-gold/20" size={64} />
            <h3 className="text-2xl font-display text-white mb-2 italic">Aún no has reclamado tu lugar</h3>
            <p className="text-sm text-muted/40 mb-8 max-w-xs mx-auto">No tienes reservaciones activas. Tu próximo gran cambio comienza con un solo clic.</p>
            <Link href="/reservar" className="btn-gold px-12 py-5 rounded-sm inline-block uppercase text-xs tracking-widest">
               Agendar mi primera experiencia
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

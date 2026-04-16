'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, CheckCircle2, XCircle, Search } from 'lucide-react'
import { useToast } from '@/components/ui/ToastContext'
import Link from 'next/link'
import { formatStoredDate } from '@/lib/booking-utils'

type AppointmentRow = {
  id: string
  date: string | Date
  startTime: string
  endTime: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  client?: { name?: string; email?: string }
  barber?: { name?: string }
  service?: { name?: string; price?: number }
}

export const AdminCitasClient = ({ initialAppointments }: { initialAppointments: AppointmentRow[] }) => {
  const [appointments, setAppointments] = useState(initialAppointments)
  const [filter, setFilter] = useState('')
  const { showToast } = useToast()

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (res.ok) {
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
        showToast(`Cita marcada como ${status}`, 'success')
      } else {
        showToast('Error al actualizar estado', 'error')
      }
    } catch {
      showToast('Error de red', 'error')
    }
  }

  const filtered = appointments.filter(a => 
    a.client?.name?.toLowerCase().includes(filter.toLowerCase()) ||
    a.barber?.name?.toLowerCase().includes(filter.toLowerCase()) ||
    a.service?.name?.toLowerCase().includes(filter.toLowerCase())
  )

  const stats = {
    pending: appointments.filter(a => a.status === 'PENDING').length,
    confirmed: appointments.filter(a => a.status === 'CONFIRMED').length,
    completed: appointments.filter(a => a.status === 'COMPLETED').length,
  }

  return (
    <div className="min-h-screen bg-gradient-mesh bg-noise pt-12 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
             <p className="text-gold/40 text-[10px] uppercase tracking-[0.4em] mb-4">Gestión de Reservas</p>
             <h1 className="text-4xl md:text-6xl font-display text-white italic">Libro de <span className="text-gold">Citas</span></h1>
          </motion.div>

          <div className="flex flex-col-reverse md:flex-row md:items-center gap-4 w-full md:w-auto">
             <div className="relative group w-full md:w-auto">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/40 group-focus-within:text-gold transition-colors" />
                <input 
                  type="text" 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Buscar por cliente, barbero..."
                  className="w-full md:min-w-[300px] bg-black/40 border border-gold/10 pl-12 pr-6 py-4 rounded-sm text-xs text-white outline-none focus:border-gold/30 transition-all"
                />
             </div>
             <Link href="/dashboard" className="text-[10px] text-muted/40 uppercase tracking-widest hover:text-gold transition-colors self-start md:self-auto md:ml-4 whitespace-nowrap">
                Dashboard / <span className="text-gold/70">Citas</span>
             </Link>
          </div>
        </header>

        {/* Stats Strip */}
        <div className="flex flex-wrap gap-8 mb-12">
           <div className="flex items-center gap-4">
              <div className="w-1 h-8 bg-gold/20" />
              <div>
                 <p className="text-[9px] text-muted/40 uppercase tracking-widest">Pendientes</p>
                 <p className="text-2xl font-display text-white">{stats.pending}</p>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <div className="w-1 h-8 bg-green-500/20" />
              <div>
                 <p className="text-[9px] text-muted/40 uppercase tracking-widest">Confirmadas</p>
                 <p className="text-2xl font-display text-white">{stats.confirmed}</p>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <div className="w-1 h-8 bg-blue-500/20" />
              <div>
                 <p className="text-[9px] text-muted/40 uppercase tracking-widest">Completadas</p>
                 <p className="text-2xl font-display text-white">{stats.completed}</p>
              </div>
           </div>
        </div>

        {/* Table/List */}
        <div className="glass border border-gold/5 overflow-hidden">
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-white/[0.02] border-b border-gold/5">
                       <th className="p-6 text-[10px] uppercase tracking-[0.2em] text-gold/60 font-black">Cliente & Registro</th>
                       <th className="p-6 text-[10px] uppercase tracking-[0.2em] text-gold/60 font-black">Maestro Barbero</th>
                       <th className="p-6 text-[10px] uppercase tracking-[0.2em] text-gold/60 font-black">Día & Horario</th>
                       <th className="p-6 text-[10px] uppercase tracking-[0.2em] text-gold/60 font-black">Servicio</th>
                       <th className="p-6 text-[10px] uppercase tracking-[0.2em] text-gold/60 font-black text-right">Estado / Acciones</th>
                    </tr>
                 </thead>
                 <tbody>
                    <AnimatePresence>
                       {filtered.map((apt, idx) => (
                          <motion.tr 
                            key={apt.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.02 }}
                            className="border-b border-gold/5 hover:bg-white/[0.02] transition-colors group"
                          >
                             <td className="p-6">
                                <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 rounded-sm bg-surface-elevated flex items-center justify-center border border-gold/10 text-gold/40 font-display">
                                      {apt.client?.name?.charAt(0) || 'U'}
                                   </div>
                                   <div>
                                      <p className="text-sm text-white font-medium">{apt.client?.name || 'Cliente Externo'}</p>
                                      <p className="text-[10px] text-muted/40 tracking-tighter">{apt.client?.email}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="p-6">
                                <div className="flex items-center gap-2 text-sm text-muted/80">
                                   <User size={12} className="text-gold/40" />
                                   {apt.barber?.name}
                                </div>
                             </td>
                             <td className="p-6">
                                <div>
                                   <p className="text-xs text-white uppercase tracking-widest">{formatStoredDate(apt.date, 'es-ES', { month: 'long', day: 'numeric' })}</p>
                                   <p className="text-[10px] text-gold/60 font-bold">{apt.startTime} — {apt.endTime}</p>
                                </div>
                             </td>
                             <td className="p-6">
                                <div>
                                   <p className="text-sm text-white italic font-display">{apt.service?.name}</p>
                                   <p className="text-[10px] text-muted/40 tracking-widest">${apt.service?.price}</p>
                                </div>
                             </td>
                             <td className="p-6 text-right">
                                <div className="flex items-center justify-end gap-4 opacity-40 group-hover:opacity-100 transition-opacity">
                                   {apt.status === 'PENDING' && (
                                     <motion.button 
                                       whileHover={{ scale: 1.1, color: '#4ade80' }}
                                       onClick={() => handleUpdateStatus(apt.id, 'CONFIRMED')}
                                       className="text-muted hover:text-green-400 p-2"
                                     >
                                        <CheckCircle2 size={16} />
                                     </motion.button>
                                   )}
                                   {apt.status === 'CONFIRMED' && (
                                     <motion.button 
                                       whileHover={{ scale: 1.1, color: '#60a5fa' }}
                                       onClick={() => handleUpdateStatus(apt.id, 'COMPLETED')}
                                       className="text-muted hover:text-blue-400 p-2"
                                     >
                                        <CheckCircle2 size={16} />
                                     </motion.button>
                                   )}
                                   {apt.status !== 'CANCELLED' && (
                                     <motion.button 
                                       whileHover={{ scale: 1.1, color: '#f87171' }}
                                       onClick={() => handleUpdateStatus(apt.id, 'CANCELLED')}
                                       className="text-muted hover:text-red-400 p-2"
                                     >
                                        <XCircle size={16} />
                                     </motion.button>
                                   )}
                                   <div className={`text-[9px] px-3 py-1 rounded-full border border-gold/10 uppercase tracking-widest font-black ${
                                      apt.status === 'COMPLETED' ? 'bg-blue-500/10 text-blue-400' :
                                      apt.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500' :
                                      apt.status === 'CONFIRMED' ? 'bg-green-500/10 text-green-400' :
                                      'bg-gold/10 text-gold'
                                   }`}>
                                      {apt.status}
                                   </div>
                                </div>
                             </td>
                          </motion.tr>
                       ))}
                    </AnimatePresence>
                 </tbody>
              </table>
           </div>
        </div>

      </div>
    </div>
  )
}

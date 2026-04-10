'use client'

import React, { useState, useEffect } from 'react'
import { Clock, Save, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type Availability = {
  id?: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
}

const DAYS = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
]

export const BarberAvailabilityModal = ({ 
  barberId, 
  barberName, 
  onClose 
}: { 
  barberId: string, 
  barberName: string, 
  onClose: () => void 
}) => {
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<number | null>(null)

  useEffect(() => {
    async function fetchAvailabilities() {
      setLoading(true)
      try {
        const res = await fetch(`/api/availability?barberId=${barberId}`)
        const data = await res.json()
        const fullWeek = DAYS.map((_, i) => {
          const existing = data.availabilities?.find((a: any) => a.dayOfWeek === i)
          return existing || { dayOfWeek: i, startTime: '09:00', endTime: '18:00', isActive: false }
        })
        setAvailabilities(fullWeek)
      } finally {
        setLoading(false)
      }
    }
    fetchAvailabilities()
  }, [barberId])

  const handleUpdate = async (index: number) => {
    setSaving(index)
    const item = availabilities[index]
    try {
      await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barberId, ...item })
      })
    } finally {
      setSaving(null)
    }
  }

  const handleChange = (index: number, field: keyof Availability, value: any) => {
    setAvailabilities(prev => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/95 backdrop-blur-xl"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 50 }}
        className="glass border border-gold/10 w-full max-w-4xl p-1h-full max-h-[90vh] overflow-hidden flex flex-col relative z-10"
      >
        <div className="p-8 border-b border-gold/5 flex items-center justify-between">
            <div>
               <p className="text-gold/40 text-[10px] uppercase tracking-[0.4em] mb-1">Disponibilidad Semanal</p>
               <h2 className="text-3xl font-display text-white italic">{barberName}</h2>
            </div>
            <button onClick={onClose} className="text-muted hover:text-gold transition-colors p-2">
               <X size={24} />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {loading ? (
             <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-gold/10 border-t-gold rounded-full animate-spin shadow-glow" />
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {availabilities.map((item, idx) => (
                 <div 
                   key={idx}
                   className={`glass p-6 border transition-all duration-500 ${item.isActive ? 'border-gold/20' : 'border-gold/5 opacity-40'}`}
                 >
                    <div className="flex items-center justify-between mb-6">
                       <h3 className="text-xl font-display text-white">{DAYS[idx]}</h3>
                       <input 
                         type="checkbox" 
                         checked={item.isActive}
                         onChange={(e) => handleChange(idx, 'isActive', e.target.checked)}
                         className="accent-gold h-4 w-4"
                       />
                    </div>
                    
                    <div className="flex gap-4 mb-6">
                       <div className="flex-1 space-y-1">
                          <label className="text-[9px] text-muted/40 uppercase tracking-widest">Entrada</label>
                          <input 
                            type="time" 
                            value={item.startTime}
                            onChange={(e) => handleChange(idx, 'startTime', e.target.value)}
                            disabled={!item.isActive}
                            className="w-full bg-black/40 border border-gold/5 p-2 text-sm text-gold outline-none focus:border-gold/30 disabled:opacity-20"
                          />
                       </div>
                       <div className="flex-1 space-y-1">
                          <label className="text-[9px] text-muted/40 uppercase tracking-widest">Salida</label>
                          <input 
                            type="time" 
                            value={item.endTime}
                            onChange={(e) => handleChange(idx, 'endTime', e.target.value)}
                            disabled={!item.isActive}
                            className="w-full bg-black/40 border border-gold/5 p-2 text-sm text-white outline-none focus:border-gold/30 disabled:opacity-20"
                          />
                       </div>
                    </div>

                    <button 
                       onClick={() => handleUpdate(idx)}
                       disabled={saving === idx || !item.isActive}
                       className="w-full py-2 border border-gold/10 text-[9px] uppercase tracking-widest text-gold hover:bg-gold hover:text-primary transition-all font-black disabled:opacity-0"
                    >
                       {saving === idx ? '...' : 'Sincronizar Día'}
                    </button>
                 </div>
               ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

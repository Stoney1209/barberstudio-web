'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Calendar, CheckCircle, Save, User } from 'lucide-react'

type Barber = {
  id: string
  name: string | null
  email: string
}

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

export default function AdminAvailabilityClient({ initialBarbers }: { initialBarbers: Barber[] }) {
  const [selectedBarberId, setSelectedBarberId] = useState<string>(initialBarbers[0]?.id || '')
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState<number | null>(null)

  useEffect(() => {
    if (selectedBarberId) {
      fetchAvailabilities()
    }
  }, [selectedBarberId])

  const fetchAvailabilities = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/availability?barberId=${selectedBarberId}`)
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

  const handleUpdate = async (index: number) => {
    setSaving(index)
    const item = availabilities[index]
    try {
      await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barberId: selectedBarberId, ...item })
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
    <div className="min-h-screen bg-gradient-mesh bg-noise pt-12 pb-24 px-6">
      <div className="max-w-5xl mx-auto">
        
        <header className="mb-16 flex items-end justify-between border-b border-gold/5 pb-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <p className="text-gold/60 text-xs uppercase tracking-[0.4em] mb-4">Cronograma Maestro</p>
            <h1 className="text-6xl font-display text-white italic">Disponibilidad</h1>
          </motion.div>

          <div className="relative group min-w-[240px]">
             <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/40" />
             <select 
               value={selectedBarberId}
               onChange={(e) => setSelectedBarberId(e.target.value)}
               className="w-full bg-surface-2/40 border border-gold/10 p-4 pl-12 text-xs tracking-widest text-white outline-none focus:border-gold/50 appearance-none transition-all font-bold"
             >
               {initialBarbers.map(b => (
                 <option key={b.id} value={b.id}>{b.name || b.email}</option>
               ))}
             </select>
          </div>
        </header>

        {loading ? (
          <div className="p-32 text-center">
            <div className="w-12 h-12 border-2 border-gold/10 border-t-gold rounded-full animate-spin mx-auto shadow-glow" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {availabilities.map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`glass p-8 border hover:border-gold/30 transition-all duration-500 relative overflow-hidden group ${item.isActive ? 'border-gold/20' : 'border-gold/5 opacity-40'}`}
                >
                  <div className="absolute top-0 right-0 p-4 rotate-12 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                     <Clock size={80} className="text-gold" />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-2xl font-display text-white">{DAYS[idx]}</h3>
                      <input 
                        type="checkbox" 
                        checked={item.isActive}
                        onChange={(e) => handleChange(idx, 'isActive', e.target.checked)}
                        className="accent-gold h-5 w-5 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-6 mb-10">
                       <div className="flex flex-col gap-2">
                          <label className="text-[10px] text-muted/40 uppercase tracking-widest">Inicio de Jornada</label>
                          <input 
                            type="time" 
                            value={item.startTime}
                            onChange={(e) => handleChange(idx, 'startTime', e.target.value)}
                            disabled={!item.isActive}
                            className="bg-black/40 border border-gold/5 p-4 text-xl font-display text-gold rounded-sm outline-none focus:border-gold/20 transition-all disabled:opacity-20"
                          />
                       </div>
                       <div className="flex flex-col gap-2">
                          <label className="text-[10px] text-muted/40 uppercase tracking-widest">Fin de Jornada</label>
                          <input 
                            type="time" 
                            value={item.endTime}
                            onChange={(e) => handleChange(idx, 'endTime', e.target.value)}
                            disabled={!item.isActive}
                            className="bg-black/40 border border-gold/5 p-4 text-xl font-display text-white rounded-sm outline-none focus:border-gold/20 transition-all disabled:opacity-20"
                          />
                       </div>
                    </div>

                    <button
                      onClick={() => handleUpdate(idx)}
                      disabled={saving === idx || !item.isActive}
                      className="w-full py-4 border border-gold/10 text-[10px] uppercase tracking-[0.3em] font-bold text-gold hover:bg-gold hover:text-primary transition-all shadow-glow-sm disabled:opacity-0"
                    >
                      {saving === idx ? 'GUARDANDO...' : 'Sincronizar'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

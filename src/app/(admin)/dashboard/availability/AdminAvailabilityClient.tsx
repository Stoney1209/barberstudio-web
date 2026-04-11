'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock, Calendar, CheckCircle, Save, User, 
  ChevronLeft, ChevronRight, Zap, Moon, Sun,
  Coffee, Scissors, RotateCcw
} from 'lucide-react'

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
  { key: 0, name: 'Domingo', short: 'DOM', icon: Sun },
  { key: 1, name: 'Lunes', short: 'LUN', icon: Moon },
  { key: 2, name: 'Martes', short: 'MAR', icon: Moon },
  { key: 3, name: 'Miércoles', short: 'MIE', icon: Moon },
  { key: 4, name: 'Jueves', short: 'JUE', icon: Moon },
  { key: 5, name: 'Viernes', short: 'VIE', icon: Moon },
  { key: 6, name: 'Sábado', short: 'SAB', icon: Sun },
]

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00',
]

const PRESET_SCHEDULES = [
  { label: 'Mañana', start: '09:00', end: '14:00', icon: Zap },
  { label: 'Tarde', start: '14:00', end: '19:00', icon: Sun },
  { label: 'Completo', start: '09:00', end: '21:00', icon: Clock },
  { label: 'Medio día', start: '10:00', end: '18:00', icon: Coffee },
]

export default function AdminAvailabilityClient({ initialBarbers }: { initialBarbers: Barber[] }) {
  const [selectedBarberId, setSelectedBarberId] = useState<string>(initialBarbers[0]?.id || '')
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeDay, setActiveDay] = useState(0)
  const [toast, setToast] = useState<string | null>(null)

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

  const handleSave = async () => {
    setSaving(true)
    try {
      await Promise.all(
        availabilities.map(item =>
          fetch('/api/availability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ barberId: selectedBarberId, ...item })
          })
        )
      )
      setToast('Horario guardado')
      setTimeout(() => setToast(null), 2000)
    } finally {
      setSaving(false)
    }
  }

  const handleDayToggle = (dayIndex: number) => {
    const newAvail = [...availabilities]
    newAvail[dayIndex].isActive = !newAvail[dayIndex].isActive
    setAvailabilities(newAvail)
    setActiveDay(dayIndex)
  }

  const handleTimeChange = (dayIndex: number, start: string, end: string) => {
    const newAvail = [...availabilities]
    newAvail[dayIndex] = { ...newAvail[dayIndex], startTime: start, endTime: end }
    setAvailabilities(newAvail)
  }

  const applyPreset = (preset: typeof PRESET_SCHEDULES[0], dayIndex: number) => {
    handleTimeChange(dayIndex, preset.start, preset.end)
  }

  const copyToAll = () => {
    const source = availabilities[activeDay]
    const newAvail = availabilities.map((_, i) => ({
      ..._,
      startTime: source.startTime,
      endTime: source.endTime,
      isActive: source.isActive,
    }))
    setAvailabilities(newAvail)
    setToast('Copiado a todos los días')
    setTimeout(() => setToast(null), 2000)
  }

  const currentDay = availabilities[activeDay] || { startTime: '09:00', endTime: '18:00', isActive: false }

  const getIntervalLabel = (start: string, end: string) => {
    const startIdx = TIME_SLOTS.indexOf(start)
    const endIdx = TIME_SLOTS.indexOf(end)
    return Math.max(0, endIdx - startIdx)
  }

  return (
    <div className="min-h-screen bg-gradient-mesh bg-noise pt-12 pb-24 px-4 md:px-6">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass border border-gold/30 px-6 py-3"
          >
            <p className="text-gold text-xs uppercase tracking-widest">{toast}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto">
        <header className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gold/5 pb-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <p className="text-gold/60 text-xs uppercase tracking-[0.4em] mb-2">Panel</p>
            <h1 className="text-4xl md:text-5xl font-display text-white italic">Horarios</h1>
          </motion.div>

          <div className="relative group min-w-[200px]">
            <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/40" />
            <select
              value={selectedBarberId}
              onChange={(e) => setSelectedBarberId(e.target.value)}
              className="w-full bg-surface-2/40 border border-gold/10 p-3 pl-11 text-xs tracking-widest text-white outline-none focus:border-gold/50 appearance-none transition-all font-bold"
            >
              {initialBarbers.map(b => (
                <option key={b.id} value={b.id} className="bg-surface-2">{b.name || b.email}</option>
              ))}
            </select>
          </div>
        </header>

        <div className="grid grid-cols-7 gap-2 mb-6">
          {DAYS.map((day, idx) => {
            const avail = availabilities[idx]
            const isActive = avail?.isActive
            const Icon = day.icon
            return (
              <button
                key={day.key}
                onClick={() => setActiveDay(idx)}
                className={`
                  relative p-3 md:p-4 border transition-all duration-300 flex flex-col items-center gap-1
                  ${activeDay === idx 
                    ? 'border-gold bg-gold/5 text-gold' 
                    : isActive 
                      ? 'border-gold/20 bg-gold/5/30 text-white/80 hover:border-gold/40'
                      : 'border-gold/5 text-muted/40 hover:border-gold/20'
                  }
                `}
              >
                <Icon size={14} />
                <span className="text-[10px] uppercase tracking-wider">{day.short}</span>
                {isActive && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-gold rounded-full shadow-glow" />
                )}
              </button>
            )
          })}
        </div>

        {loading ? (
          <div className="p-32 text-center">
            <div className="w-12 h-12 border-2 border-gold/10 border-t-gold rounded-full animate-spin mx-auto shadow-glow" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <motion.div
                key={activeDay}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass border border-gold/10 p-6 md:p-8"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-display text-white">{DAYS[activeDay].name}</h2>
                    <p className="text-gold/60 text-xs uppercase tracking-widest mt-1">
                      {getIntervalLabel(currentDay.startTime, currentDay.endTime)} horas configuradas
                    </p>
                  </div>
                  <button
                    onClick={() => handleDayToggle(activeDay)}
                    className={`
                      px-6 py-3 text-xs uppercase tracking-[0.2em] font-bold border transition-all
                      ${currentDay.isActive 
                        ? 'bg-gold text-primary border-gold hover:bg-gold-light' 
                        : 'text-muted border-gold/20 hover:border-gold/50'
                      }
                    `}
                  >
                    {currentDay.isActive ? 'Activo' : 'Inactivo'}
                  </button>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] text-muted/50 uppercase tracking-widest">Entrada</label>
                      <select
                        value={currentDay.startTime}
                        onChange={(e) => handleTimeChange(activeDay, e.target.value, currentDay.endTime)}
                        disabled={!currentDay.isActive}
                        className="bg-black/40 border border-gold/10 p-4 text-xl font-display text-gold outline-none focus:border-gold/30 transition-all disabled:opacity-30"
                      >
                        {TIME_SLOTS.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] text-muted/50 uppercase tracking-widest">Salida</label>
                      <select
                        value={currentDay.endTime}
                        onChange={(e) => handleTimeChange(activeDay, currentDay.startTime, e.target.value)}
                        disabled={!currentDay.isActive}
                        className="bg-black/40 border border-gold/10 p-4 text-xl font-display text-white outline-none focus:border-gold/30 transition-all disabled:opacity-30"
                      >
                        {TIME_SLOTS.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {PRESET_SCHEDULES.map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => applyPreset(preset, activeDay)}
                        disabled={!currentDay.isActive}
                        className="flex items-center gap-2 px-4 py-2 border border-gold/10 text-xs uppercase tracking-wider text-muted hover:border-gold/50 hover:text-gold transition-all disabled:opacity-30"
                      >
                        <preset.icon size={12} />
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-8 p-4 bg-gold/5 border border-gold/10">
                  <p className="text-[10px] text-muted/50 uppercase tracking-widest mb-3">Vista previa</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock size={14} className="text-gold" />
                    <span className="text-white font-display">
                      {currentDay.startTime} — {currentDay.endTime}
                    </span>
                    {currentDay.isActive && (
                      <span className="text-gold/60 text-xs ml-2">({getIntervalLabel(currentDay.startTime, currentDay.endTime)}h)</span>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="space-y-4">
              <button
                onClick={copyToAll}
                disabled={!currentDay.isActive}
                className="w-full p-4 border border-gold/10 text-xs uppercase tracking-wider text-muted hover:border-gold/50 hover:text-gold transition-all flex items-center justify-center gap-2 disabled:opacity-30"
              >
                <RotateCcw size={14} />
                Copiar a todos los días
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-4 bg-gold text-primary text-xs uppercase tracking-[0.3em] font-bold hover:bg-gold-light transition-all flex items-center justify-center gap-2"
              >
                {saving ? (
                  <div className="w-4 h-4 border border-primary/30 border-t-primary rounded-full animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                {saving ? 'Guardando...' : 'Guardar todo'}
              </button>

              <div className="glass border border-gold/5 p-4">
                <p className="text-[10px] text-muted/40 uppercase tracking-widest mb-3">Resumen</p>
                <div className="space-y-2 text-xs">
                  {availabilities.map((a, i) => (
                    <div key={i} className="flex justify-between">
                      <span className={a.isActive ? 'text-white/80' : 'text-muted/30'}>{DAYS[i].short}</span>
                      <span className={a.isActive ? 'text-gold' : 'text-muted/30'}>
                        {a.isActive ? `${a.startTime}–${a.endTime}` : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
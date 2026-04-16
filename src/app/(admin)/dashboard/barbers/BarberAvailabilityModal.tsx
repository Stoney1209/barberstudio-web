'use client'

import React, { useState, useEffect } from 'react'
import { Clock, Save, X, Moon, Sun, RotateCcw, Zap, Coffee } from 'lucide-react'
import { motion } from 'framer-motion'

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
  { key: 3, name: 'Miercoles', short: 'MIE', icon: Moon },
  { key: 4, name: 'Jueves', short: 'JUE', icon: Moon },
  { key: 5, name: 'Viernes', short: 'VIE', icon: Moon },
  { key: 6, name: 'Sabado', short: 'SAB', icon: Sun },
]

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00',
]

const PRESETS = [
  { label: 'Manana', start: '09:00', end: '14:00', icon: Zap },
  { label: 'Tarde', start: '14:00', end: '19:00', icon: Sun },
  { label: 'Completo', start: '09:00', end: '21:00', icon: Clock },
  { label: 'Medio', start: '10:00', end: '18:00', icon: Coffee },
]

export const BarberAvailabilityModal = ({
  barberId,
  barberName,
  onClose,
}: {
  barberId: string,
  barberName: string,
  onClose: () => void
}) => {
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeDay, setActiveDay] = useState(0)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    fetchAvailabilities()
  }, [barberId])

  const fetchAvailabilities = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/availability?barberId=${barberId}`)
      const data = await res.json()
      const fullWeek = DAYS.map((_, i) => {
        const existing = data.availabilities?.find((a: Availability) => a.dayOfWeek === i)
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
        availabilities.map((item) =>
          fetch('/api/availability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ barberId, ...item }),
          })
        )
      )
      setToast('Guardado')
      setTimeout(() => setToast(null), 2000)
    } finally {
      setSaving(false)
    }
  }

  const handleDayToggle = (idx: number) => {
    setAvailabilities((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], isActive: !next[idx].isActive }
      return next
    })
    setActiveDay(idx)
  }

  const handleTimeChange = (start: string, end: string) => {
    setAvailabilities((prev) => {
      const next = [...prev]
      next[activeDay] = { ...next[activeDay], startTime: start, endTime: end }
      return next
    })
  }

  const applyPreset = (preset: typeof PRESETS[0]) => {
    handleTimeChange(preset.start, preset.end)
  }

  const copyToAll = () => {
    const source = availabilities[activeDay]
    const next = availabilities.map((a) => ({
      ...a,
      startTime: source.startTime,
      endTime: source.endTime,
      isActive: source.isActive,
    }))
    setAvailabilities(next)
    setToast('Copiado a todos')
    setTimeout(() => setToast(null), 2000)
  }

  const currentDay = availabilities[activeDay] || { startTime: '09:00', endTime: '18:00', isActive: false }

  const getHours = (start: string, end: string) => {
    const s = TIME_SLOTS.indexOf(start)
    const e = TIME_SLOTS.indexOf(end)
    return Math.max(0, e - s)
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/95 backdrop-blur-xl"
        onClick={onClose}
      />

      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[120] glass border border-gold/30 px-6 py-3"
        >
          <p className="text-gold text-xs uppercase tracking-widest">{toast}</p>
        </motion.div>
      )}

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="glass border border-gold/10 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative z-10"
      >
        <div className="p-6 border-b border-gold/5 flex items-center justify-between sticky top-0 bg-surface z-10">
          <div>
            <p className="text-gold/40 text-[10px] uppercase tracking-[0.4em] mb-1">Horarios</p>
            <h2 className="text-2xl font-display text-white italic">{barberName}</h2>
          </div>
          <button onClick={onClose} className="text-muted hover:text-gold transition-colors p-2">
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-gold/10 border-t-gold rounded-full animate-spin" />
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1">
              {DAYS.map((day, idx) => {
                const avail = availabilities[idx]
                const Icon = day.icon
                return (
                  <button
                    key={day.key}
                    onClick={() => setActiveDay(idx)}
                    className={`
                      relative p-2 border flex flex-col items-center gap-1 transition-all rounded
                      ${activeDay === idx
                        ? 'border-gold bg-gold/5 text-gold'
                        : avail?.isActive
                          ? 'border-gold/20 text-white/80 hover:border-gold/40'
                          : 'border-gold/5 text-muted/40'
                      }
                    `}
                  >
                    <Icon size={12} />
                    <span className="text-[8px] uppercase">{day.short}</span>
                    {avail?.isActive && (
                      <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-gold rounded-full" />
                    )}
                  </button>
                )
              })}
            </div>

            <div className="border border-gold/10 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-display text-white">{DAYS[activeDay].name}</h3>
                <button
                  onClick={() => handleDayToggle(activeDay)}
                  className={`
                    px-3 py-1 text-[10px] uppercase tracking-wider border transition-all rounded
                    ${currentDay.isActive
                      ? 'bg-gold text-primary border-gold'
                      : 'text-muted border-gold/20'
                    }
                  `}
                >
                  {currentDay.isActive ? 'Activo' : 'Inactivo'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <select
                  value={currentDay.startTime}
                  onChange={(e) => handleTimeChange(e.target.value, currentDay.endTime)}
                  disabled={!currentDay.isActive}
                  className="bg-black/40 border border-gold/10 p-2 text-sm font-display text-gold disabled:opacity-30 rounded"
                >
                  {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <select
                  value={currentDay.endTime}
                  onChange={(e) => handleTimeChange(currentDay.startTime, e.target.value)}
                  disabled={!currentDay.isActive}
                  className="bg-black/40 border border-gold/10 p-2 text-sm font-display text-white disabled:opacity-30 rounded"
                >
                  {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => applyPreset(p)}
                    disabled={!currentDay.isActive}
                    className="flex items-center gap-1 px-2 py-1 border border-gold/10 text-[10px] text-muted hover:border-gold/50 disabled:opacity-30 rounded"
                  >
                    <p.icon size={10} />
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-muted/60">
                <Clock size={12} className="text-gold" />
                {currentDay.startTime} - {currentDay.endTime}
                {currentDay.isActive && <span>({getHours(currentDay.startTime, currentDay.endTime)}h)</span>}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={copyToAll}
                disabled={!currentDay.isActive}
                className="flex-1 py-2 border border-gold/10 text-[10px] text-muted hover:border-gold/50 disabled:opacity-30 flex items-center justify-center gap-1 rounded"
              >
                <RotateCcw size={12} /> Copiar a todos
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2 bg-gold text-primary text-[10px] font-bold flex items-center justify-center gap-1 rounded"
              >
                {saving ? '...' : <><Save size={12} /> Guardar</>}
              </button>
            </div>

            <div className="p-3 bg-gold/5 border border-gold/10 rounded">
              <p className="text-[10px] text-muted/50 mb-2">Resumen</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                {availabilities.map((a, i) => (
                  <div key={i} className="flex justify-between gap-2">
                    <span className={a.isActive ? 'text-white/70' : 'text-muted/30'}>{DAYS[i].short}</span>
                    <span className={a.isActive ? 'text-gold' : 'text-muted/30'}>
                      {a.isActive ? `${a.startTime}-${a.endTime}` : '-'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

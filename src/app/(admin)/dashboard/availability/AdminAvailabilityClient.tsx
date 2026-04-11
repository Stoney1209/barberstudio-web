'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock, Save, User, 
  Zap, Moon, Sun, Coffee,
  ChevronDown, Search, X
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
  { label: 'Medio', start: '10:00', end: '18:00', icon: Coffee },
]

interface TimeSelectProps {
  label: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  color?: 'gold' | 'white'
}

function TimeSelect({ label, value, onChange, disabled, color = 'white' }: TimeSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  const filteredSlots = TIME_SLOTS.filter(t => 
    t.includes(search) || search === ''
  )

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="flex flex-col gap-2" ref={ref}>
      <label className="text-[10px] text-muted/50 uppercase tracking-widest">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setOpen(!open)}
          disabled={disabled}
          className={`
            w-full flex items-center justify-between gap-2 px-4 py-3 
            bg-black/40 border border-gold/10 text-lg font-display
            ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:border-gold/30'}
            ${open ? 'border-gold/30' : ''}
            transition-all
            ${color === 'gold' ? 'text-gold' : 'text-white'}
          `}
        >
          <span>{value}</span>
          <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 w-full mt-1 bg-surface-2 border border-gold/20 rounded-lg shadow-xl overflow-hidden"
            >
              <div className="p-2 border-b border-gold/10">
                <div className="flex items-center gap-2 px-2 py-1 bg-black/40 rounded">
                  <Search size={12} className="text-muted/40" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-white placeholder-muted/40 outline-none"
                  />
                  {search && (
                    <button onClick={() => setSearch('')}><X size={12} className="text-muted/40" /></button>
                  )}
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto py-1">
                {filteredSlots.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { onChange(t); setOpen(false); setSearch('') }}
                    className={`
                      w-full px-4 py-2 text-left text-sm hover:bg-gold/10 transition-colors
                      ${value === t ? 'text-gold bg-gold/5' : 'text-white/70'}
                    `}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

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

      <div className="max-w-4xl mx-auto">
        <header className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gold/5 pb-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <p className="text-gold/60 text-xs uppercase tracking-[0.4em] mb-2">Panel</p>
            <h1 className="text-3xl md:text-4xl font-display text-white italic">Horarios</h1>
          </motion.div>

          <div className="relative group min-w-[180px]">
            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/40" />
            <select
              value={selectedBarberId}
              onChange={(e) => setSelectedBarberId(e.target.value)}
              className="w-full bg-surface-2/40 border border-gold/10 p-2.5 pl-9 text-xs tracking-widest text-white outline-none focus:border-gold/50 appearance-none transition-all font-bold"
            >
              {initialBarbers.map(b => (
                <option key={b.id} value={b.id} className="bg-surface-2">{b.name || b.email}</option>
              ))}
            </select>
          </div>
        </header>

        <div className="grid grid-cols-7 gap-1 mb-6">
          {DAYS.map((day, idx) => {
            const avail = availabilities[idx]
            const isActive = avail?.isActive
            const Icon = day.icon
            return (
              <button
                key={day.key}
                onClick={() => setActiveDay(idx)}
                className={`
                  relative p-2 md:p-3 border transition-all duration-300 flex flex-col items-center gap-1
                  ${activeDay === idx 
                    ? 'border-gold bg-gold/5 text-gold' 
                    : isActive 
                      ? 'border-gold/20 bg-gold/5/30 text-white/80 hover:border-gold/40'
                      : 'border-gold/5 text-muted/40 hover:border-gold/20'
                  }
                `}
              >
                <Icon size={12} />
                <span className="text-[9px] uppercase tracking-wider">{day.short}</span>
                {isActive && (
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-gold rounded-full shadow-glow" />
                )}
              </button>
            )
          })}
        </div>

        {loading ? (
          <div className="p-20 text-center">
            <div className="w-8 h-8 border-2 border-gold/10 border-t-gold rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              key={activeDay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass border border-gold/10 p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-display text-white">{DAYS[activeDay].name}</h2>
                  <p className="text-gold/60 text-[10px] uppercase tracking-widest mt-0.5">
                    {getIntervalLabel(currentDay.startTime, currentDay.endTime)} hrs
                  </p>
                </div>
                <button
                  onClick={() => handleDayToggle(activeDay)}
                  className={`
                    px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] font-bold border transition-all
                    ${currentDay.isActive 
                      ? 'bg-gold text-primary border-gold hover:bg-gold-light' 
                      : 'text-muted border-gold/20 hover:border-gold/50'
                    }
                  `}
                >
                  {currentDay.isActive ? 'Activo' : 'Inactivo'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <TimeSelect
                  label="Entrada"
                  value={currentDay.startTime}
                  onChange={(v) => handleTimeChange(activeDay, v, currentDay.endTime)}
                  disabled={!currentDay.isActive}
                  color="gold"
                />
                <TimeSelect
                  label="Salida"
                  value={currentDay.endTime}
                  onChange={(v) => handleTimeChange(activeDay, currentDay.startTime, v)}
                  disabled={!currentDay.isActive}
                />
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {PRESET_SCHEDULES.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => applyPreset(preset, activeDay)}
                    disabled={!currentDay.isActive}
                    className="flex items-center gap-1 px-2 py-1 border border-gold/10 text-[9px] uppercase tracking-wider text-muted hover:border-gold/50 hover:text-gold transition-all disabled:opacity-30"
                  >
                    <preset.icon size={10} />
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="p-3 bg-gold/5 border border-gold/10 flex items-center gap-2 text-sm">
                <Clock size={12} className="text-gold" />
                <span className="text-white font-display">
                  {currentDay.startTime} — {currentDay.endTime}
                </span>
              </div>
            </motion.div>

            <div className="space-y-3">
              <button
                onClick={copyToAll}
                disabled={!currentDay.isActive}
                className="w-full py-2.5 border border-gold/10 text-[10px] uppercase tracking-wider text-muted hover:border-gold/50 hover:text-gold transition-all flex items-center justify-center gap-2 disabled:opacity-30"
              >
                <span>Copiar a todos los días</span>
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 bg-gold text-primary text-xs uppercase tracking-[0.3em] font-bold hover:bg-gold-light transition-all flex items-center justify-center gap-2"
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>

              <div className="glass border border-gold/5 p-4">
                <p className="text-[9px] text-muted/40 uppercase tracking-widest mb-2">Resumen semanal</p>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  {availabilities.map((a, i) => (
                    <div key={i} className="flex justify-between">
                      <span className={a.isActive ? 'text-white/70' : 'text-muted/30'}>{DAYS[i].short}</span>
                      <span className={a.isActive ? 'text-gold' : 'text-muted/30'}>
                        {a.isActive ? `${a.startTime}-${a.endTime}` : '—'}
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
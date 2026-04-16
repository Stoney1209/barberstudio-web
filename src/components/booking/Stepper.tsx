"use client"
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getLocalDateString } from '@/lib/booking-validation'

type Step = 0 | 1 | 2 | 3
type StepLabel = 'Servicio' | 'Barbero' | 'Fecha' | 'Confirmar'

type ServiceOption = { id: string; name: string; duration: number; price: number; category: string }
type BarberOption = { id: string; name: string }
type TimeSlot = { time: string; available: boolean }
type Props = {
  onComplete?: (data: any) => void
  services?: ServiceOption[]
  barbers?: BarberOption[]
  isSubmitting?: boolean
}

const STEPS: StepLabel[] = ['Servicio', 'Barbero', 'Fecha', 'Confirmar']
const SERVICE_CATEGORIES: Record<string, { icon: string; label: string }> = {
  FADE: { icon: '✂️', label: 'Fade' },
  CLASSIC: { icon: '💇', label: 'Clásico' },
  GRADIENT: { icon: '🎨', label: 'Gradient' },
  BEARD: { icon: '🧔', label: 'Barba' },
  SHAVE: { icon: '🪒', label: 'Afeitado' },
}

export const Stepper: React.FC<Props> = ({ onComplete, services = [], barbers = [], isSubmitting = false }) => {
  const [step, setStep] = useState<Step>(0)
  const [serviceId, setServiceId] = useState<string | null>(services[0]?.id ?? null)
  const [serviceName, setServiceName] = useState<string>(services[0]?.name ?? '')
  const [servicePrice, setServicePrice] = useState<number>(services[0]?.price ?? 0)
  const [serviceCategory, setServiceCategory] = useState<string>(services[0]?.category ?? '')
  const [duration, setDuration] = useState<number>(services[0]?.duration ?? 0)
  const [barberId, setBarberId] = useState<string | null>(barbers[0]?.id ?? null)
  const [barberName, setBarberName] = useState<string>(barbers[0]?.name ?? '')
  const [date, setDate] = useState<string>(() => {
    return getLocalDateString(new Date())
  })
  const [time, setTime] = useState<string>('')
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  /** null = sin horarios en BD → solo se bloquea domingo (comportamiento previo). Si hay filas activas, solo esos días de semana. */
  const [barberWorkingWeekdays, setBarberWorkingWeekdays] = useState<Set<number> | null>(null)
  const [loadingBarberSchedule, setLoadingBarberSchedule] = useState(false)
  const [closedDayMessage, setClosedDayMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!serviceId && services.length > 0) {
      const s = services[0]
      setServiceId(s.id)
      setServiceName(s.name)
      setServicePrice(s.price)
      setServiceCategory(s.category)
      setDuration(s.duration)
    }
  }, [services])

  useEffect(() => {
    if (!barberId && barbers.length > 0) {
      const b = barbers[0]
      setBarberId(b.id)
      setBarberName(b.name)
    }
  }, [barbers])

  useEffect(() => {
    if (!barberId) {
      setBarberWorkingWeekdays(null)
      return
    }
    const id = barberId
    setBarberWorkingWeekdays(null)
    let cancelled = false
    async function loadBarberSchedule() {
      setLoadingBarberSchedule(true)
      try {
        const res = await fetch(`/api/availability?barberId=${encodeURIComponent(id)}`)
        if (!res.ok || cancelled) return
        const data = await res.json()
        const list: { dayOfWeek: number; isActive?: boolean }[] = data.availabilities ?? []
        const active = list.filter((a) => a.isActive !== false)
        if (cancelled) return
        if (active.length === 0) {
          setBarberWorkingWeekdays(null)
        } else {
          setBarberWorkingWeekdays(new Set(active.map((a) => a.dayOfWeek)))
        }
      } catch {
        if (!cancelled) setBarberWorkingWeekdays(null)
      } finally {
        if (!cancelled) setLoadingBarberSchedule(false)
      }
    }
    loadBarberSchedule()
    return () => {
      cancelled = true
    }
  }, [barberId])

  useEffect(() => {
    if (barberWorkingWeekdays === null) return
    const d = new Date(date + 'T12:00:00')
    if (barberWorkingWeekdays.has(d.getDay())) return
    for (let i = 0; i < 28; i++) {
      const x = new Date()
      x.setHours(12, 0, 0, 0)
      x.setDate(x.getDate() + i)
      if (barberWorkingWeekdays.has(x.getDay())) {
        setDate(getLocalDateString(x))
        setTime('')
        return
      }
    }
  }, [barberWorkingWeekdays, date])

  useEffect(() => {
    async function fetchSlots() {
      if (!barberId || !date || !duration) {
        setAvailableSlots([])
        setClosedDayMessage(null)
        return
      }
      setLoadingSlots(true)
      try {
        const res = await fetch(`/api/availability?barberId=${barberId}&date=${date}&duration=${duration}`)
        const data = await res.json()
        if (data.closedDay) {
          setAvailableSlots([])
          setClosedDayMessage(typeof data.message === 'string' ? data.message : 'El barbero no atiende este día')
          return
        }
        setClosedDayMessage(null)
        if (data.availableSlots) {
          setAvailableSlots(data.availableSlots.map((t: string) => ({ time: t, available: true })))
        }
      } catch {
        setAvailableSlots([])
        setClosedDayMessage(null)
      } finally {
        setLoadingSlots(false)
      }
    }
    fetchSlots()
  }, [barberId, date, duration])

  const next = () => setStep((s) => ((s as number) + 1) as Step)
  const prev = () => setStep((s) => ((s as number) - 1) as Step)

  const addMinutes = (start: string, mins: number) => {
    const [hh, mm] = start.split(':').map(Number)
    let m = mm + mins
    let h = hh + Math.floor(m / 60)
    m = m % 60
    h = h % 24
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }

  const handleSubmit = () => {
    const endTime = addMinutes(time, duration)
    onComplete?.({
      serviceId: serviceId!,
      serviceName,
      servicePrice,
      serviceCategory,
      duration,
      barberId: barberId!,
      barberName,
      date,
      startTime: time,
      endTime,
    })
  }

  const isFirstStep = step === 0
  const isLastStep = step === 3

  const isStepValid = () => {
    switch (step) {
      case 0: return !!serviceId
      case 1: return !!barberId
      case 2: return !!date && !!time
      case 3: return true
      default: return false
    }
  }

  const variants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  }

  const formatDate = (d: string) => {
    const dateObj = new Date(d + 'T00:00:00')
    return dateObj.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-12 relative lg:relative sticky lg:top-0 z-50 bg-surface-2/95 backdrop-blur-lg py-4 lg:py-0 rounded-lg lg:rounded-none -mx-4 px-4 lg:mx-0 lg:px-0">
        <div className="absolute top-4 left-0 right-0 h-px bg-gold/10 hidden lg:block" />
        <div className="absolute top-4 left-0 h-px bg-gold transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }} />
        
        {STEPS.map((label, index) => {
          const isActive = index === step
          const isCompleted = index < step
          return (
            <div key={label} className="relative flex flex-col items-center z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                isActive ? 'bg-gold text-primary scale-110 shadow-lg shadow-gold/20' : isCompleted ? 'bg-gold/20 text-gold' : 'bg-surface-2 text-muted/50 border border-gold/10'
              }`}>
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : index + 1}
              </div>
              <span className={`mt-3 text-xs font-medium uppercase tracking-wider transition-colors ${isActive ? 'text-gold' : isCompleted ? 'text-muted' : 'text-muted/40'}`}>
                {label}
              </span>
            </div>
          )
        })}
      </div>

      <div className="min-h-[400px] relative">
        <AnimatePresence mode="wait">
          <motion.div key={step} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="glass p-8 border border-gold/10 rounded-lg">
            {step === 0 && (
              <div>
                <h3 className="text-2xl font-display text-white mb-2">Selecciona tu servicio</h3>
                <p className="text-muted/60 mb-8">Elige el tratamiento que mejor se adapte a vos</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((s) => {
                    const categoryInfo = SERVICE_CATEGORIES[s.category] || { icon: '✂️', label: s.category }
                    return (
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        key={s.id} 
                        onClick={() => { setServiceId(s.id); setServiceName(s.name); setServicePrice(s.price); setServiceCategory(s.category); setDuration(s.duration) }} 
                        className={`p-5 rounded-xl border transition-all text-left group ${serviceId === s.id ? 'border-gold bg-gold/5' : 'border-gold/10 hover:border-gold/30'}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">{categoryInfo.icon}</span>
                              <span className="text-xs text-gold/70 bg-gold/10 px-2 py-0.5 rounded">{categoryInfo.label}</span>
                            </div>
                            <p className="text-white font-medium text-lg">{s.name}</p>
                            <p className="text-sm text-muted/60 mt-1">{s.duration} min</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-light text-gold">${Number(s.price).toFixed(0)}</p>
                          </div>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h3 className="text-2xl font-display text-white mb-2">Elige a tu barbero</h3>
                <p className="text-muted/60 mb-8">Profesionales listos para atenderte</p>
                
                {barbers.length === 0 ? (
                  <div className="p-8 text-center border border-gold/10 rounded-xl">
                    <p className="text-muted/60 mb-4">No hay barberos disponibles en este momento.</p>
                    <p className="text-sm text-muted/40">Vuelve más tarde o contacta directamente a la barbería.</p>
                  </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {barbers.map((b) => (
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      key={b.id} 
                      onClick={() => { setBarberId(b.id); setBarberName(b.name); setTime('') }} 
                      className={`p-5 rounded-xl border transition-all text-left flex items-center gap-4 ${barberId === b.id ? 'border-gold bg-gold/5' : 'border-gold/10 hover:border-gold/30'}`}
                    >
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center text-2xl font-display text-gold border border-gold/20">
                        {b.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium text-lg">{b.name}</p>
                        <p className="text-sm text-muted/60">Barbero profesional</p>
                        <div className="flex gap-1 mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className="text-gold/60 text-sm">★</span>
                          ))}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div>
                <h3 className="text-2xl font-display text-white mb-2">Fecha y hora</h3>
                <p className="text-muted/60 mb-8">Selecciona el horario disponible</p>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-muted/70 mb-3">Fecha</label>
                    {loadingBarberSchedule ? (
                      <div className="flex justify-center py-8">
                        <div className="w-6 h-6 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                        {Array.from({ length: 28 }, (_, i) => {
                          const d = new Date()
                          d.setHours(12, 0, 0, 0) // Centrar el día
                          d.setDate(d.getDate() + i)
                          const dateStr = getLocalDateString(d)
                          const isSelected = date === dateStr
                          const dayNum = d.getDay()
                          /** Legacy: Domingo siempre inhábil si no hay records. */
                          const isLegacySundayOff = barberWorkingWeekdays === null && dayNum === 0
                          const isClosedBySchedule = barberWorkingWeekdays !== null && !barberWorkingWeekdays.has(dayNum)
                          const disabled = isClosedBySchedule || isLegacySundayOff
                          
                          return (
                            <button 
                              key={i} 
                              onClick={() => { setDate(dateStr); setTime('') }} 
                              disabled={disabled} 
                              className={`p-3 rounded-lg text-center transition-all ${isSelected ? 'bg-gold text-primary' : disabled ? 'bg-surface-2/50 text-muted/30 cursor-not-allowed' : 'bg-surface-2 border border-gold/10 hover:border-gold/30 text-white'}`}
                            >
                              <p className="text-xs text-muted mb-1">{d.toLocaleDateString('es-MX', { weekday: 'short' })}</p>
                              <p className="text-lg font-medium">{d.getDate()}</p>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                  
                  {date && (
                    <div>
                      <label className="block text-sm font-medium text-muted/70 mb-3">
                        Horario disponible - {formatDate(date)}
                      </label>
                      {loadingSlots ? (
                        <div className="flex justify-center py-8">
                          <div className="w-6 h-6 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
                        </div>
                      ) : availableSlots.length > 0 ? (
                        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                          {availableSlots.map((slot) => (
                            <button key={slot.time} onClick={() => setTime(slot.time)} disabled={!slot.available} className={`p-3 rounded-lg text-center transition-all font-medium ${time === slot.time ? 'bg-gold text-primary' : slot.available ? 'bg-surface-2 border border-gold/10 hover:border-gold/30 text-white' : 'bg-surface-2/50 text-muted/30 line-through cursor-not-allowed'}`}>
                              {slot.time}
                            </button>
                          ))}
                        </div>
                      ) : closedDayMessage ? (
                        <p className="text-center py-8 text-amber-200/90">{closedDayMessage}</p>
                      ) : (
                        <p className="text-center py-8 text-muted/60">No hay horarios disponibles para esta fecha</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h3 className="text-2xl font-display text-white mb-2">Confirma tu reserva</h3>
                <p className="text-muted/60 mb-8">Revisa los detalles antes de confirmar</p>
                <div className="space-y-4">
                  <div className="p-4 bg-surface-2/50 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted/50 uppercase mb-1">Servicio</p>
                      <p className="text-white font-medium">{serviceName}</p>
                      <p className="text-sm text-gold">{duration} min</p>
                    </div>
                    <span className="text-2xl font-light text-gold">${Number(servicePrice).toFixed(0)}</span>
                  </div>
                  <div className="p-4 bg-surface-2/50 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted/50 uppercase mb-1">Barbero</p>
                      <p className="text-white font-medium">{barberName}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-surface-2/50 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted/50 uppercase mb-1">Fecha y hora</p>
                      <p className="text-white font-medium">{formatDate(date)}</p>
                      <p className="text-sm text-gold">{time} - {addMinutes(time, duration)}</p>
                    </div>
                  </div>
                  <div className="p-6 bg-gold/10 rounded-lg border border-gold/20 mt-6">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium text-lg">Total a pagar</span>
                      <span className="text-3xl font-light text-gold">${Number(servicePrice).toFixed(0)}</span>
                    </div>
                    <p className="text-xs text-muted/60 mt-2">Pago en tienda al recibir el servicio</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex gap-4">
        {!isFirstStep && (
          <motion.button 
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={prev} 
            className="px-8 py-4 border border-gold/20 text-muted hover:border-gold/40 hover:text-gold transition-all rounded-sm font-medium"
          >
            ← Atrás
          </motion.button>
        )}
        {!isLastStep ? (
          <motion.button 
            whileHover={isStepValid() ? { scale: 1.02 } : {}}
            whileTap={isStepValid() ? { scale: 0.98 } : {}}
            onClick={next} 
            disabled={!isStepValid()} 
            className={`flex-1 px-8 py-4 rounded-sm transition-all font-medium text-lg ${isStepValid() ? 'btn-gold' : 'bg-surface-2 text-muted/50 cursor-not-allowed'}`}
          >
            Siguiente →
          </motion.button>
        ) : (
          <motion.button 
            whileHover={isStepValid() && !isSubmitting ? { scale: 1.02 } : {}}
            whileTap={isStepValid() && !isSubmitting ? { scale: 0.98 } : {}}
            onClick={handleSubmit} 
            disabled={!isStepValid() || isSubmitting} 
            className={`flex-1 px-8 py-4 rounded-sm transition-all font-medium text-lg ${isStepValid() && !isSubmitting ? 'btn-gold' : 'bg-surface-2 text-muted/50 cursor-not-allowed'}`}
          >
            {isSubmitting ? 'Confirmando...' : '✓ Confirmar Reserva'}
          </motion.button>
        )}
      </div>
    </div>
  )
}

export default Stepper
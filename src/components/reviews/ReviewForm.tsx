'use client'

import React, { useState, useEffect } from 'react'
import { Star, X, Check } from 'lucide-react'
import { useToast } from '@/components/ui/ToastContext'

type Appointment = {
  id: string
  date: string
  startTime: string
  service: { name: string }
  barber: { name: string }
}

type Props = {
  onReviewAdded?: () => void
}

export const ReviewForm: React.FC<Props> = ({ onReviewAdded }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState('')
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [showForm, setShowForm] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/appointments?status=COMPLETED&forReview=true')
      const data = await res.json()
      setAppointments(data.appointments || [])
    } catch (err) {
      console.error('Error fetching appointments:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAppointment || rating === 0) {
      showToast('Selecciona una cita y rating', 'error')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: selectedAppointment,
          rating,
          comment: comment || null,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        showToast(err.error || 'Error al enviar reseña', 'error')
        return
      }

      showToast('¡Gracias! Reseña enviada con éxito', 'success')
      setShowForm(false)
      setSelectedAppointment('')
      setRating(0)
      setComment('')
      onReviewAdded?.()
      fetchAppointments()
    } catch {
      showToast('Error de conexión', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return null

  if (appointments.length === 0) return null

  return (
    <div className="glass border border-gold/10 rounded-lg p-6 mb-8">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 bg-gold text-primary font-bold uppercase tracking-wider text-sm hover:bg-gold-light transition-colors"
        >
          Escribir una reseña
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-display text-xl">Nueva reseña</h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-muted hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <div>
            <label className="block text-xs text-muted/60 uppercase tracking-widest mb-2">
              Selecciona tu cita
            </label>
            <select
              value={selectedAppointment}
              onChange={(e) => setSelectedAppointment(e.target.value)}
              className="w-full bg-black/40 border border-gold/10 p-3 text-white outline-none focus:border-gold/30"
              required
            >
              <option value="">-- Seleccionar --</option>
              {appointments.map((apt) => (
                <option key={apt.id} value={apt.id}>
                  {apt.service.name} con {apt.barber.name} - {new Date(apt.date).toLocaleDateString('es-MX')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-muted/60 uppercase tracking-widest mb-2">
              Tu rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1"
                >
                  <Star
                    size={28}
                    className={`transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'fill-gold text-gold'
                        : 'text-muted/20'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-muted/60 uppercase tracking-widest mb-2">
              Comentario (opcional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comparte tu experiencia..."
              rows={3}
              className="w-full bg-black/40 border border-gold/10 p-3 text-white placeholder-muted/40 outline-none focus:border-gold/30 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !selectedAppointment || rating === 0}
            className="w-full py-3 bg-gold text-primary font-bold uppercase tracking-wider text-sm hover:bg-gold-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              'Enviando...'
            ) : (
              <>
                <Check size={18} /> Enviar reseña
              </>
            )}
          </button>
        </form>
      )}
    </div>
  )
}

export default ReviewForm
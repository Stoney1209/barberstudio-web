'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'

type Service = {
  id: string
  name: string
  description: string | null
  price: number | string
  duration: number
  category: string
}

const CATEGORIES = ['Todos', 'FADE', 'CLASSIC', 'GRADIENT', 'BEARD', 'SHAVE']

const CATEGORY_INFO: Record<string, { icon: string; color: string }> = {
  FADE: { icon: '\u2702\uFE0F', color: 'bg-blue-500/20 text-blue-400' },
  CLASSIC: { icon: '\uD83D\uDC87', color: 'bg-purple-500/20 text-purple-400' },
  GRADIENT: { icon: '\uD83C\uDFA8', color: 'bg-pink-500/20 text-pink-400' },
  BEARD: { icon: '\uD83E\uDDB4', color: 'bg-orange-500/20 text-orange-400' },
  SHAVE: { icon: '\uD83E\uDE92', color: 'bg-green-500/20 text-green-400' },
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [filter, setFilter] = useState('Todos')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch('/api/services')
        const data = await res.json()
        setServices(data.services || [])
      } catch (err) {
        console.error('Error fetching services:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchServices()
  }, [])

  const filteredServices = filter === 'Todos'
    ? services
    : services.filter((s) => s.category === filter)

  return (
    <div className="min-h-screen bg-gradient-mesh bg-noise pt-20 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-gold/60 text-sm uppercase tracking-widest mb-3">Catalogo</p>
          <h1 className="text-4xl md:text-5xl font-display font-light text-white mb-4">
            Nuestros <span className="text-gold">Servicios</span>
          </h1>
          <p className="text-muted/70 max-w-xl mx-auto">
            Cortes premium, arreglo de barba y tratamientos exclusivos.
            Cada servicio disenado para resaltar tu estilo personal.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2.5 border rounded-full text-sm font-medium transition-all ${
                filter === cat
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-gold/20 text-muted/70 hover:border-gold/40 hover:text-gold'
              }`}
            >
              {cat === 'Todos' ? cat : cat.charAt(0) + cat.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service, index) => {
              const info = CATEGORY_INFO[service.category] || { icon: '\u2702\uFE0F', color: 'bg-gold/20 text-gold' }
              return (
                <div
                  key={service.id}
                  className="group card-luxury glass p-6 border border-gold/10 rounded-lg animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs uppercase tracking-wider px-2 py-1 rounded ${info.color}`}>
                      {info.icon} {service.category}
                    </span>
                    <span className="text-sm text-muted/50">{service.duration} min</span>
                  </div>

                  <h3 className="text-2xl font-display text-white mb-2 group-hover:text-gold transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-muted/70 mb-6 line-clamp-3">
                    {service.description || 'Servicio premium de barberia con productos de primera calidad'}
                  </p>

                  <div className="flex items-end justify-between pt-4 border-t border-gold/10">
                    <div>
                      <span className="text-3xl font-light text-gold">
                        ${Number(service.price).toFixed(0)}
                      </span>
                      <span className="text-muted/50 text-sm ml-1">MXN</span>
                    </div>
                    <Link
                      href="/reservar"
                      className="btn-gold px-5 py-2 rounded-sm text-sm uppercase tracking-wider"
                    >
                      <span>Reservar</span>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {filteredServices.length === 0 && !loading && (
          <div className="text-center py-16">
            <p className="text-muted/60 text-lg">No hay servicios en esta categoria</p>
          </div>
        )}

        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-surface-2/95 backdrop-blur-lg border-t border-gold/10 z-50 flex justify-center">
          <Link href="/reservar" className="flex-1 py-4 bg-gold text-primary text-center font-bold uppercase tracking-wider rounded-lg shadow-glow">
            Reservar Cita
          </Link>
        </div>
        <div className="lg:hidden h-24" />

        <div className="mt-16 text-center">
          <div className="glass p-8 border border-gold/10 rounded-lg inline-block">
            <p className="text-white font-display text-xl mb-2">
              No sabes que servicio elegir?
            </p>
            <p className="text-muted/60 text-sm mb-4">
              Nuestro equipo te asesorara personalmente
            </p>
            <Link
              href="/reservar"
              className="text-gold hover:text-gold-light transition-colors inline-flex items-center gap-2"
            >
              Agendar consulta gratuita
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

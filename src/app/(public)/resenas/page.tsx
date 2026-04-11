'use client'
import React, { useState, useEffect } from 'react'

type Review = {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  client: { name: string | null }
  appointment: {
    service: { name: string }
    barber: { name: string }
  }
}

const ITEMS_PER_PAGE = 10

export default function ResenasPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch('/api/reviews')
        const data = await res.json()
        setReviews(data.reviews || [])
      } catch (err) {
        console.error('Error fetching reviews:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [])

  const visibleReviews = reviews.slice(0, visibleCount)
  const hasMore = visibleCount < reviews.length

  const loadMore = () => setVisibleCount(c => c + ITEMS_PER_PAGE)

  const stats = {
    average: reviews.length > 0 
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : '0',
    total: reviews.length,
    distribution: [5, 4, 3, 2, 1].map(stars => ({
      stars,
      count: reviews.filter(r => r.rating === stars).length,
      percentage: reviews.length > 0 
        ? Math.round((reviews.filter(r => r.rating === stars).length / reviews.length) * 100)
        : 0,
    })),
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-gold' : 'text-muted/20'}>★</span>
    ))
  }

  return (
    <div className="min-h-screen bg-gradient-mesh bg-noise py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-gold/60 text-sm uppercase tracking-widest mb-3">Testimonios</p>
          <h1 className="text-4xl md:text-5xl font-display font-light text-white mb-4">
            Lo que dicen <span className="text-gold">nuestros clientes</span>
          </h1>
          <p className="text-muted/70 max-w-xl mx-auto">
            La satisfacción de nuestros clientes es nuestra mejor recomendación.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="glass p-8 border border-gold/10 rounded-lg mb-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="text-center">
                  <p className="text-6xl font-light text-gold mb-2">{stats.average}</p>
                  <div className="flex justify-center gap-1 mb-2">
                    {renderStars(Math.round(Number(stats.average)))}
                  </div>
                  <p className="text-muted/60 text-sm">{stats.total} reseñas</p>
                </div>
                
                <div className="flex-1 space-y-2">
                  {stats.distribution.map(({ stars, count, percentage }) => (
                    <div key={stars} className="flex items-center gap-3">
                      <span className="text-sm text-muted/60 w-6">{stars}★</span>
                      <div className="flex-1 h-2 bg-surface-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gold rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted/40 w-8">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div 
                    key={review.id}
                    className="glass p-6 border border-gold/10 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex gap-1 mb-1">
                          {renderStars(review.rating)}
                        </div>
                        <p className="text-white font-medium">
                          {review.client?.name || 'Cliente'}
                        </p>
                      </div>
                      <p className="text-sm text-muted/40">
                        {new Date(review.createdAt).toLocaleDateString('es-MX', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    
                    {review.comment && (
                      <p className="text-muted/70 mb-3">{review.comment}</p>
                    )}
                    
                    <div className="flex gap-4 text-sm">
                      <span className="text-gold/70">
                        ✂️ {review.appointment?.service?.name || 'Servicio'}
                      </span>
                      <span className="text-muted/50">
                        by {review.appointment?.barber?.name || 'Barbero'}
                      </span>
                    </div>
                  </div>
                ))}

                {hasMore && (
                  <button
                    onClick={loadMore}
                    className="w-full py-4 border border-gold/20 text-muted hover:text-gold hover:border-gold/40 transition-all text-sm uppercase tracking-wider mt-4"
                  >
                    Cargar más reseñas ({reviews.length - visibleCount} restantes)
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-16 glass border border-gold/10 rounded-lg">
                <p className="text-4xl mb-4">⭐</p>
                <p className="text-white font-display text-xl mb-2">
                  Aún no hay reseñas
                </p>
                <p className="text-muted/60">
                  ¡Sé el primero en dejarnos tu opinión!
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
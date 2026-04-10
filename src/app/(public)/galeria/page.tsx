'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'

type GalleryItem = {
  id: string
  imageUrl: string
  caption: string | null
  category: string
  barber: { name: string } | null
}

const CATEGORIES = ['Todos', 'FADE', 'CLASSIC', 'GRADIENT', 'BEARD', 'SHAVE']

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [filter, setFilter] = useState('Todos')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGallery() {
      try {
        const url = filter === 'Todos' 
          ? '/api/galeria' 
          : `/api/galeria?category=${filter}`
        const res = await fetch(url)
        const data = await res.json()
        setItems(data.gallery || [])
      } catch (err) {
        console.error('Error fetching gallery:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchGallery()
  }, [filter])

  const placeholderImages = [
    'https://images.unsplash.com/photo-1503951914875-452162b928f1?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1529862152464-58a2d48241a3?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400&h=400&fit=crop',
  ]

  const displayItems = items.length > 0 ? items : Array.from({ length: 8 }, (_, i) => ({
    id: `placeholder-${i}`,
    imageUrl: placeholderImages[i % placeholderImages.length],
    caption: null,
    category: CATEGORIES[(i % 4) + 1],
    barber: null,
  }))

  return (
    <div className="min-h-screen bg-gradient-mesh bg-noise py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-gold/60 text-sm uppercase tracking-widest mb-3">Portafolio</p>
          <h1 className="text-4xl md:text-5xl font-display font-light text-white mb-4">
            Nuestra <span className="text-gold">Galería</span>
          </h1>
          <p className="text-muted/70 max-w-xl mx-auto">
            Cada corte es una obra de arte. Explora nuestro trabajo y encuentra tu próximo estilo.
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayItems.map((item, index) => (
              <div
                key={item.id}
                className="group relative aspect-square overflow-hidden rounded-lg bg-surface-2 cursor-pointer animate-fade-in-scale"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="absolute inset-0">
                  <img 
                    src={item.imageUrl} 
                    alt={item.caption || item.category}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    {item.caption && (
                      <p className="text-white text-sm mb-1">{item.caption}</p>
                    )}
                    <span className="text-xs text-gold uppercase tracking-wider bg-gold/20 px-2 py-1 rounded">
                      {item.category}
                    </span>
                    {item.barber && (
                      <p className="text-xs text-muted/60 mt-1">by {item.barber.name}</p>
                    )}
                  </div>
                </div>
                
                <div className="absolute top-3 right-3 w-2 h-2 bg-gold rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <div className="glass p-6 border border-gold/10 rounded-lg inline-block">
            <p className="text-white font-display text-lg mb-2">
              ¿Quieres ver más?
            </p>
            <p className="text-muted/60 text-sm mb-4">
              Explora nuestro Instagram para más estilos
            </p>
            <a 
              href="https://instagram.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-gold hover:text-gold-light transition-colors"
            >
              @BarberStudio
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
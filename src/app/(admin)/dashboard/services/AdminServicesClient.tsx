'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Camera, Clock } from 'lucide-react'
import { useToast } from '@/components/ui/ToastContext'

type Service = {
  id: string
  name: string
  description: string | null
  price: number | string // Decimal from Prisma can come as string
  duration: number
  imageUrl: string | null
  category: string
}

export default function AdminServicesClient({ initialServices }: { initialServices: Service[] }) {
  const [services, setServices] = useState(initialServices)
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [showModal, setShowModal] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '30',
    category: 'FADE',
    imageUrl: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const url = editingService ? `/api/services/${editingService.id}` : '/api/services'
      const method = editingService ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          duration: parseInt(formData.duration)
        }),
      })

      if (!res.ok) {
        showToast('Error al guardar el servicio', 'error')
        return
      }

      const data = await res.json()
      if (editingService) {
        setServices(services.map(s => s.id === editingService.id ? data.service : s))
        showToast('Servicio actualizado', 'success')
      } else {
        setServices([data.service, ...services])
        showToast('Servicio creado con éxito', 'success')
      }
      setShowModal(false)
    } catch {
      showToast('Error de red', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este servicio del catálogo?')) return
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setServices(services.filter(s => s.id !== id))
        showToast('Servicio eliminado', 'info')
      }
    } catch {
      showToast('Error al eliminar', 'error')
    }
  }

  const openEdit = (service: Service) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price.toString(),
      duration: service.duration.toString(),
      category: service.category,
      imageUrl: service.imageUrl || '',
    })
    setShowModal(true)
  }

  return (
    <div className="min-h-screen bg-gradient-mesh bg-noise pt-12 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gold/5 pb-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-gold/60 text-xs uppercase tracking-[0.4em] mb-4">Catálogo Maestro</p>
            <h1 className="text-4xl md:text-6xl font-display text-white italic">Servicios</h1>
          </motion.div>
          
          <button 
            onClick={() => { setEditingService(null); setShowModal(true) }}
            className="flex w-full md:w-auto items-center justify-center gap-2 px-8 py-3 bg-gold text-primary font-bold text-[10px] uppercase tracking-widest shadow-glow hover:shadow-glow-lg transition-all"
          >
            <Plus size={14} />
            Nuevo Servicio
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatePresence>
            {services.map((s, idx) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass p-1 group flex flex-col md:flex-row relative border-gold/5 hover:border-gold/20 transition-all duration-700"
              >
                 {/* Left Image Area */}
                 <div className="w-full md:w-48 h-48 bg-surface-elevated overflow-hidden relative border-r border-gold/5">
                    {s.imageUrl ? (
                      <img src={s.imageUrl} alt={s.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-10">
                         <Camera size={40} className="text-gold" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                       <span className="px-3 py-1 bg-black/80 text-gold text-[8px] uppercase tracking-widest font-black border border-gold/20">
                          {s.category}
                       </span>
                    </div>
                 </div>

                 {/* Right Data Area */}
                 <div className="flex-1 p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-2xl font-display text-white group-hover:text-gold transition-colors">{s.name}</h3>
                        <p className="text-xl font-display text-gold">${Number(s.price)}</p>
                      </div>
                      <p className="text-xs text-muted/60 line-clamp-2 max-w-sm mb-6 leading-relaxed">
                        {s.description || 'Sin descripción detallada del servicio.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-gold/5 pt-4">
                       <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2 text-muted/40">
                             <Clock size={12} />
                             <span className="text-[10px] uppercase tracking-tighter">{s.duration} MIN</span>
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-3">
                           <motion.button 
                             whileHover={{ scale: 1.1, color: '#D4AF37' }}
                             onClick={() => openEdit(s)}
                             className="p-2 text-muted/20 transition-colors"
                           >
                             <Edit2 size={14} />
                           </motion.button>
                           <motion.button 
                             whileHover={{ scale: 1.1, color: '#f87171' }}
                             onClick={() => handleDelete(s.id)}
                             className="p-2 text-muted/20 transition-colors"
                           >
                             <Trash2 size={14} />
                           </motion.button>
                        </div>
                    </div>
                 </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
              onClick={() => setShowModal(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass border border-gold/10 w-full max-w-3xl overflow-hidden relative z-10"
            >
              <div className="p-12">
                <h2 className="text-5xl font-display text-white italic mb-12">Detalles del Servicio</h2>
                
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="space-y-8">
                      <div className="space-y-2">
                         <label className="text-[10px] text-gold/40 uppercase tracking-widest font-bold">Título de Exhibición</label>
                         <input 
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-transparent border-b border-gold/10 p-4 font-display text-2xl text-white outline-none focus:border-gold transition-colors" placeholder="Corte Clásico..." />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] text-gold/40 uppercase tracking-widest font-bold">Resumen del Servicio</label>
                         <textarea 
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            className="w-full bg-transparent border border-gold/10 p-4 text-sm text-muted outline-none focus:border-gold/30 h-32 resize-none" placeholder="Describe la experiencia..." />
                      </div>
                   </div>

                   <div className="space-y-8">
                      <div className="grid grid-cols-2 gap-8">
                         <div className="space-y-2">
                           <label className="text-[10px] text-gold/40 uppercase tracking-widest font-bold">Precio (USD)</label>
                           <input 
                             type="number" 
                             value={formData.price}
                             onChange={e => setFormData({...formData, price: e.target.value})}
                             className="w-full bg-transparent border-b border-gold/10 p-4 text-xl text-gold outline-none" placeholder="25.00" />
                         </div>
                         <div className="space-y-2">
                           <label className="text-[10px] text-gold/40 uppercase tracking-widest font-bold">Duración (MIN)</label>
                           <input 
                             type="number" 
                             value={formData.duration}
                             onChange={e => setFormData({...formData, duration: e.target.value})}
                             className="w-full bg-transparent border-b border-gold/10 p-4 text-xl text-white outline-none" placeholder="30" />
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] text-gold/40 uppercase tracking-widest font-bold">Categoría</label>
<select 
                             value={formData.category}
                             onChange={e => setFormData({...formData, category: e.target.value})}
                             className="w-full bg-black/40 border border-gold/10 p-4 text-xs tracking-widest text-white outline-none">
                             <option value="FADE">FADE</option>
                             <option value="CLASSIC">CLASSIC</option>
                             <option value="BEARD">BEARD</option>
                          </select>
                      </div>
                       <div className="pt-8 flex gap-4">
                          <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={loading}
                            type="submit" 
                            className="flex-1 py-5 bg-gold text-primary font-bold text-[10px] uppercase tracking-widest shadow-glow disabled:opacity-50"
                          >
                             {loading ? 'Procesando...' : 'Guardar en Catálogo'}
                          </motion.button>
                       </div>
                   </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}

      </div>
    </div>
  )
}

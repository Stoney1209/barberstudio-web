'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Mail, Phone, Calendar, Clock, Scissors } from 'lucide-react'
import { BarberAvailabilityModal } from './BarberAvailabilityModal'
import { useToast } from '@/components/ui/ToastContext'

type Barber = {
  id: string
  name: string | null
  email: string
  phone: string | null
  createdAt: Date
}

export default function AdminBarbersClient({ initialBarbers }: { initialBarbers: Barber[] }) {
  const [barbers, setBarbers] = useState(initialBarbers)
  const [showModal, setShowModal] = useState(false)
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null)
  const [availabilityBarber, setAvailabilityBarber] = useState<{id: string, name: string} | null>(null)
  
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const url = editingBarber 
        ? `/api/barbers/${editingBarber.id}`
        : '/api/barbers'
      const method = editingBarber ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const err = await res.json()
        showToast(err.error || 'Error al guardar barbero', 'error')
        return
      }

      const data = await res.json()
      
      if (editingBarber) {
        setBarbers(barbers.map(b => b.id === editingBarber.id ? { ...b, ...data.barber } : b))
        showToast('Perfil actualizado correctamente', 'success')
      } else {
        setBarbers([data.barber, ...barbers])
        showToast('Barbero registrado con éxito', 'success')
      }

      setShowModal(false)
      setEditingBarber(null)
      setFormData({ name: '', email: '', phone: '' })
    } catch {
      showToast('Error de conexión', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este barbero?')) return

    try {
      const res = await fetch(`/api/barbers/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        showToast(err.error || 'Error al eliminar', 'error')
        return
      }
      setBarbers(barbers.filter(b => b.id !== id))
      showToast('Barbero eliminado del sistema', 'info')
    } catch {
      showToast('Error al procesar la solicitud', 'error')
    }
  }

  const openEdit = (barber: Barber) => {
    setEditingBarber(barber)
    setFormData({
      name: barber.name || '',
      email: barber.email,
      phone: barber.phone || '',
    })
    setShowModal(true)
  }

  return (
    <div className="min-h-screen bg-gradient-mesh bg-noise pt-12 pb-24 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        
        <header className="mb-16 flex items-end justify-between border-b border-gold/5 pb-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="text-gold/60 text-xs uppercase tracking-[0.4em] mb-4">Gestión de Personal</p>
            <h1 className="text-6xl font-display text-white italic">Barberos</h1>
          </motion.div>
          
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-[10px] text-muted/40 uppercase tracking-widest hover:text-gold transition-colors">
              Panel / Barberos
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {barbers.map((b, idx) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                className="glass p-8 border-gold/10 hover:border-gold/40 group relative overflow-hidden transition-all duration-500"
              >
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-gold/5 rounded-full blur-2xl group-hover:bg-gold/10 transition-colors" />
                
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold font-display text-2xl mb-6 shadow-glow-sm">
                    {b.name?.charAt(0) || 'B'}
                  </div>

                  <h3 className="text-2xl font-display text-white mb-2 group-hover:text-gold transition-colors">{b.name || 'Sin nombre'}</h3>
                  
                  <div className="space-y-2 mb-8">
                    <div className="flex items-center gap-2 text-xs text-muted/60">
                      <Mail size={12} className="text-gold/40" />
                      <span>{b.email}</span>
                    </div>
                    {b.phone && (
                      <div className="flex items-center gap-2 text-xs text-muted/60">
                        <Phone size={12} className="text-gold/40" />
                        <span>{b.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 pt-6 border-t border-gold/5 flex-wrap">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openEdit(b)}
                      className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gold hover:opacity-80 transition-all font-bold p-2"
                    >
                      <Edit2 size={10} />
                      Editar
                    </motion.button>
                    
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setAvailabilityBarber({ id: b.id, name: b.name || '' })}
                      className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-all font-bold p-2"
                    >
                      <Clock size={10} className="text-gold/40" />
                      Horarios
                    </motion.button>

                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(b.id)}
                      className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted/20 hover:text-red-400 transition-all p-2 ml-auto"
                    >
                      <Trash2 size={10} />
                      Borrar
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}

            <motion.button 
              key="add-new"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setEditingBarber(null); setFormData({ name: '', email: '', phone: '' }); setShowModal(true) }}
              className="glass p-8 border-dashed border-gold/20 hover:border-gold/50 flex flex-col items-center justify-center gap-4 group transition-all"
            >
              <div className="w-12 h-12 rounded-full border border-gold/10 flex items-center justify-center text-gold/40 group-hover:bg-gold/10 group-hover:text-gold transition-all">
                <Plus size={24} />
              </div>
              <p className="text-[10px] uppercase tracking-widest text-gold/60 group-hover:text-gold font-bold">Añadir Barbero</p>
            </motion.button>
          </AnimatePresence>
        </div>

        {barbers.length === 0 && (
          <div className="p-32 text-center opacity-40">
            <Scissors size={48} className="mx-auto mb-6 text-gold" />
            <p className="font-display text-2xl text-white">No hay barberos asignados</p>
          </div>
        )}

        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
                onClick={() => { setShowModal(false); setEditingBarber(null) }}
              />
              
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 40 }}
                className="glass border border-gold/20 w-full max-w-lg p-12 relative z-10 shadow-3xl"
              >
                <div className="absolute top-0 right-0 p-8">
                   <button onClick={() => setShowModal(false)} className="text-muted hover:text-gold transition-colors font-light text-2xl">×</button>
                </div>

                <h2 className="text-4xl font-display text-white mb-2 italic">
                  {editingBarber ? 'Redefinir Perfil' : 'Nuevo Integrante'}
                </h2>
                <p className="text-[10px] text-gold/40 uppercase tracking-[0.3em] mb-12">Detalles del Operador</p>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-2">
                    <label htmlFor="barber-name" className="block text-[10px] text-gold/60 uppercase tracking-widest font-bold">Nombre Completo</label>
                    <input
                      id="barber-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-transparent border-b border-gold/10 p-4 text-white outline-none focus:border-gold transition-colors font-display text-xl"
                      required
                      placeholder="..."
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label htmlFor="barber-email" className="block text-[10px] text-gold/60 uppercase tracking-widest font-bold">Correo</label>
                      <input
                        id="barber-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-transparent border-b border-gold/10 p-4 text-white outline-none focus:border-gold transition-colors text-sm"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="barber-phone" className="block text-[10px] text-gold/60 uppercase tracking-widest font-bold">Teléfono</label>
                      <input
                        id="barber-phone"
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-transparent border-b border-gold/10 p-4 text-white outline-none focus:border-gold transition-colors text-sm"
                      />
                    </div>
                  </div>

                  <div className="pt-8 flex gap-4">
                    <motion.button
                      whileHover={{ x: -2 }}
                      type="button"
                      onClick={() => { setShowModal(false); setEditingBarber(null) }}
                      className="flex-1 py-4 border border-gold/10 text-muted/40 uppercase tracking-widest text-[10px] hover:bg-gold/5 hover:text-white transition-all"
                    >
                      Cancelar
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02, x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-4 bg-gold text-primary font-bold uppercase tracking-widest text-[10px] shadow-glow hover:shadow-glow-lg transition-all disabled:opacity-50"
                    >
                      {loading ? 'Procesando...' : editingBarber ? 'Confirmar Cambios' : 'Registrar Perfil'}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}

          {availabilityBarber && (
            <BarberAvailabilityModal 
               barberId={availabilityBarber.id}
               barberName={availabilityBarber.name}
               onClose={() => setAvailabilityBarber(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

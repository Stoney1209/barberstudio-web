'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle2
} from 'lucide-react'

type RecentAppointment = {
  id: string
  date: string
  startTime: string
  status: string
  client?: string
  barber?: string
  service?: string
}

type StatsData = {
  appointments: {
    total: number
    thisWeek: number
    thisMonth: number
    byStatus: Record<string, number>
  }
  revenue: {
    total: number
    thisWeek: number
  }
  users: {
    clients: number
    barbers: number
  }
  services: number
  topServices: { serviceId: string; serviceName: string; count: number }[]
  recentAppointments: RecentAppointment[]
}

type Barber = {
  id: string
  name: string
  email?: string
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'activity'>('overview')

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, barberRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/barbers')
        ])
        const statsData = await statsRes.json()
        const barberData = await barberRes.json()
        
        setStats(statsData)
        setBarbers(barberData.barbers ?? [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-gold/10 border-t-gold rounded-full animate-spin shadow-glow" />
      </div>
    )
  }

  const pending = stats.appointments.byStatus?.PENDING ?? 0
  const completed = stats.appointments.byStatus?.COMPLETED ?? 0
  const weeklyRevenue = stats.revenue.thisWeek
  const totalRevenue = stats.revenue.total

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } },
  }

  return (
    <div className="min-h-screen bg-gradient-mesh bg-noise pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Section */}
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <p className="text-gold/60 text-xs uppercase tracking-[0.4em] mb-4 font-medium opacity-80">Panorama Ejecutivo</p>
            <h1 className="text-5xl md:text-7xl font-display text-white tracking-tight">
              Estado del <span className="text-gold italic">Estudio</span>
            </h1>
          </motion.div>

          <div className="flex gap-1 p-1 glass border border-gold/10 rounded-sm">
             <button 
               onClick={() => setActiveTab('overview')}
               className={`px-6 py-2 text-xs uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-gold text-primary font-bold' : 'text-muted/60 hover:text-white'}`}
             >
               Resumen
             </button>
             <button 
               onClick={() => setActiveTab('activity')}
               className={`px-6 py-2 text-xs uppercase tracking-widest transition-all ${activeTab === 'activity' ? 'bg-gold text-primary font-bold' : 'text-muted/60 hover:text-white'}`}
             >
               Actividad
             </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' ? (
            <motion.div 
              key="overview"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {/* Main Revenue Card */}
              <motion.div 
                variants={itemVariants}
                className="md:col-span-2 glass p-10 relative overflow-hidden group shadow-glow-sm"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                   <TrendingUp size={160} className="text-gold" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-8">
                     <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                        <DollarSign size={14} className="text-gold" />
                     </div>
                     <span className="text-xs text-muted/60 uppercase tracking-widest">Ingresos Semanal</span>
                  </div>
                  
                  <div className="flex items-baseline gap-4">
                    <h2 className="text-8xl font-display text-white">${weeklyRevenue}</h2>
                  </div>
                  
                  <p className="text-sm text-muted/40 mt-6 max-w-sm">
                    Ingresos totales acumulados: <span className="text-gold font-medium">${totalRevenue}</span>
                  </p>
                </div>
              </motion.div>

              {/* Status Counters */}
              <div className="flex flex-col gap-8">
                <motion.div variants={itemVariants} className="glass p-8 border-gold/10 hover:border-gold/30 transition-all group">
                   <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted/60 uppercase tracking-widest">Pendientes</span>
                      <Clock size={16} className="text-yellow-500/60" />
                   </div>
                   <p className="text-5xl font-display text-white group-hover:text-gold transition-colors">{pending}</p>
                   <div className="h-1 w-full bg-white/5 mt-6 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: stats.appointments.total > 0 ? `${Math.round((pending / stats.appointments.total) * 100)}%` : '0%' }} 
                        className="h-full bg-gold" 
                      />
                   </div>
                </motion.div>

                <motion.div variants={itemVariants} className="glass p-8 border-gold/10 hover:border-gold/30 transition-all group">
                   <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted/60 uppercase tracking-widest">Completadas</span>
                      <CheckCircle2 size={16} className="text-green-500/60" />
                   </div>
                   <p className="text-5xl font-display text-white group-hover:text-gold transition-colors">{completed}</p>
                   <p className="text-[10px] text-muted/40 mt-4 uppercase">Esta semana: {stats.appointments.thisWeek}</p>
                </motion.div>
              </div>

              {/* Bottom Grid */}
              <motion.div variants={itemVariants} className="glass p-8 border-gold/5 bg-surface-2/40">
                  <h3 className="text-sm font-display text-gold mb-6 uppercase tracking-widest italic">Barberos Activos</h3>
                  <div className="space-y-4">
                    {barbers.slice(0, 3).map(b => (
                      <div key={b.id} className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-[10px] text-gold border border-gold/20 font-bold">
                              {b.name.charAt(0)}
                           </div>
                           <span className="text-sm text-white/80 group-hover:text-gold transition-colors">{b.name}</span>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-green-500/50" />
                      </div>
                    ))}
                  </div>
              </motion.div>

              <motion.div variants={itemVariants} className="glass p-8 border-gold/5 bg-surface-2/40 md:col-span-2">
                  <h3 className="text-sm font-display text-gold mb-6 uppercase tracking-widest italic">Servicios Más Populares</h3>
                  <div className="space-y-3">
                    {stats.topServices.map((s, idx) => (
                      <div key={s.serviceId} className="flex items-center justify-between py-2 border-b border-gold/5 last:border-0">
                        <div className="flex items-center gap-3">
                          <span className="text-gold/40 text-xs font-mono w-6">#{idx + 1}</span>
                          <span className="text-sm text-white/80">{s.serviceName}</span>
                        </div>
                        <span className="text-xs text-muted/60">{s.count} citas</span>
                      </div>
                    ))}
                    {stats.topServices.length === 0 && (
                      <p className="text-sm text-muted/40">Aún no hay datos suficientes</p>
                    )}
                  </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div 
               key="activity"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="glass p-10 border-gold/5"
            >
               <h2 className="text-3xl font-display text-white mb-8">Actividad Reciente</h2>
               <div className="space-y-6">
                  {stats.recentAppointments.map((apt, idx) => (
                    <motion.div 
                      key={apt.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center justify-between py-4 border-b border-gold/5 hover:bg-white/[0.02] px-4 -mx-4 rounded-sm transition-colors"
                    >
                       <div className="flex items-center gap-4">
                          <div className="text-xs text-muted/40 font-mono">{apt.startTime}</div>
                          <div className="h-8 w-px bg-gold/10" />
                          <div>
                            <p className="text-sm text-white font-medium">{apt.client || 'Cliente Externo'}</p>
                            <p className="text-[10px] text-muted/60 uppercase">{apt.service}</p>
                          </div>
                       </div>
                       <div className={`text-[10px] px-3 py-1 rounded-full uppercase tracking-widest font-bold ${
                         apt.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400' :
                         apt.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400' :
                         'bg-gold/10 text-gold'
                       }`}>
                          {apt.status}
                       </div>
                    </motion.div>
                  ))}
               </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}

export default AdminDashboard

"use client"
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, ArrowRight, Scissors, User } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<'login' | 'register'>('login')
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    
    try {
      if (view === 'register') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            }
          }
        })
        if (error) throw error
        setError('Revisa tu correo para confirmar tu registro.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error

        try {
          const res = await fetch('/api/auth/me')
          if (res.ok) {
            const data = await res.json()
            if (data?.user?.role === 'ADMIN') {
              router.push('/dashboard')
              router.refresh()
              return
            }
          }
        } catch (e) {
          // Ignorar error y mandar a inicio
        }

        router.push('/')
        router.refresh()
      }
    } catch (error: any) {
      setError(error.message || 'Ocurrió un error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black bg-noise p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gold/3 rounded-full blur-2xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <Link href="/" className="inline-block group">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-14 h-14 border border-gold/20 rounded-full flex items-center justify-center">
                <Scissors className="text-gold" size={24} />
              </div>
            </div>
            <span className="font-display text-4xl text-white tracking-tighter">
              Barber<span className="text-gold group-hover:text-white transition-colors">Studio</span>
            </span>
          </Link>
          <motion.p 
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-muted/60 mt-4 text-lg font-display italic"
          >
            {view === 'login' ? 'Bienvenido de nuevo' : 'Únete a la experiencia'}
          </motion.p>
        </div>

        <div className="glass border border-gold/10 p-8">
          <form className="space-y-5" onSubmit={handleAuth}>
            <AnimatePresence mode="wait">
              {view === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-xs text-muted/60 uppercase tracking-widest mb-2">Nombre completo</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/40" />
                    <input
                      type="text"
                      required={view === 'register'}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-black/40 border border-gold/10 p-4 pl-12 text-white placeholder-muted/40 outline-none focus:border-gold/40 transition-all"
                      placeholder="Tu nombre"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs text-muted/60 uppercase tracking-widest mb-2">Correo</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-gold/10 p-4 pl-12 text-white placeholder-muted/40 outline-none focus:border-gold/40 transition-all"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-muted/60 uppercase tracking-widest mb-2">Contraseña</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/40" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-gold/10 p-4 pl-12 text-white placeholder-muted/40 outline-none focus:border-gold/40 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`text-sm text-center py-2 ${
                    error.includes('Revisa') ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gold text-primary text-sm uppercase tracking-[0.3em] font-bold flex items-center justify-center gap-2 hover:bg-gold-light transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              ) : (
                <>
                  {view === 'login' ? 'Entrar' : 'Registrarse'}
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setView(view === 'login' ? 'register' : 'login')
                setError(null)
              }}
              className="text-muted/50 hover:text-gold text-sm transition-colors"
            >
              {view === 'login' 
                ? '¿No tienes cuenta? ' 
                : '¿Ya tienes cuenta? '}
              <span className="text-gold">{view === 'login' ? 'Regístrate' : 'Inicia sesión'}</span>
            </button>
          </div>
        </div>

        <p className="text-center text-muted/30 text-xs mt-8">
          © 2024 BarberStudio • El arte de la barbería
        </p>
      </motion.div>
    </div>
  )
}
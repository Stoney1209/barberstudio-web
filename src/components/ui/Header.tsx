"use client";
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { SignOutButton } from '@/components/ui/SignOutButton'
import type { Session } from '@supabase/supabase-js'

export const ClerkHeader: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [loadingUsr, setLoadingUsr] = useState(true)
  const pathname = usePathname()

  const isAdminPath = pathname.startsWith('/dashboard') || pathname.startsWith('/admin')

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoadingUsr(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (isAdminPath) return null

  const isLoaded = !loadingUsr
  const isSignedIn = !!session

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-black/80 backdrop-blur-lg border-b border-gold/5 py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="group">
          <span className="font-display text-2xl md:text-3xl text-white tracking-tighter">
            Barber<span className="text-gold group-hover:text-white transition-colors">Studio</span>
          </span>
          <div className={`h-px bg-gold transition-all duration-500 ${scrolled ? 'w-0' : 'w-full opacity-20'}`} />
        </Link>

        <nav className="hidden md:flex items-center gap-12 text-white">
          <Link href="/servicios" className="text-[10px] text-white/40 hover:text-gold uppercase tracking-[0.3em] font-bold transition-all">
            Servicios
          </Link>
          <Link href="/galeria" className="text-[10px] text-white/40 hover:text-gold uppercase tracking-[0.3em] font-bold transition-all">
            Galeria
          </Link>
          <Link href="/resenas" className="text-[10px] text-white/40 hover:text-gold uppercase tracking-[0.3em] font-bold transition-all">
            Resenas
          </Link>
          {isLoaded && isSignedIn && (
            <Link href="/mis-reservas" className="text-[10px] text-gold hover:text-white uppercase tracking-[0.3em] font-bold transition-all">
              Mis Citas
            </Link>
          )}
          <Link
            href="/reservar"
            className="px-8 py-3 bg-gold text-primary font-bold text-[10px] uppercase tracking-widest shadow-glow hover:shadow-glow-lg transition-all"
          >
            Reservar
          </Link>

          <div className="flex items-center gap-6 border-l border-white/10 pl-8 ml-4">
            {isLoaded && !isSignedIn && (
              <Link href="/login" className="text-[10px] text-white/40 hover:text-gold uppercase tracking-[0.3em] font-bold">
                Login
              </Link>
            )}
            {isLoaded && isSignedIn && (
              <SignOutButton />
            )}
          </div>
        </nav>

        <button
          className="md:hidden text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? 'CLOSE' : 'MENU'}
        </button>
      </div>

      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden glass absolute top-full left-0 right-0 p-8 border-b border-gold/10 flex flex-col gap-6"
        >
          <Link href="/servicios" className="text-sm uppercase tracking-widest text-white">Servicios</Link>
          <Link href="/galeria" className="text-sm uppercase tracking-widest text-white">Galeria</Link>
          <Link href="/resenas" className="text-sm uppercase tracking-widest text-white">Resenas</Link>
          {isLoaded && !isSignedIn && (
            <Link href="/login" className="text-sm uppercase tracking-widest text-gold">Iniciar Sesion</Link>
          )}
          {isLoaded && isSignedIn && (
            <Link href="/mis-reservas" className="text-sm uppercase tracking-widest text-gold">Mis Citas</Link>
          )}
          <Link href="/reservar" className="btn-gold py-4 text-center">Reservar Cita</Link>

          {isLoaded && isSignedIn && (
            <div className="pt-4 border-t border-white/5">
              <SignOutButton className="text-sm uppercase tracking-widest text-white/40" />
            </div>
          )}
        </motion.div>
      )}
    </motion.header>
  )
}

export default ClerkHeader

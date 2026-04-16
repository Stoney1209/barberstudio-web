'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Scissors, Star, ArrowRight, Quote } from 'lucide-react'

type Review = {
  comment?: string | null
  client?: { name?: string | null } | null
}

type Props = {
  initialServices?: unknown[]
  initialReviews: Review[]
}

export const LandingContent: React.FC<Props> = ({ initialReviews }) => {
  return (
    <div className="min-h-screen bg-black overflow-hidden">
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <motion.img
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.5 }}
            transition={{ duration: 2.5, ease: 'easeOut' }}
            src="/images/hero.png"
            className="w-full h-full object-cover grayscale-[20%] brightness-[0.4]"
            alt="BarberStudio Hero"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <p className="text-gold/60 text-xs uppercase tracking-[0.6em] mb-8 font-medium">Desde 2024 · El Arte de la Barberia</p>
            <h1 className="text-[12vw] md:text-[8rem] font-display font-light text-white leading-none tracking-tight mb-8">
              Barber<span className="text-gold-gradient italic">Studio</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 1.2 }}
            className="flex flex-col items-center"
          >
            <p className="text-lg md:text-2xl text-muted/80 max-w-2xl font-light mb-12 tracking-wide leading-relaxed">
              Redefiniendo el estandar del cuidado masculino a traves de la
              <span className="text-gold font-display italic mx-2 text-3xl">maestria</span>
              y el detalle arquitectonico.
            </p>

            <div className="flex flex-col sm:flex-row gap-8 items-center">
              <Link
                href="/reservar"
                className="btn-gold px-12 py-5 rounded-sm text-sm uppercase tracking-widest shadow-glow group"
              >
                <div className="flex items-center gap-2">
                  <span>Reservar Experiencia</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
              <Link
                href="/servicios"
                className="text-white/60 hover:text-gold transition-all text-xs uppercase tracking-[0.3em] font-bold py-2 border-b border-white/10 hover:border-gold"
              >
                Explorar Catalogo
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-10 hidden lg:flex items-center gap-4 text-white/20"
        >
          <div className="w-10 h-px bg-white/20" />
          <span className="text-[10px] uppercase tracking-widest">Desplaza para descubrir</span>
        </motion.div>
      </section>

      <section className="py-16 border-y border-gold/5 bg-surface/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <motion.div whileHover={{ y: -5 }} className="flex flex-col gap-3 group">
              <p className="text-[10px] text-gold/60 uppercase tracking-widest font-black">Ubicacion</p>
              <div className="h-px w-8 bg-gold/20 group-hover:w-12 transition-all" />
              <p className="text-lg font-display text-white italic">Av. Principal 123, Centro Historico</p>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="flex flex-col gap-3 group">
              <p className="text-[10px] text-gold/60 uppercase tracking-widest font-black">Horario de Atencion</p>
              <div className="h-px w-8 bg-gold/20 group-hover:w-12 transition-all" />
              <p className="text-lg font-display text-white italic">Lunes a Sabado · 09:00 - 20:00</p>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="flex flex-col gap-3 group">
              <p className="text-[10px] text-gold/60 uppercase tracking-widest font-black">Reservas Directas</p>
              <div className="h-px w-8 bg-gold/20 group-hover:w-12 transition-all" />
              <p className="text-lg font-display text-white italic">+52 (55) 1234-5678</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-32 px-6 bg-black relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] bg-surface-elevated overflow-hidden border border-gold/10">
              <img src="/images/service-fade.png" className="w-full h-full object-cover grayscale opacity-80" alt="The Craft" />
            </div>
            <div className="absolute -bottom-12 -right-12 glass p-12 border border-gold/20 hidden md:block">
              <h3 className="text-4xl font-display text-gold italic">01. El Oficio</h3>
              <p className="text-xs text-muted/60 uppercase tracking-widest mt-2">La precision como dogma</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <p className="text-xs text-gold/40 uppercase tracking-[0.4em]">Nuestra Filosofia</p>
            <h2 className="text-6xl md:text-8xl font-display text-white leading-none">
              Donde la <br />
              <span className="italic text-gold">tradicion</span> se <br />
              vuelve eterna.
            </h2>
            <div className="h-px w-32 bg-gold/20" />
            <p className="text-lg text-muted/60 font-light leading-relaxed max-w-lg">
              No somos solo una barberia; somos un santuario para el caballero moderno.
              En BarberStudio, cada corte es una declaracion de intenciones,
              un ritual perfeccionado a traves de decadas de tecnica europea.
            </p>
            <button className="text-gold text-xs uppercase tracking-[0.3em] font-black underline underline-offset-8 decoration-gold/20 hover:decoration-gold transition-all">
              Nuestra Historia
            </button>
          </motion.div>
        </div>
      </section>

      <section className="py-32 px-6 bg-surface/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <header className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
            <div>
              <p className="text-gold/40 text-[10px] uppercase tracking-[0.5em] mb-4">Experiencias Firmadas</p>
              <h2 className="text-6xl font-display text-white">Servicios <span className="italic text-gold">Selectos</span></h2>
            </div>
            <Link href="/servicios" className="group flex items-center gap-4 text-xs text-muted/40 uppercase tracking-widest hover:text-gold transition-all">
              Explorar todo el menu
              <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { name: 'Corte Modern Fade', img: '/images/service-fade.png', price: '35', cat: 'FADE' },
              { name: 'Ritual de Barba', img: '/images/service-beard.png', price: '25', cat: 'BEARD' },
              { name: 'Tratamiento Facial', img: '/images/service-spa.png', price: '45', cat: 'SPA' },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="aspect-[4/5] bg-surface mb-6 overflow-hidden relative border border-gold/5 group-hover:border-gold/30 transition-all duration-700">
                  <img src={s.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" alt={s.name} />
                  <div className="absolute top-6 left-6">
                    <span className="px-3 py-1 bg-black/90 text-gold text-[8px] uppercase tracking-widest font-black border border-gold/20">
                      {s.cat}
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-8 glass bg-black/80 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <button className="w-full py-4 border border-gold/40 text-gold text-[10px] uppercase tracking-[0.4em] font-bold">Reservar Ahora</button>
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-xl font-display text-white group-hover:text-gold transition-colors">{s.name}</h3>
                    <p className="text-[10px] text-muted/40 uppercase tracking-widest mt-1">Sesion Master</p>
                  </div>
                  <span className="text-2xl font-display text-gold">${s.price}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 px-6 border-t border-gold/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-4 sticky top-32">
              <p className="text-gold/40 text-[10px] uppercase tracking-[0.5em] mb-4">Voces del Club</p>
              <h2 className="text-7xl font-display text-white leading-none">Lo que <br /><span className="italic text-gold">ellos</span> dicen.</h2>
              <p className="text-sm text-muted/40 mt-12 max-w-xs leading-relaxed">
                Nuestra reputacion esta construida sobre cada detalle.
                Mas que testimonios, son cronicas de transformacion.
              </p>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {initialReviews.length > 0 ? initialReviews.map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="glass p-12 border-gold/5 hover:border-gold/20 transition-all group"
                >
                  <Quote className="text-gold/10 mb-8 transition-colors group-hover:text-gold/20" size={40} />
                  <p className="text-lg text-white/80 font-light italic mb-12 relative leading-relaxed">
                    "{r.comment || 'Una experiencia sin igual. El nivel de detalle es superior a cualquier otra barberia.'}"
                  </p>
                  <div className="flex items-center gap-4 border-t border-gold/5 pt-8">
                    <div className="w-10 h-10 rounded-full border border-gold/20 flex items-center justify-center text-gold font-display text-xl">
                      {(r.client?.name || 'C')[0]}
                    </div>
                    <div>
                      <p className="text-xs text-white uppercase tracking-widest font-bold">{r.client?.name || 'Cliente Honorario'}</p>
                      <div className="flex gap-0.5 mt-1">
                        {[...Array(5)].map((_, i2) => (
                          <Star key={i2} size={8} className="fill-gold text-gold" />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <p className="text-muted/40 italic">Iniciando transmisiones del club...</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-48 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh opacity-20" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative z-10"
        >
          <h2 className="text-[12vw] md:text-[8vw] font-display text-white/10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 uppercase tracking-[0.2em] font-black pointer-events-none select-none">
            DISTRITO
          </h2>
          <h3 className="text-5xl md:text-8xl font-display text-white mb-12">
            Tu decides el <br />
            <span className="italic text-gold">legado.</span>
          </h3>
          <Link
            href="/reservar"
            className="btn-gold px-16 py-6 rounded-sm text-sm uppercase tracking-[0.4em] font-black shadow-glow-lg group"
          >
            <div className="flex items-center gap-4">
              <span>Reclamar tu lugar</span>
              <Scissors size={18} className="group-hover:rotate-45 transition-transform" />
            </div>
          </Link>
        </motion.div>
      </section>

      <footer className="py-24 px-6 border-t border-gold/5 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <h2 className="text-3xl font-display text-white tracking-tighter">Barber<span className="text-gold">Studio</span></h2>
          <div className="flex gap-12">
            {['Instagram', 'WhatsApp', 'Ubicacion'].map((link) => (
              <a key={link} className="text-[10px] text-muted/40 uppercase tracking-widest hover:text-gold transition-colors">{link}</a>
            ))}
          </div>
          <p className="text-[10px] text-muted/20 uppercase tracking-widest italic">© 2024 · Excellence in Craft</p>
        </div>
      </footer>
    </div>
  )
}

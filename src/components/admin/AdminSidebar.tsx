"use client";
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { motion } from 'framer-motion'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/citas', label: 'Citas', icon: '📅' },
  { href: '/dashboard/barbers', label: 'Barberos', icon: '✂️' },
  { href: '/dashboard/services', label: 'Servicios', icon: '💇' },
  { href: '/dashboard/clients', label: 'Clientes', icon: '👥' },
]

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 glass p-3 rounded-full border border-gold/20 shadow-glow-sm"
        aria-label="Toggle menu"
      >
        <span className="text-white text-xl">☰</span>
      </button>

      <aside className={`fixed top-0 left-0 h-full w-72 glass border-r border-gold/10 transform transition-all duration-500 ease-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} z-40 flex flex-col shadow-2xl overflow-hidden`}>
        {/* Subtle animated grain overlay */}
        <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />
        
        <div className="p-8 border-b border-gold/5 relative">
          <Link href="/" className="group">
            <h1 className="text-2xl font-display text-white tracking-tight group-hover:text-gold transition-colors duration-500">
              Barber<span className="text-gold">Studio</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-px w-4 bg-gold/40" />
              <p className="text-[10px] text-gold/60 uppercase tracking-[0.2em] font-light">Royal Command</p>
            </div>
          </Link>
        </div>

        <nav className="p-6 space-y-2 flex-1 overflow-y-auto relative custom-scrollbar">
          {navItems.map((item, idx) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="relative block group"
              >
                <motion.div
                  initial={false}
                  animate={isActive ? { x: 4 } : { x: 0 }}
                  className={`flex items-center gap-4 px-5 py-4 rounded-sm transition-all duration-300 relative z-10 ${
                    isActive
                      ? 'text-gold'
                      : 'text-muted/60 hover:text-white'
                  }`}
                >
                  <span className={`text-xl transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {item.icon}
                  </span>
                  <span className={`text-sm tracking-wide font-medium transition-all ${isActive ? 'translate-x-1' : ''}`}>
                    {item.label}
                  </span>
                  
                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-active"
                      className="absolute inset-0 bg-gold/5 border-l-2 border-gold shadow-[inset_10px_0_20px_-10px_rgba(201,168,76,0.1)] rounded-r-sm"
                    />
                  )}
                </motion.div>
              </Link>
            )
          })}
          
          <div className="pt-8 border-t border-gold/5 mt-8">
             <Link 
               href="/" 
               className="flex items-center gap-4 px-5 py-3 text-muted/40 hover:text-gold transition-all text-sm group"
             >
               <span className="group-hover:-translate-x-1 transition-transform">🏠</span>
               <span className="font-light tracking-widest uppercase text-[10px]">Página de Inicio</span>
             </Link>
          </div>
        </nav>

        <div className="p-6 border-t border-gold/5 bg-black/40 relative">
          <div className="flex items-center gap-4 p-3 rounded-lg border border-gold/5 glass-hover">
             <UserButton 
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-10 h-10 border border-gold/20"
                  }
                }}
             />
             <div className="flex flex-col min-w-0">
               <span className="text-xs text-white font-medium truncate">Administrador</span>
               <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[9px] text-gold/50 uppercase tracking-widest">Online</span>
               </div>
             </div>
          </div>
        </div>
      </aside>

      {/* Deep overlay for mobile */}
      {sidebarOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  )
}

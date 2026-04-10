"use client"
import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh() // Refreshes server components to apply layout changes
    router.push('/')
  }

  return (
    <button 
      onClick={handleSignOut}
      disabled={loading}
      className={className || "text-[10px] text-white/40 hover:text-gold uppercase tracking-[0.3em] font-bold"}
    >
      {loading ? 'Saliendo...' : 'Cerrar Sesión'}
    </button>
  )
}

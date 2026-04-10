'use client'

import React from 'react'
import { Printer } from 'lucide-react'

export const PrintButton = () => {
  return (
    <button 
      onClick={() => window.print()}
      className="flex items-center gap-2 text-[10px] text-muted/40 hover:text-gold uppercase tracking-[0.4em] font-black transition-all"
    >
      <Printer size={14} />
      Imprimir Ticket
    </button>
  )
}

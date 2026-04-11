"use client"
import React from 'react'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4 border',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  }
  
  return (
    <div 
      className={`
        ${sizes[size]} 
        border-gold/10 border-t-gold rounded-full animate-spin 
        ${className}
      `}
    />
  )
}

export const LoadingOverlay: React.FC<{ message?: string }> = ({ message = 'Cargando...' }) => (
  <div className="flex flex-col items-center justify-center py-12 gap-4">
    <Spinner size="lg" />
    <p className="text-muted/60 text-sm uppercase tracking-widest">{message}</p>
  </div>
)

export default Spinner
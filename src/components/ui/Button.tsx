"use client"
import React from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

type Props = {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string
  fullWidth?: boolean
}

export const Button: React.FC<Props> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  fullWidth = false
}) => {
  const base = 'inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-gold text-primary hover:bg-gold-light',
    secondary: 'bg-surface-2 text-white border border-gold/20 hover:border-gold/40',
    tertiary: 'text-white border border-gold/20 hover:bg-gold/5',
    ghost: 'text-muted hover:text-white hover:bg-white/5',
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-xs uppercase tracking-wider',
    md: 'px-5 py-2.5 text-sm uppercase tracking-wider',
    lg: 'px-8 py-4 text-base uppercase tracking-widest',
  }

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${base} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${fullWidth ? 'w-full' : ''} 
        ${className}
      `}
    >
      {loading && <Loader2 size={16} className="animate-spin mr-2" />}
      {children}
    </motion.button>
  )
}

export default Button
"use client"
import React, { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  helperText?: string
  variant?: 'default' | 'gold'
}

export const Input = forwardRef<HTMLInputElement, Props>(({
  label,
  error,
  helperText,
  variant = 'default',
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
  
  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-xs text-muted/60 uppercase tracking-widest mb-2"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          className={`
            w-full bg-black/40 border p-4 text-white outline-none transition-all
            placeholder:text-muted/40
            ${error 
              ? 'border-red-500 focus:border-red-400' 
              : variant === 'gold'
                ? 'border-gold/20 focus:border-gold/50'
                : 'border-gold/10 focus:border-gold/30'
            }
            ${className}
          `}
          {...props}
        />
      </div>
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1 mt-1.5"
        >
          <AlertCircle size={12} className="text-red-500" />
          <p id={`${inputId}-error`} className="text-xs text-red-500">
            {error}
          </p>
        </motion.div>
      )}
      
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="text-xs text-muted/50 mt-1.5">
          {helperText}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
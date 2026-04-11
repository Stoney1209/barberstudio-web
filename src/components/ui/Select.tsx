"use client"
import React, { forwardRef } from 'react'
import { AlertCircle, ChevronDown } from 'lucide-react'

type Option = {
  value: string
  label: string
}

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  error?: string
  helperText?: string
  options: Option[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, Props>(({
  label,
  error,
  helperText,
  options,
  placeholder = 'Seleccionar...',
  className = '',
  id,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`
  
  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={selectId} 
          className="block text-xs text-muted/60 uppercase tracking-widest mb-2"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
          className={`
            w-full bg-black/40 border p-4 text-white outline-none transition-all appearance-none
            ${error 
              ? 'border-red-500 focus:border-red-400' 
              : 'border-gold/10 focus:border-gold/30'
            }
            ${className}
          `}
          {...props}
        >
          <option value="" disabled className="bg-surface-2">
            {placeholder}
          </option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value} className="bg-surface-2">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown 
          size={16} 
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted/40 pointer-events-none" 
        />
      </div>
      
      {error && (
        <div className="flex items-center gap-1 mt-1.5">
          <AlertCircle size={12} className="text-red-500" />
          <p id={`${selectId}-error`} className="text-xs text-red-500">
            {error}
          </p>
        </div>
      )}
      
      {helperText && !error && (
        <p id={`${selectId}-helper`} className="text-xs text-muted/50 mt-1.5">
          {helperText}
        </p>
      )}
    </div>
  )
})

Select.displayName = 'Select'

export default Select
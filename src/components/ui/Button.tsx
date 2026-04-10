"use client"
import React from 'react'

type Props = {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'tertiary'
  ariaLabel?: string
  disabled?: boolean
}

export const Button: React.FC<Props> = ({ children, onClick, variant = 'primary', ariaLabel, disabled }) => {
  const base = 'px-4 py-2 rounded-md focus:outline-none transition-colors duration-300'
  const styles = {
    primary: 'bg-gold text-black hover:bg-gold/80',
    secondary: 'bg-surface-2 text-smoke hover:bg-surface-container-high',
    tertiary: 'text-smoke border border-smoke/30 hover:border-gold',
  } as const
  const disabledStyles = 'opacity-50 cursor-not-allowed pointer-events-none'
  return (
    <button aria-label={ariaLabel} onClick={onClick} disabled={disabled} className={`${base} ${styles[variant]} ${disabled ? disabledStyles : ''}`}>
      {children}
    </button>
  )
}

export default Button

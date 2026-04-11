import React from 'react';
import ClerkHeader from '@/components/ui/Header'
import LayoutWrapper from '@/components/ui/LayoutWrapper'
import '@/styles/globals.css';
import { Metadata } from 'next'
import { ToastProvider } from '@/components/ui/ToastContext'

export const metadata: Metadata = {
  title: 'BarberStudio | Reserva tu Cita',
  description: 'Reserva tu cita con los mejores barberos profesionales. Cortes, afeitado y tratamientos exclusivos.',
  keywords: ['barbería', 'barbero', 'corte de pelo', 'afeitado', 'reserva de cita'],
  openGraph: {
    title: 'BarberStudio | Reserva tu Cita',
    description: 'Reserva tu cita con los mejores barberos profesionales.',
    type: 'website',
    locale: 'es_MX',
    siteName: 'BarberStudio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BarberStudio | Reserva tu Cita',
    description: 'Reserva tu cita con los mejores barberos profesionales.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <ToastProvider>
          <a href="#main-content" className="skip-link">
            Saltar al contenido principal
          </a>
          <div className="flex flex-col min-h-screen">
            <ClerkHeader />
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
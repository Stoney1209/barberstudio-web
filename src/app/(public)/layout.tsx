"use client";
import React from 'react';
import ClerkHeader from '@/components/ui/Header'
import '@/styles/globals.css';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ClerkHeader />
      <main id="main-content" className="pt-16 md:pt-20">
        {children}
      </main>
    </>
  );
}
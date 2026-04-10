"use client";
import { usePathname } from 'next/navigation';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPath = pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/citas');

  return (
    <main 
      id="main-content" 
      className={isAdminPath ? "min-h-screen" : "min-h-screen"}
    >
      {children}
    </main>
  );
}

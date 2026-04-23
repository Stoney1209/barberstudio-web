"use client";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <main id="main-content" className="min-h-screen">
      {children}
    </main>
  );
}

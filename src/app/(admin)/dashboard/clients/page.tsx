import { prisma } from '@/lib/prisma'
import { Search } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ClientsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  
  const clients = await prisma.user.findMany({
    where: { 
      role: 'CLIENT',
      ...(q && {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      }),
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-gradient-mesh bg-noise py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <p className="text-gold/60 text-sm uppercase tracking-widest mb-3">Administración</p>
            <h1 className="text-4xl font-display font-light text-white">Clientes</h1>
          </div>
        </div>

        <form className="mb-6 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/40" />
          <input
            name="q"
            defaultValue={q || ''}
            placeholder="Buscar por nombre o email..."
            className="w-full bg-surface-2/50 border border-gold/10 pl-12 pr-4 py-3 text-white placeholder-muted/40 outline-none focus:border-gold/30 transition-all"
          />
        </form>

        <div className="glass border border-gold/10 rounded-lg overflow-hidden shadow-glow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gold/10 text-muted/60 text-xs uppercase tracking-wider">
                  <th className="p-4">Nombre</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Teléfono</th>
                  <th className="p-4">Fecha Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/5">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-gold/5 transition-colors group">
                    <td className="p-4 text-white font-medium">{c.name || 'Sin nombre'}</td>
                    <td className="p-4 text-muted/80">{c.email}</td>
                    <td className="p-4 text-muted/80">{c.phone || '-'}</td>
                    <td className="p-4 text-muted/60 text-sm">
                      {new Date(c.createdAt).toLocaleDateString('es-ES')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {clients.length === 0 && (
            <div className="p-20 text-center">
              <span className="text-4xl block mb-4">👥</span>
              <p className="text-muted/60">
                {q ? `No se encontraron resultados para "${q}"` : 'No hay clientes registrados todavía'}
              </p>
              {q && (
                <Link href="/dashboard/clients" className="text-gold hover:underline text-sm mt-2 inline-block">
                  Limpiar búsqueda
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
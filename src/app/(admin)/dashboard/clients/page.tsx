import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function ClientsAdminPage() {
  const clients = await prisma.user.findMany({
    where: { role: 'CLIENT' },
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
              <p className="text-muted/60">No hay clientes registrados todavía</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

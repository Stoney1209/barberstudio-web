"use client"
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<'login' | 'register'>('login')
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    
    try {
      if (view === 'register') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        setError('Revisa tu correo para confirmar tu registro.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/')
        router.refresh()
      }
    } catch (error: any) {
      setError(error.message || 'Ocurrió un error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-12 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-black bg-noise">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
            <Link href="/" className="inline-block group mb-8">
              <span className="font-display text-4xl text-white tracking-tighter">
                Barber<span className="text-gold group-hover:text-white transition-colors">Studio</span>
              </span>
            </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          {view === 'login' ? 'Inicia sesión en tu cuenta' : 'Crea una cuenta nueva'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass py-8 px-4 shadow-glow sm:rounded-lg sm:px-10 border-gold/10 border">
          <form className="space-y-6" onSubmit={handleAuth}>
            <div>
              <label className="block text-sm font-medium text-gray-300">Correo Electrónico</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-gold/20 rounded-md shadow-sm bg-black/50 text-white placeholder-gray-400 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm"
                  placeholder="ejemplo@correo.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Contraseña</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-gold/20 rounded-md shadow-sm bg-black/50 text-white placeholder-gray-400 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm"
                  placeholder="********"
                />
              </div>
            </div>

            {error && (
              <div className={`text-sm ${error.includes('Revisa') ? 'text-green-400' : 'text-red-400'} text-center`}>
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-glow text-sm font-bold text-black bg-gold hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold uppercase tracking-widest disabled:opacity-50"
              >
                {loading ? 'Cargando...' : view === 'login' ? 'Entrar' : 'Registrarse'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setView(view === 'login' ? 'register' : 'login')
                setError(null)
              }}
              className="text-gold/80 hover:text-white text-sm transition-colors"
            >
              {view === 'login' 
                ? '¿No tienes cuenta? Regístrate gratis' 
                : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

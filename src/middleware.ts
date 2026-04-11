import { NextResponse, type NextRequest } from 'next/server'
import { getPublicApiRatelimit } from '@/lib/rate-limit'
import { updateSession } from '@/lib/supabase/middleware'

const publicApiRateLimitMatchers = [
  /^\/api\/services(\/|$)/,
  /^\/api\/barbers(\/|$)/,
  /^\/api\/availability(\/|$)/,
  /^\/api\/reviews(\/|$)/,
  /^\/api\/galeria(\/|$)/,
  /^\/api\/auth\/me(\/|$)/,
]

function shouldRateLimitPublicApi(pathname: string) {
  return publicApiRateLimitMatchers.some((re) => re.test(pathname))
}

const isPublicRoute = (pathname: string) => {
  if (pathname === '/') return true
  if (pathname.startsWith('/login')) return true
  if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) return true
  if (pathname.startsWith('/auth')) return true // For callback routes
  if (pathname.startsWith('/api/auth')) return true
  if (pathname.startsWith('/api/services')) return true
  if (pathname.startsWith('/api/barbers')) return true
  if (pathname.startsWith('/api/availability')) return true
  if (pathname.startsWith('/api/reviews')) return true
  if (pathname.startsWith('/api/galeria')) return true
  return false
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  if (pathname.startsWith('/api/') && shouldRateLimitPublicApi(pathname)) {
    const rl = getPublicApiRatelimit()
    if (rl) {
      const forwarded = req.headers.get('x-forwarded-for')
      const ip = forwarded?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? 'unknown'
      const { success, reset } = await rl.limit(`api:${ip}`)
      if (!success) {
        const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000))
        return NextResponse.json(
          { error: 'Demasiadas solicitudes. Intenta de nuevo en unos segundos.' },
          { status: 429, headers: { 'Retry-After': String(retryAfter) } }
        )
      }
    }
  }

  const { supabaseResponse, user } = await updateSession(req)

  if (!isPublicRoute(pathname)) {
    if (!user) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
      } else {
        const loginUrl = new URL('/login', req.url)
        return NextResponse.redirect(loginUrl)
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}

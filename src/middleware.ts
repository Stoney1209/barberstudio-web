import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getPublicApiRatelimit } from '@/lib/rate-limit'

/**
 * Routes that skip Clerk auth.protect() — handlers must enforce auth/roles themselves.
 * Keep this list explicit so new /api routes default to requiring a session at the edge.
 */
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/auth/me',
  '/api/webhooks/clerk(.*)',
  '/api/services(.*)',
  '/api/barbers(.*)',
  '/api/appointments',
  '/api/availability(.*)',
  '/api/reviews(.*)',
  '/api/galeria(.*)',
])

/** Subset of public API used for reads; rate-limited when Upstash is configured. */
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

export default clerkMiddleware(async (auth, req) => {
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

  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}

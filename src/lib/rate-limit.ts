import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

let ratelimit: Ratelimit | null | undefined

/**
 * Sliding-window limiter for public API routes. Requires UPSTASH_REDIS_REST_URL and
 * UPSTASH_REDIS_REST_TOKEN; if unset, returns null (no limiting — fine for local dev).
 */
export function getPublicApiRatelimit(): Ratelimit | null {
  if (ratelimit !== undefined) return ratelimit

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    ratelimit = null
    return null
  }

  const redis = new Redis({ url, token })
  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(120, '1 m'),
    prefix: 'babernew:public_api',
  })
  return ratelimit
}

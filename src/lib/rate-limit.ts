import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

let publicApiRatelimit: Ratelimit | null | undefined
let writeApiRatelimit: Ratelimit | null | undefined

/**
 * Sliding-window limiter for public API routes (read-only). 
 * Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_TOKEN.
 */
export function getPublicApiRatelimit(): Ratelimit | null {
  if (publicApiRatelimit !== undefined) return publicApiRatelimit

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    publicApiRatelimit = null
    return null
  }

  const redis = new Redis({ url, token })
  publicApiRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(120, '1 m'),
    prefix: 'barbernew:public_api',
  })
  return publicApiRatelimit
}

/**
 * Stricter limiter for write operations (POST/PUT/DELETE).
 * 30 requests per minute.
 */
export function getWriteApiRatelimit(): Ratelimit | null {
  if (writeApiRatelimit !== undefined) return writeApiRatelimit

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    writeApiRatelimit = null
    return null
  }

  const redis = new Redis({ url, token })
  writeApiRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    prefix: 'barbernew:write_api',
  })
  return writeApiRatelimit
}
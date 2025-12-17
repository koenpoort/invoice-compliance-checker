import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Check if Upstash is configured
const isUpstashConfigured =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN

// Create rate limiter (if Upstash configured)
const ratelimit = isUpstashConfigured
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      analytics: true,
      prefix: 'invoice-checker',
    })
  : null

export interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Check rate limit for an IP address
 * Returns whether the request is allowed and rate limit info
 */
export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  if (!ratelimit) {
    // No rate limiting if Upstash not configured (development)
    console.warn('Rate limiting disabled: UPSTASH_REDIS_REST_URL not configured')
    return {
      allowed: true,
      limit: 10,
      remaining: 10,
      reset: Date.now() + 60000,
    }
  }

  const { success, limit, remaining, reset } = await ratelimit.limit(ip)

  return {
    allowed: success,
    limit,
    remaining,
    reset,
  }
}

/**
 * Get rate limit headers for HTTP response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  }
}

/**
 * Simple in-memory rate limiter for API routes
 *
 * For production with multiple instances, consider using:
 * - @upstash/ratelimit with Redis
 * - Vercel Edge Config
 * - External rate limiting service
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

const limitMap = new Map<string, RateLimitEntry>()

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of limitMap.entries()) {
    if (entry.resetTime < now) {
      limitMap.delete(key)
    }
  }
}, 5 * 60 * 1000)

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Check if a request should be rate limited
 *
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param limit - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns Rate limit result with success status
 */
export function rateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60 * 1000 // 1 minute default
): RateLimitResult {
  const now = Date.now()
  const entry = limitMap.get(identifier)

  if (!entry || entry.resetTime < now) {
    // New entry or expired entry
    const resetTime = now + windowMs
    limitMap.set(identifier, { count: 1, resetTime })
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: resetTime,
    }
  }

  if (entry.count >= limit) {
    // Rate limit exceeded
    return {
      success: false,
      limit,
      remaining: 0,
      reset: entry.resetTime,
    }
  }

  // Increment count
  entry.count++
  return {
    success: true,
    limit,
    remaining: limit - entry.count,
    reset: entry.resetTime,
  }
}

/**
 * Get rate limit headers for HTTP response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": new Date(result.reset).toISOString(),
  }
}

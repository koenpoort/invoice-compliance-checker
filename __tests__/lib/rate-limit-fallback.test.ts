import { describe, it, expect, vi, beforeAll } from 'vitest'

// Clear Upstash env vars BEFORE importing the module
beforeAll(() => {
  delete process.env.UPSTASH_REDIS_REST_URL
  delete process.env.UPSTASH_REDIS_REST_TOKEN
})

// Mock console.warn to suppress expected warning
vi.spyOn(console, 'warn').mockImplementation(() => {})

// Dynamic import to pick up cleared env vars
describe('checkRateLimit (fallback mode)', () => {
  it('allows all requests when Upstash not configured', async () => {
    // Dynamic import to ensure we get fresh module state
    const { checkRateLimit } = await import('@/lib/rate-limit')

    const result = await checkRateLimit('192.168.1.1')

    expect(result.allowed).toBe(true)
    expect(result.limit).toBe(10)
    expect(result.remaining).toBe(10)
  })

  it('returns correct fallback values', async () => {
    const { checkRateLimit } = await import('@/lib/rate-limit')

    const result = await checkRateLimit('192.168.1.1')

    expect(result.limit).toBe(10)
    expect(result.remaining).toBe(10)
    expect(result.reset).toBeGreaterThan(Date.now())
  })

  it('logs warning about disabled rate limiting', async () => {
    const { checkRateLimit } = await import('@/lib/rate-limit')

    await checkRateLimit('192.168.1.1')

    expect(console.warn).toHaveBeenCalledWith(
      'Rate limiting disabled: UPSTASH_REDIS_REST_URL not configured'
    )
  })
})

describe('getRateLimitHeaders', () => {
  it('returns correct headers from rate limit result', async () => {
    const { getRateLimitHeaders } = await import('@/lib/rate-limit')

    const result = {
      allowed: true,
      limit: 10,
      remaining: 5,
      reset: 1234567890,
    }

    const headers = getRateLimitHeaders(result)

    expect(headers['X-RateLimit-Limit']).toBe('10')
    expect(headers['X-RateLimit-Remaining']).toBe('5')
    expect(headers['X-RateLimit-Reset']).toBe('1234567890')
  })
})

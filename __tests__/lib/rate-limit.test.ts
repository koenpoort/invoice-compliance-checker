import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock Upstash before importing the rate-limit module
const mockLimit = vi.fn()

vi.mock('@upstash/redis', () => ({
  Redis: {
    fromEnv: vi.fn(() => ({
      // Mock Redis client
    })),
  },
}))

vi.mock('@upstash/ratelimit', () => {
  class RatelimitMock {
    static slidingWindow = vi.fn(() => ({}))
    limit = mockLimit
  }

  return {
    Ratelimit: RatelimitMock,
  }
})

// Set environment variables before importing the module
process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io'
process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token'

// Import after mocking
const { checkRateLimit } = await import('@/lib/rate-limit')

describe('checkRateLimit', () => {
  beforeEach(() => {
    mockLimit.mockClear()
  })

  it('allows request within rate limit', async () => {
    mockLimit.mockResolvedValueOnce({
      success: true,
      limit: 10,
      remaining: 9,
      reset: Date.now() + 60000,
    })

    const result = await checkRateLimit('192.168.1.1')

    expect(result.allowed).toBe(true)
    expect(result.limit).toBe(10)
    expect(result.remaining).toBe(9)
  })

  it('blocks request exceeding rate limit', async () => {
    mockLimit.mockResolvedValueOnce({
      success: false,
      limit: 10,
      remaining: 0,
      reset: Date.now() + 60000,
    })

    const result = await checkRateLimit('192.168.1.1')

    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })
})

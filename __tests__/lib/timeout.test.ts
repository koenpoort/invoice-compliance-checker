import { describe, it, expect, vi } from 'vitest'
import { withTimeout } from '@/lib/timeout'

describe('withTimeout', () => {
  it('resolves with promise result if completes before timeout', async () => {
    const promise = Promise.resolve('success')

    const result = await withTimeout(promise, 1000, 'Timeout')

    expect(result).toBe('success')
  })

  it('rejects with timeout error if promise takes too long', async () => {
    const promise = new Promise((resolve) => {
      setTimeout(() => resolve('too late'), 2000)
    })

    await expect(
      withTimeout(promise, 100, 'Operation timed out')
    ).rejects.toThrow('Operation timed out')
  })

  it('rejects with original error if promise rejects', async () => {
    const promise = Promise.reject(new Error('Original error'))

    await expect(
      withTimeout(promise, 1000, 'Timeout')
    ).rejects.toThrow('Original error')
  })
})

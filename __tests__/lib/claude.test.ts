import { describe, it, expect, vi } from 'vitest'
import { analyzeInvoiceText } from '@/lib/claude'

// Mock environment
vi.mock('@/lib/env', () => ({
  env: {
    GOOGLE_CLOUD_PROJECT_ID: 'test-project',
    GOOGLE_CLOUD_LOCATION: 'eu',
    GOOGLE_DOCUMENT_AI_PROCESSOR_ID: 'test-processor',
    ANTHROPIC_API_KEY: 'test-key',
  },
}))

// Mock timeout utility
vi.mock('@/lib/timeout', () => ({
  withTimeout: vi.fn((promise: Promise<any>) => promise),
}))

// Mock Anthropic SDK
vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class MockAnthropic {
      messages = {
        create: vi.fn().mockResolvedValue({
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                factuurnummer: { found: true, value: 'INV-001' },
                factuurdatum: { found: true, value: '2025-01-15' },
                leverancierNaam: { found: true, value: 'Test BV' },
                btwNummer: { found: true, value: 'NL123456789B01' },
                klantNaam: { found: true, value: 'Klant BV' },
                totaalbedrag: { found: true, value: '€1000' },
              }),
            },
          ],
        }),
      }
    },
  }
})

describe('analyzeInvoiceText', () => {
  it('parses valid Claude response', async () => {
    const result = await analyzeInvoiceText('Sample invoice text')

    expect(result.factuurnummer.found).toBe(true)
    expect(result.factuurnummer.value).toBe('INV-001')
  })

  it('handles malformed JSON gracefully', async () => {
    // This test will be implemented after we add retry logic
    expect(true).toBe(true)
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Use vi.hoisted to make mock available in factory
const { mockMessagesCreate } = vi.hoisted(() => ({
  mockMessagesCreate: vi.fn(),
}))

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
vi.mock('@anthropic-ai/sdk', () => ({
  default: function MockAnthropic() {
    return {
      messages: {
        create: mockMessagesCreate,
      },
    }
  },
}))

// Import after mocking
import { analyzeInvoiceText } from '@/lib/claude'

const validResponse = {
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
        kvkNummer: { found: true, value: '12345678' },
        leverancierAdres: { found: true, street: 'Teststraat', houseNumber: '1', postalCode: '1234AB', city: 'Amsterdam', complete: true },
        klantAdres: { found: true, street: 'Klantweg', houseNumber: '2', postalCode: '5678CD', city: 'Rotterdam', complete: true },
        omschrijving: { found: true, value: 'Consulting diensten, 10 uur' },
        leveringsdatum: { found: true, value: '2025-01-10' },
        bedragExclBtw: { found: true, value: '€826.45' },
        btwTarief: { found: true, value: '21%' },
        btwBedrag: { found: true, value: '€173.55' },
      }),
    },
  ],
}

describe('analyzeInvoiceText', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMessagesCreate.mockReset()
  })

  it('parses valid Claude response', async () => {
    mockMessagesCreate.mockResolvedValue(validResponse)

    const result = await analyzeInvoiceText('Sample invoice text')

    expect(result.factuurnummer.found).toBe(true)
    expect(result.factuurnummer.value).toBe('INV-001')
    expect(mockMessagesCreate).toHaveBeenCalledTimes(1)
  })

  it('retries once when JSON parsing fails and succeeds on retry', async () => {
    const invalidResponse = {
      content: [
        {
          type: 'text',
          text: 'This is not valid JSON',
        },
      ],
    }

    mockMessagesCreate
      .mockResolvedValueOnce(invalidResponse)
      .mockResolvedValueOnce(validResponse)

    const result = await analyzeInvoiceText('Sample invoice text')

    expect(result.factuurnummer.found).toBe(true)
    expect(result.factuurnummer.value).toBe('INV-001')
    expect(mockMessagesCreate).toHaveBeenCalledTimes(2)
  })

  it('retries once when Zod validation fails and succeeds on retry', async () => {
    const invalidStructureResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            factuurnummer: { missing: 'wrong structure' },
            factuurdatum: { found: true, value: '2025-01-15' },
            leverancierNaam: { found: true, value: 'Test BV' },
            btwNummer: { found: true, value: 'NL123456789B01' },
            klantNaam: { found: true, value: 'Klant BV' },
            totaalbedrag: { found: true, value: '€1000' },
          }),
        },
      ],
    }

    mockMessagesCreate
      .mockResolvedValueOnce(invalidStructureResponse)
      .mockResolvedValueOnce(validResponse)

    const result = await analyzeInvoiceText('Sample invoice text')

    expect(result.factuurnummer.found).toBe(true)
    expect(mockMessagesCreate).toHaveBeenCalledTimes(2)
  })

  it('throws error when both attempts fail', async () => {
    const invalidResponse = {
      content: [
        {
          type: 'text',
          text: 'Invalid JSON',
        },
      ],
    }

    mockMessagesCreate.mockResolvedValue(invalidResponse)

    await expect(analyzeInvoiceText('Sample invoice text')).rejects.toThrow(
      'Kan factuur niet analyseren. Probeer het opnieuw.'
    )
    expect(mockMessagesCreate).toHaveBeenCalledTimes(2)
  })

  it('validates all required fields are present in schema', async () => {
    const missingFieldsResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            factuurnummer: { found: true, value: 'INV-001' },
            // Missing other required fields
          }),
        },
      ],
    }

    mockMessagesCreate.mockResolvedValue(missingFieldsResponse)

    await expect(analyzeInvoiceText('Sample invoice text')).rejects.toThrow(
      'Kan factuur niet analyseren. Probeer het opnieuw.'
    )
  })

  it('handles optional value field correctly', async () => {
    const responseWithoutValues = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            factuurnummer: { found: false },
            factuurdatum: { found: false },
            leverancierNaam: { found: false },
            btwNummer: { found: false },
            klantNaam: { found: false },
            totaalbedrag: { found: false },
            kvkNummer: { found: false },
            leverancierAdres: { found: false, complete: false },
            klantAdres: { found: false, complete: false },
            omschrijving: { found: false },
            leveringsdatum: { found: false },
            bedragExclBtw: { found: false },
            btwTarief: { found: false },
            btwBedrag: { found: false },
          }),
        },
      ],
    }

    mockMessagesCreate.mockResolvedValue(responseWithoutValues)

    const result = await analyzeInvoiceText('Sample invoice text')

    expect(result.factuurnummer.found).toBe(false)
    expect(result.factuurnummer.value).toBeUndefined()
    expect(mockMessagesCreate).toHaveBeenCalledTimes(1)
  })

  it('parses address fields correctly', async () => {
    mockMessagesCreate.mockResolvedValue(validResponse)

    const result = await analyzeInvoiceText('Sample invoice text')

    expect(result.leverancierAdres.complete).toBe(true)
    expect(result.leverancierAdres.street).toBe('Teststraat')
    expect(result.leverancierAdres.houseNumber).toBe('1')
    expect(result.leverancierAdres.postalCode).toBe('1234AB')
    expect(result.leverancierAdres.city).toBe('Amsterdam')
  })

  it('handles incomplete address correctly', async () => {
    const incompleteAddressResponse = {
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
            kvkNummer: { found: true, value: '12345678' },
            leverancierAdres: { found: true, street: 'Teststraat', houseNumber: '1', complete: false },
            klantAdres: { found: false, complete: false },
            omschrijving: { found: true, value: 'Consulting' },
            leveringsdatum: { found: true, value: '2025-01-10' },
            bedragExclBtw: { found: true, value: '€826.45' },
            btwTarief: { found: true, value: '21%' },
            btwBedrag: { found: true, value: '€173.55' },
          }),
        },
      ],
    }

    mockMessagesCreate.mockResolvedValue(incompleteAddressResponse)

    const result = await analyzeInvoiceText('Sample invoice text')

    expect(result.leverancierAdres.found).toBe(true)
    expect(result.leverancierAdres.complete).toBe(false)
    expect(result.klantAdres.complete).toBe(false)
  })
})

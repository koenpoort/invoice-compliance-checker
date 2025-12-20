import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the Document AI client before importing
const mockProcessDocument = vi.fn()

class MockDocumentProcessorServiceClient {
  processDocument = mockProcessDocument
}

vi.mock('@google-cloud/documentai', () => ({
  DocumentProcessorServiceClient: MockDocumentProcessorServiceClient,
}))

// Mock env module with JSON credentials to avoid fs.readFileSync
vi.mock('@/lib/env', () => ({
  env: {
    GOOGLE_CLOUD_PROJECT_ID: 'test-project',
    GOOGLE_CLOUD_LOCATION: 'eu',
    GOOGLE_DOCUMENT_AI_PROCESSOR_ID: 'test-processor',
    GOOGLE_APPLICATION_CREDENTIALS: undefined,
    // Use JSON credentials to avoid fs.readFileSync
    GOOGLE_CREDENTIALS_JSON: JSON.stringify({
      type: 'service_account',
      project_id: 'test-project',
      private_key: 'fake-key',
      client_email: 'test@test.iam.gserviceaccount.com',
    }),
    NODE_ENV: 'production', // Use production to trigger JSON path
    DEBUG: false,
  },
}))

// Import after mocking
const { extractTextFromPdf } = await import('@/lib/document-ai')

describe('extractTextFromPdf', () => {
  beforeEach(() => {
    mockProcessDocument.mockClear()
  })

  it('extracts text from valid PDF', async () => {
    mockProcessDocument.mockResolvedValueOnce([{
      document: {
        text: 'Factuurnummer: INV-001\nDatum: 2025-01-15',
      },
    }])

    const result = await extractTextFromPdf(Buffer.from('fake pdf content'))

    expect(result).toBe('Factuurnummer: INV-001\nDatum: 2025-01-15')
  })

  it('throws error for empty document response', async () => {
    mockProcessDocument.mockResolvedValueOnce([{
      document: null,
    }])

    // Empty response results in generic error message
    await expect(extractTextFromPdf(Buffer.from('fake pdf'))).rejects.toThrow(
      'Kan PDF niet verwerken. Controleer of het bestand geldig is.'
    )
  })

  it('throws error for document with no text', async () => {
    mockProcessDocument.mockResolvedValueOnce([{
      document: { text: '' },
    }])

    // Empty text results in generic error message
    await expect(extractTextFromPdf(Buffer.from('fake pdf'))).rejects.toThrow(
      'Kan PDF niet verwerken. Controleer of het bestand geldig is.'
    )
  })
})

// Test error message mapping separately (pure function)
describe('Document AI Error Messages', () => {
  // These tests verify the error message mapping logic works correctly
  // by simulating the different error types that Document AI can return

  it('returns correct message for INVALID_ARGUMENT error', async () => {
    mockProcessDocument.mockRejectedValueOnce(new Error('INVALID_ARGUMENT: Malformed request'))

    await expect(extractTextFromPdf(Buffer.from('fake pdf'))).rejects.toThrow(
      'PDF-bestand is beschadigd of ongeldig'
    )
  })

  it('returns correct message for RESOURCE_EXHAUSTED error', async () => {
    mockProcessDocument.mockRejectedValueOnce(new Error('RESOURCE_EXHAUSTED: Quota exceeded'))

    await expect(extractTextFromPdf(Buffer.from('fake pdf'))).rejects.toThrow(
      'Google Cloud quota bereikt. Probeer het later opnieuw.'
    )
  })

  it('returns correct message for PERMISSION_DENIED error', async () => {
    mockProcessDocument.mockRejectedValueOnce(new Error('PERMISSION_DENIED: Access denied'))

    await expect(extractTextFromPdf(Buffer.from('fake pdf'))).rejects.toThrow(
      'Configuratiefout: geen toegang tot Document AI'
    )
  })

  it('returns correct message for NOT_FOUND error', async () => {
    mockProcessDocument.mockRejectedValueOnce(new Error('NOT_FOUND: Processor not found'))

    await expect(extractTextFromPdf(Buffer.from('fake pdf'))).rejects.toThrow(
      'Document AI processor niet gevonden (configuratiefout)'
    )
  })

  it('returns correct message for DEADLINE_EXCEEDED error', async () => {
    mockProcessDocument.mockRejectedValueOnce(new Error('DEADLINE_EXCEEDED'))

    await expect(extractTextFromPdf(Buffer.from('fake pdf'))).rejects.toThrow(
      'PDF verwerking duurt te lang. Probeer een kleiner bestand.'
    )
  })

  it('returns generic message for unknown errors', async () => {
    mockProcessDocument.mockRejectedValueOnce(new Error('UNKNOWN: Something went wrong'))

    await expect(extractTextFromPdf(Buffer.from('fake pdf'))).rejects.toThrow(
      'Kan PDF niet verwerken. Controleer of het bestand geldig is.'
    )
  })

  it('handles non-Error objects gracefully', async () => {
    mockProcessDocument.mockRejectedValueOnce('String error')

    await expect(extractTextFromPdf(Buffer.from('fake pdf'))).rejects.toThrow(
      'Kan PDF niet verwerken. Controleer of het bestand geldig is.'
    )
  })
})

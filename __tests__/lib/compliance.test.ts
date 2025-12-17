import { describe, it, expect } from 'vitest'
import { calculateCompliance } from '@/lib/compliance'
import type { ExtractedFields } from '@/lib/claude'

describe('calculateCompliance', () => {
  it('returns green status when all fields are found', () => {
    const fields: ExtractedFields = {
      factuurnummer: { found: true, value: 'INV-001' },
      factuurdatum: { found: true, value: '2025-01-15' },
      leverancierNaam: { found: true, value: 'Test BV' },
      btwNummer: { found: true, value: 'NL123456789B01' },
      klantNaam: { found: true, value: 'Klant BV' },
      totaalbedrag: { found: true, value: '€1000' },
    }

    const result = calculateCompliance(fields)

    expect(result.status).toBe('green')
    expect(result.fields).toHaveLength(6)
    expect(result.fields.every((f) => f.found)).toBe(true)
  })

  it('returns orange status when 1 field is missing', () => {
    const fields: ExtractedFields = {
      factuurnummer: { found: true, value: 'INV-001' },
      factuurdatum: { found: true, value: '2025-01-15' },
      leverancierNaam: { found: true, value: 'Test BV' },
      btwNummer: { found: false, value: null },
      klantNaam: { found: true, value: 'Klant BV' },
      totaalbedrag: { found: true, value: '€1000' },
    }

    const result = calculateCompliance(fields)

    expect(result.status).toBe('orange')
    expect(result.fields.filter((f) => !f.found)).toHaveLength(1)
  })

  it('returns orange status when 2 fields are missing', () => {
    const fields: ExtractedFields = {
      factuurnummer: { found: true, value: 'INV-001' },
      factuurdatum: { found: true, value: '2025-01-15' },
      leverancierNaam: { found: true, value: 'Test BV' },
      btwNummer: { found: false, value: null },
      klantNaam: { found: false, value: null },
      totaalbedrag: { found: true, value: '€1000' },
    }

    const result = calculateCompliance(fields)

    expect(result.status).toBe('orange')
    expect(result.fields.filter((f) => !f.found)).toHaveLength(2)
  })

  it('returns red status when 3 fields are missing', () => {
    const fields: ExtractedFields = {
      factuurnummer: { found: true, value: 'INV-001' },
      factuurdatum: { found: true, value: '2025-01-15' },
      leverancierNaam: { found: true, value: 'Test BV' },
      btwNummer: { found: false, value: null },
      klantNaam: { found: false, value: null },
      totaalbedrag: { found: false, value: null },
    }

    const result = calculateCompliance(fields)

    expect(result.status).toBe('red')
    expect(result.fields.filter((f) => !f.found)).toHaveLength(3)
  })

  it('returns red status when all fields are missing', () => {
    const fields: ExtractedFields = {
      factuurnummer: { found: false, value: null },
      factuurdatum: { found: false, value: null },
      leverancierNaam: { found: false, value: null },
      btwNummer: { found: false, value: null },
      klantNaam: { found: false, value: null },
      totaalbedrag: { found: false, value: null },
    }

    const result = calculateCompliance(fields)

    expect(result.status).toBe('red')
    expect(result.fields.filter((f) => !f.found)).toHaveLength(6)
  })
})

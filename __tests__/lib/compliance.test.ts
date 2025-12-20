import { describe, it, expect } from 'vitest'
import { calculateCompliance } from '@/lib/compliance'
import type { ExtractedFields } from '@/lib/claude'

// Helper to create full fields object with all 14 fields
function createFields(overrides: Partial<ExtractedFields> = {}): ExtractedFields {
  return {
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
    ...overrides,
  }
}

describe('calculateCompliance', () => {
  it('returns green status when all fields are found', () => {
    const fields = createFields()

    const result = calculateCompliance(fields)

    expect(result.status).toBe('green')
    expect(result.fields).toHaveLength(14)
    expect(result.fields.every((f) => f.found)).toBe(true)
  })

  it('returns orange status when 1 field is missing', () => {
    const fields = createFields({
      btwNummer: { found: false, value: undefined },
    })

    const result = calculateCompliance(fields)

    expect(result.status).toBe('orange')
    expect(result.fields.filter((f) => !f.found)).toHaveLength(1)
  })

  it('returns orange status when 2 fields are missing', () => {
    const fields = createFields({
      btwNummer: { found: false, value: undefined },
      klantNaam: { found: false, value: undefined },
    })

    const result = calculateCompliance(fields)

    expect(result.status).toBe('orange')
    expect(result.fields.filter((f) => !f.found)).toHaveLength(2)
  })

  it('returns red status when 3 fields are missing', () => {
    const fields = createFields({
      btwNummer: { found: false, value: undefined },
      klantNaam: { found: false, value: undefined },
      totaalbedrag: { found: false, value: undefined },
    })

    const result = calculateCompliance(fields)

    expect(result.status).toBe('red')
    expect(result.fields.filter((f) => !f.found)).toHaveLength(3)
  })

  it('returns red status when all fields are missing', () => {
    const fields: ExtractedFields = {
      factuurnummer: { found: false, value: undefined },
      factuurdatum: { found: false, value: undefined },
      leverancierNaam: { found: false, value: undefined },
      btwNummer: { found: false, value: undefined },
      klantNaam: { found: false, value: undefined },
      totaalbedrag: { found: false, value: undefined },
      kvkNummer: { found: false, value: undefined },
      leverancierAdres: { found: false, complete: false },
      klantAdres: { found: false, complete: false },
      omschrijving: { found: false, value: undefined },
      leveringsdatum: { found: false, value: undefined },
      bedragExclBtw: { found: false, value: undefined },
      btwTarief: { found: false, value: undefined },
      btwBedrag: { found: false, value: undefined },
    }

    const result = calculateCompliance(fields)

    expect(result.status).toBe('red')
    expect(result.fields.filter((f) => !f.found)).toHaveLength(14)
  })

  it('uses complete flag for address compliance check', () => {
    const fields = createFields({
      leverancierAdres: { found: true, street: 'Teststraat', complete: false },
      klantAdres: { found: true, city: 'Amsterdam', complete: false },
    })

    const result = calculateCompliance(fields)

    expect(result.status).toBe('orange')
    const leverancierAdresField = result.fields.find((f) => f.name === 'leverancierAdres')
    const klantAdresField = result.fields.find((f) => f.name === 'klantAdres')
    expect(leverancierAdresField?.found).toBe(false)
    expect(klantAdresField?.found).toBe(false)
  })

  it('formats complete address correctly', () => {
    const fields = createFields()

    const result = calculateCompliance(fields)

    const leverancierAdresField = result.fields.find((f) => f.name === 'leverancierAdres')
    expect(leverancierAdresField?.value).toBe('Teststraat 1, 1234AB Amsterdam')
  })

  it('formats partial address correctly', () => {
    const fields = createFields({
      leverancierAdres: { found: true, street: 'Teststraat', city: 'Amsterdam', complete: false },
    })

    const result = calculateCompliance(fields)

    const leverancierAdresField = result.fields.find((f) => f.name === 'leverancierAdres')
    expect(leverancierAdresField?.value).toBe('Teststraat, Amsterdam')
  })
})

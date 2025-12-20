# Full Compliance Coverage Design

**Date:** 2025-12-20
**Status:** Approved
**Goal:** Expand invoice field extraction from 6 to 14 fields for 100% Dutch BTW compliance

## Background

Current app checks 6 fields. Official Belastingdienst requirements list 14 fields.
Source: https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/administratie_bijhouden/facturen_maken/factuureisen/

## New Fields (8)

| Field | Dutch | Type | Validation |
|-------|-------|------|------------|
| `kvkNummer` | KVK-nummer | string | 8 digits |
| `leverancierAdres` | Adres leverancier | Address | Must be complete (no P.O. box only) |
| `klantAdres` | Adres klant | Address | Must be complete |
| `omschrijving` | Omschrijving | string | Description + quantity |
| `leveringsdatum` | Leveringsdatum | string | Date of delivery |
| `bedragExclBtw` | Bedrag excl. BTW | string | Amount before tax |
| `btwTarief` | BTW-tarief | string | 0%, 9%, or 21% |
| `btwBedrag` | BTW-bedrag | string | Calculated tax amount |

## Data Model

### Address Schema

```typescript
interface Address {
  found: boolean
  street?: string      // straatnaam
  houseNumber?: string // huisnummer
  postalCode?: string  // postcode
  city?: string        // plaats
  complete: boolean    // all 4 parts present
}
```

### Extended Fields Schema

```typescript
const AddressSchema = z.object({
  found: z.boolean(),
  street: z.string().optional(),
  houseNumber: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  complete: z.boolean(),
})

const ExtractedFieldsSchema = z.object({
  // Existing (6)
  factuurnummer: FieldSchema,
  factuurdatum: FieldSchema,
  leverancierNaam: FieldSchema,
  btwNummer: FieldSchema,
  klantNaam: FieldSchema,
  totaalbedrag: FieldSchema,

  // New (8)
  kvkNummer: FieldSchema,
  leverancierAdres: AddressSchema,
  klantAdres: AddressSchema,
  omschrijving: FieldSchema,
  leveringsdatum: FieldSchema,
  bedragExclBtw: FieldSchema,
  btwTarief: FieldSchema,
  btwBedrag: FieldSchema,
})
```

## Claude Prompt

```
Je bent een Nederlandse factuur-analyzer. Analyseer de gegeven factuur tekst
en bepaal of de volgende verplichte velden aanwezig zijn:

1. factuurnummer - Een uniek nummer voor de factuur
2. factuurdatum - De datum van de factuur
3. leverancierNaam - De naam van de leverancier/verkoper
4. btwNummer - Het BTW-nummer (NL + 9 cijfers + B + 2 cijfers)
5. klantNaam - De naam van de klant/koper
6. totaalbedrag - Het totaalbedrag van de factuur
7. kvkNummer - KVK-nummer (8 cijfers)
8. leverancierAdres - Volledig adres: straat, huisnummer, postcode, plaats
9. klantAdres - Volledig adres: straat, huisnummer, postcode, plaats
10. omschrijving - Omschrijving van geleverde goederen/diensten met hoeveelheid
11. leveringsdatum - Datum van levering (mag gelijk zijn aan factuurdatum)
12. bedragExclBtw - Bedrag exclusief BTW
13. btwTarief - BTW-tarief (0%, 9%, of 21%)
14. btwBedrag - BTW-bedrag

Voor adressen: een adres is alleen "complete": true als ALLE onderdelen
aanwezig zijn (straat, huisnummer, postcode, plaats).
Een postbus alleen is NIET voldoende.
```

## Compliance Logic

- Address fields use `complete` flag for compliance check
- Other fields use `found` flag
- Thresholds unchanged:
  - Green: 0 missing
  - Orange: 1-2 missing
  - Red: 3+ missing

## UI Field Labels

```typescript
kvkNummer: { label: "KVK-nummer", description: "Kamer van Koophandel nummer" },
leverancierAdres: { label: "Adres leverancier", description: "Volledig vestigingsadres" },
klantAdres: { label: "Adres klant", description: "Volledig adres klant" },
omschrijving: { label: "Omschrijving", description: "Goederen/diensten met hoeveelheid" },
leveringsdatum: { label: "Leveringsdatum", description: "Datum van levering" },
bedragExclBtw: { label: "Bedrag excl. BTW", description: "Nettobedrag voor belasting" },
btwTarief: { label: "BTW-tarief", description: "Toegepast percentage (0%, 9%, 21%)" },
btwBedrag: { label: "BTW-bedrag", description: "Berekende belasting" },
```

Address display format: `{street} {houseNumber}, {postalCode} {city}`

## Files to Change

| File | Changes |
|------|---------|
| `lib/claude.ts` | AddressSchema, ExtractedFieldsSchema, prompt |
| `lib/compliance.ts` | 8 new field checks |
| `components/result-display.tsx` | 8 new labels, address formatting |
| `__tests__/lib/claude.test.ts` | New field tests |
| `__tests__/lib/compliance.test.ts` | Update mock data |
| `__tests__/components/result-display.test.tsx` | New label tests |

## Future Work (Not in Scope)

- **Phase 2:** KVK API integration for vendor verification
- **Phase 3:** VAT deductibility advice (voorbelasting)
- **Phase 4:** Income tax advisory

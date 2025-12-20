import { ExtractedFields } from "./claude"

export interface FieldResult {
  name: string
  found: boolean
  value?: string
}

export interface ComplianceResult {
  status: "green" | "orange" | "red"
  fields: FieldResult[]
}

// Helper to format address as display value
function formatAddress(addr: { street?: string; houseNumber?: string; postalCode?: string; city?: string }): string | undefined {
  const parts = [
    addr.street && addr.houseNumber ? `${addr.street} ${addr.houseNumber}` : addr.street,
    addr.postalCode && addr.city ? `${addr.postalCode} ${addr.city}` : addr.postalCode || addr.city,
  ].filter(Boolean)
  return parts.length > 0 ? parts.join(", ") : undefined
}

export function calculateCompliance(fields: ExtractedFields): ComplianceResult {
  const fieldResults: FieldResult[] = [
    {
      name: "factuurnummer",
      found: fields.factuurnummer.found,
      value: fields.factuurnummer.value,
    },
    {
      name: "factuurdatum",
      found: fields.factuurdatum.found,
      value: fields.factuurdatum.value,
    },
    {
      name: "leverancierNaam",
      found: fields.leverancierNaam.found,
      value: fields.leverancierNaam.value,
    },
    {
      name: "btwNummer",
      found: fields.btwNummer.found,
      value: fields.btwNummer.value,
    },
    {
      name: "klantNaam",
      found: fields.klantNaam.found,
      value: fields.klantNaam.value,
    },
    {
      name: "totaalbedrag",
      found: fields.totaalbedrag.found,
      value: fields.totaalbedrag.value,
    },
    {
      name: "kvkNummer",
      found: fields.kvkNummer.found,
      value: fields.kvkNummer.value,
    },
    {
      name: "leverancierAdres",
      found: fields.leverancierAdres.complete,
      value: formatAddress(fields.leverancierAdres),
    },
    {
      name: "klantAdres",
      found: fields.klantAdres.complete,
      value: formatAddress(fields.klantAdres),
    },
    {
      name: "omschrijving",
      found: fields.omschrijving.found,
      value: fields.omschrijving.value,
    },
    {
      name: "leveringsdatum",
      found: fields.leveringsdatum.found,
      value: fields.leveringsdatum.value,
    },
    {
      name: "bedragExclBtw",
      found: fields.bedragExclBtw.found,
      value: fields.bedragExclBtw.value,
    },
    {
      name: "btwTarief",
      found: fields.btwTarief.found,
      value: fields.btwTarief.value,
    },
    {
      name: "btwBedrag",
      found: fields.btwBedrag.found,
      value: fields.btwBedrag.value,
    },
  ]

  const missingCount = fieldResults.filter((f) => !f.found).length

  let status: "green" | "orange" | "red"
  if (missingCount === 0) {
    status = "green"
  } else if (missingCount <= 2) {
    status = "orange"
  } else {
    status = "red"
  }

  return {
    status,
    fields: fieldResults,
  }
}

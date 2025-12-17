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

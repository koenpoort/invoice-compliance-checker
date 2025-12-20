import Anthropic from "@anthropic-ai/sdk"
import { z } from "zod"
import { env } from "./env"
import { withTimeout } from "./timeout"

const client = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
})

// Zod schema for validating Claude response
const FieldSchema = z.object({
  found: z.boolean(),
  value: z.string().optional(),
})

const AddressSchema = z.object({
  found: z.boolean(),
  street: z.string().optional(),
  houseNumber: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  complete: z.boolean(),
})

const ExtractedFieldsSchema = z.object({
  // Existing fields
  factuurnummer: FieldSchema,
  factuurdatum: FieldSchema,
  leverancierNaam: FieldSchema,
  btwNummer: FieldSchema,
  klantNaam: FieldSchema,
  totaalbedrag: FieldSchema,
  // New fields
  kvkNummer: FieldSchema,
  leverancierAdres: AddressSchema,
  klantAdres: AddressSchema,
  omschrijving: FieldSchema,
  leveringsdatum: FieldSchema,
  bedragExclBtw: FieldSchema,
  btwTarief: FieldSchema,
  btwBedrag: FieldSchema,
})

export interface Address {
  found: boolean
  street?: string
  houseNumber?: string
  postalCode?: string
  city?: string
  complete: boolean
}

export interface ExtractedFields {
  factuurnummer: { found: boolean; value?: string }
  factuurdatum: { found: boolean; value?: string }
  leverancierNaam: { found: boolean; value?: string }
  btwNummer: { found: boolean; value?: string }
  klantNaam: { found: boolean; value?: string }
  totaalbedrag: { found: boolean; value?: string }
  kvkNummer: { found: boolean; value?: string }
  leverancierAdres: Address
  klantAdres: Address
  omschrijving: { found: boolean; value?: string }
  leveringsdatum: { found: boolean; value?: string }
  bedragExclBtw: { found: boolean; value?: string }
  btwTarief: { found: boolean; value?: string }
  btwBedrag: { found: boolean; value?: string }
}

const SYSTEM_PROMPT = `Je bent een Nederlandse factuur-analyzer. Je taak is om te controleren of bepaalde verplichte velden aanwezig zijn in de factuur tekst.

Analyseer de gegeven factuur tekst en bepaal of de volgende velden aanwezig zijn:
1. factuurnummer - Een uniek nummer voor de factuur
2. factuurdatum - De datum van de factuur
3. leverancierNaam - De naam van de leverancier/verkoper
4. btwNummer - Het BTW-nummer (format: NL + 9 cijfers + B + 2 cijfers, of vergelijkbaar EU formaat)
5. klantNaam - De naam van de klant/koper
6. totaalbedrag - Het totaalbedrag van de factuur
7. kvkNummer - KVK-nummer (8 cijfers)
8. leverancierAdres - Volledig adres van de leverancier: straat, huisnummer, postcode, plaats
9. klantAdres - Volledig adres van de klant: straat, huisnummer, postcode, plaats
10. omschrijving - Omschrijving van geleverde goederen/diensten met hoeveelheid
11. leveringsdatum - Datum van levering (mag gelijk zijn aan factuurdatum)
12. bedragExclBtw - Bedrag exclusief BTW
13. btwTarief - BTW-tarief (0%, 9%, of 21%)
14. btwBedrag - BTW-bedrag

Voor adressen: een adres is alleen "complete": true als ALLE onderdelen aanwezig zijn (straat, huisnummer, postcode, plaats). Een postbus alleen is NIET voldoende.

Geef je antwoord als JSON in exact dit formaat:
{
  "factuurnummer": { "found": true/false, "value": "waarde indien gevonden" },
  "factuurdatum": { "found": true/false, "value": "waarde indien gevonden" },
  "leverancierNaam": { "found": true/false, "value": "waarde indien gevonden" },
  "btwNummer": { "found": true/false, "value": "waarde indien gevonden" },
  "klantNaam": { "found": true/false, "value": "waarde indien gevonden" },
  "totaalbedrag": { "found": true/false, "value": "waarde indien gevonden" },
  "kvkNummer": { "found": true/false, "value": "waarde indien gevonden" },
  "leverancierAdres": { "found": true/false, "street": "straat", "houseNumber": "nummer", "postalCode": "postcode", "city": "plaats", "complete": true/false },
  "klantAdres": { "found": true/false, "street": "straat", "houseNumber": "nummer", "postalCode": "postcode", "city": "plaats", "complete": true/false },
  "omschrijving": { "found": true/false, "value": "waarde indien gevonden" },
  "leveringsdatum": { "found": true/false, "value": "waarde indien gevonden" },
  "bedragExclBtw": { "found": true/false, "value": "waarde indien gevonden" },
  "btwTarief": { "found": true/false, "value": "waarde indien gevonden" },
  "btwBedrag": { "found": true/false, "value": "waarde indien gevonden" }
}

Wees streng: markeer een veld alleen als "found": true als je er zeker van bent dat het veld daadwerkelijk aanwezig is.`

/**
 * Strip markdown code fences from Claude response.
 * Claude sometimes wraps JSON in ```json ... ``` blocks.
 */
function stripMarkdownCodeFence(text: string): string {
  const trimmed = text.trim()
  // Match ```json or ``` at start and ``` at end
  const match = trimmed.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/i)
  return match ? match[1].trim() : trimmed
}

export async function analyzeInvoiceText(
  text: string
): Promise<ExtractedFields> {

  const message = await withTimeout(
    client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Analyseer deze factuur tekst en geef aan welke verplichte velden aanwezig zijn:\n\n${text}`,
        },
      ],
      system: SYSTEM_PROMPT,
    }),
    20000, // 20 seconds
    'Analyse duurt te lang. Probeer het opnieuw.'
  )

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : ""

  // Parse and validate response with Zod
  try {
    // Strip markdown code fences and parse JSON
    const cleanedResponse = stripMarkdownCodeFence(responseText)
    const parsed = JSON.parse(cleanedResponse)

    // Validate with Zod
    const fields = ExtractedFieldsSchema.parse(parsed)

    return fields as ExtractedFields
  } catch (parseError) {
    console.error('Claude parsing error:', parseError)
    console.error('Claude response:', responseText)

    // Retry once on parsing failure
    console.log('Retrying Claude analysis...')

    try {
      const retryResponse = await withTimeout(
        client.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          messages: [
            {
              role: "user",
              content: `Analyseer deze factuur tekst en geef aan welke verplichte velden aanwezig zijn:\n\n${text}`,
            },
          ],
          system: SYSTEM_PROMPT,
        }),
        20000,
        'Analyse duurt te lang. Probeer het opnieuw.'
      )

      const retryContent = retryResponse.content[0].type === "text"
        ? retryResponse.content[0].text
        : ""
      const cleanedRetryContent = stripMarkdownCodeFence(retryContent)
      const retryParsed = JSON.parse(cleanedRetryContent)
      const retryFields = ExtractedFieldsSchema.parse(retryParsed)

      return retryFields as ExtractedFields
    } catch (_retryError) {
      throw new Error('Kan factuur niet analyseren. Probeer het opnieuw.')
    }
  }
}

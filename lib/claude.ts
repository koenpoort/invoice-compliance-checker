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
  value: z.string().nullable().optional(),
})

const ExtractedFieldsSchema = z.object({
  factuurnummer: FieldSchema,
  factuurdatum: FieldSchema,
  leverancierNaam: FieldSchema,
  btwNummer: FieldSchema,
  klantNaam: FieldSchema,
  totaalbedrag: FieldSchema,
})

export interface ExtractedFields {
  factuurnummer: { found: boolean; value?: string }
  factuurdatum: { found: boolean; value?: string }
  leverancierNaam: { found: boolean; value?: string }
  btwNummer: { found: boolean; value?: string }
  klantNaam: { found: boolean; value?: string }
  totaalbedrag: { found: boolean; value?: string }
}

const SYSTEM_PROMPT = `Je bent een Nederlandse factuur-analyzer. Je taak is om te controleren of bepaalde verplichte velden aanwezig zijn in de factuur tekst.

Analyseer de gegeven factuur tekst en bepaal of de volgende velden aanwezig zijn:
1. factuurnummer - Een uniek nummer voor de factuur
2. factuurdatum - De datum van de factuur
3. leverancierNaam - De naam van de leverancier/verkoper
4. btwNummer - Het BTW-nummer (format: NL + 9 cijfers + B + 2 cijfers, of vergelijkbaar EU formaat)
5. klantNaam - De naam van de klant/koper
6. totaalbedrag - Het totaalbedrag van de factuur

Geef je antwoord als JSON in exact dit formaat:
{
  "factuurnummer": { "found": true/false, "value": "waarde indien gevonden" },
  "factuurdatum": { "found": true/false, "value": "waarde indien gevonden" },
  "leverancierNaam": { "found": true/false, "value": "waarde indien gevonden" },
  "btwNummer": { "found": true/false, "value": "waarde indien gevonden" },
  "klantNaam": { "found": true/false, "value": "waarde indien gevonden" },
  "totaalbedrag": { "found": true/false, "value": "waarde indien gevonden" }
}

Wees streng: markeer een veld alleen als "found": true als je er zeker van bent dat het veld daadwerkelijk aanwezig is.`

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
    // Parse JSON
    const parsed = JSON.parse(responseText)

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
      const retryParsed = JSON.parse(retryContent)
      const retryFields = ExtractedFieldsSchema.parse(retryParsed)

      return retryFields as ExtractedFields
    } catch (retryError) {
      throw new Error('Kan factuur niet analyseren. Probeer het opnieuw.')
    }
  }
}

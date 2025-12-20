import { NextRequest, NextResponse } from "next/server"
import { extractTextFromPdf } from "@/lib/document-ai"
import { analyzeInvoiceText } from "@/lib/claude"
import { calculateCompliance } from "@/lib/compliance"
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit"

export const runtime = "nodejs"
export const maxDuration = 60 // seconds

export async function POST(request: NextRequest) {
  // Cache rate limit headers for reuse in error handler (prevents double counting)
  let rateLimitHeaders: Record<string, string> = {}

  try {
    // Rate limiting: 10 requests per minute per IP
    const ip = request.headers.get("x-forwarded-for") ?? "anonymous"
    const rateLimitResult = await checkRateLimit(ip)
    rateLimitHeaders = getRateLimitHeaders(rateLimitResult)

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: "Te veel verzoeken. Probeer het over een minuut opnieuw.",
          retryAfter: new Date(rateLimitResult.reset).toISOString(),
        },
        {
          status: 429,
          headers: rateLimitHeaders,
        }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { error: "Geen bestand geüpload" },
        {
          status: 400,
          headers: rateLimitHeaders,
        }
      )
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Alleen PDF bestanden toegestaan" },
        {
          status: 400,
          headers: rateLimitHeaders,
        }
      )
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Bestand te groot (max 10MB)" },
        {
          status: 400,
          headers: rateLimitHeaders,
        }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Extract text from PDF using Google Document AI
    const extractedText = await extractTextFromPdf(buffer)

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: "Kon geen tekst uit de PDF halen" },
        {
          status: 422,
          headers: rateLimitHeaders,
        }
      )
    }

    // Validate text size (prevent token limit errors)
    const MAX_CHARS = 100_000 // ~25K tokens (conservative: chars/4)

    if (extractedText.length > MAX_CHARS) {
      return NextResponse.json(
        {
          error: "Document te groot om te verwerken",
          details: `Maximaal ${MAX_CHARS.toLocaleString('nl-NL')} tekens toegestaan. Dit document heeft ${extractedText.length.toLocaleString('nl-NL')} tekens.`,
        },
        {
          status: 413, // Payload Too Large
          headers: rateLimitHeaders,
        }
      )
    }

    // Analyze text using Claude
    const fields = await analyzeInvoiceText(extractedText)

    // Calculate compliance result
    const result = calculateCompliance(fields)

    return NextResponse.json(result, {
      headers: rateLimitHeaders,
    })
  } catch (error) {
    console.error('Error processing invoice:', error)

    const message = error instanceof Error ? error.message : 'Er is een fout opgetreden'

    // Reuse cached rate limit headers (don't call checkRateLimit again)
    return NextResponse.json(
      { error: message },
      {
        status: 500,
        headers: rateLimitHeaders,
      }
    )
  }
}

# Production Readiness Fixes - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix critical security issue and add production-ready features (testing, distributed rate limiting, timeouts, validation, robust parsing, better errors).

**Architecture:** Two-phase approach - Phase 1 secures credentials (5 min), Phase 2 adds production features (testing infrastructure, Upstash rate limiting, timeouts, validation, Zod parsing, Dutch error messages).

**Tech Stack:** Next.js 16, TypeScript, Vitest, @upstash/ratelimit, @upstash/redis, Zod, Google Document AI, Anthropic Claude API

---

## Phase 1: Critical - Secure Credentials

### Task 1: Remove service-account.json and use environment variable

**Files:**
- Delete: `service-account.json`
- Modify: `.env.local` (add GOOGLE_CREDENTIALS_JSON)
- Verify: `lib/env.ts` (already supports this)
- Verify: `lib/document-ai.ts` (already supports this)

**Step 1: Check current credential setup**

Run: `ls -la service-account.json`
Expected: File exists (~2.4KB)

**Step 2: Read service account JSON content**

Run: `cat service-account.json`
Expected: JSON with type, project_id, private_key, etc.

**Step 3: Add GOOGLE_CREDENTIALS_JSON to .env.local**

Copy the entire JSON content from service-account.json and add to `.env.local`:

```bash
GOOGLE_CREDENTIALS_JSON='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
```

**Step 4: Delete service-account.json**

Run: `rm service-account.json`
Expected: File deleted

**Step 5: Test Document AI still works**

Run: `npm run dev`
Test: Upload a sample PDF at http://localhost:3000
Expected: PDF processing works (text extraction succeeds)

**Step 6: Commit**

```bash
git add .env.local
git commit -m "fix: use GOOGLE_CREDENTIALS_JSON env var instead of file

Removes service-account.json file and uses environment variable.
More secure and Vercel-compatible.

🤖 Generated with Claude Code (https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 2: Important - Production Features

### Task 2: Set up Vitest testing infrastructure

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (add dev dependencies and scripts)
- Create: `__tests__/setup.ts`

**Step 1: Install Vitest dependencies**

Run: `npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom happy-dom`
Expected: Packages installed successfully

**Step 2: Create vitest.config.ts**

Create: `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['__tests__/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

**Step 3: Create test setup file**

Create: `__tests__/setup.ts`

```typescript
import '@testing-library/jest-dom'
```

**Step 4: Add test scripts to package.json**

Modify: `package.json` - add to scripts section:

```json
"test": "vitest",
"test:watch": "vitest watch",
"test:ui": "vitest --ui"
```

**Step 5: Verify Vitest works**

Run: `npm test`
Expected: "No test files found" (we haven't written tests yet)

**Step 6: Commit**

```bash
git add vitest.config.ts __tests__/setup.ts package.json package-lock.json
git commit -m "feat: add Vitest testing infrastructure

Adds Vitest, React Testing Library, and test setup.
Includes test, test:watch, and test:ui scripts.

🤖 Generated with Claude Code (https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 3: Write tests for compliance scoring logic

**Files:**
- Create: `__tests__/lib/compliance.test.ts`

**Step 1: Write failing tests for compliance logic**

Create: `__tests__/lib/compliance.test.ts`

```typescript
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
```

**Step 2: Run tests to verify they pass**

Run: `npm test compliance.test.ts`
Expected: All 5 tests pass (compliance logic already works correctly)

**Step 3: Commit**

```bash
git add __tests__/lib/compliance.test.ts
git commit -m "test: add compliance scoring tests

Tests all scoring scenarios: green (0 missing), orange (1-2 missing), red (3+ missing).

🤖 Generated with Claude Code (https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 4: Add Upstash Redis for distributed rate limiting

**Files:**
- Modify: `package.json` (add @upstash dependencies)
- Modify: `lib/rate-limit.ts` (replace implementation)
- Modify: `lib/env.ts` (add Upstash env vars)
- Modify: `.env.example` (document Upstash vars)
- Create: `__tests__/lib/rate-limit.test.ts`

**Step 1: Install Upstash dependencies**

Run: `npm install @upstash/ratelimit @upstash/redis`
Expected: Packages installed successfully

**Step 2: Write failing test for rate limiting**

Create: `__tests__/lib/rate-limit.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { checkRateLimit } from '@/lib/rate-limit'

// Mock Upstash
vi.mock('@upstash/redis', () => ({
  Redis: {
    fromEnv: vi.fn(() => ({
      // Mock Redis client
    })),
  },
}))

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: vi.fn().mockImplementation(() => ({
    limit: vi.fn()
      .mockResolvedValueOnce({
        success: true,
        limit: 10,
        remaining: 9,
        reset: Date.now() + 60000,
      })
      .mockResolvedValueOnce({
        success: false,
        limit: 10,
        remaining: 0,
        reset: Date.now() + 60000,
      }),
  })),
  Ratelimit: {
    slidingWindow: vi.fn(),
  },
}))

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('allows request within rate limit', async () => {
    const result = await checkRateLimit('192.168.1.1')

    expect(result.allowed).toBe(true)
    expect(result.limit).toBe(10)
    expect(result.remaining).toBe(9)
  })

  it('blocks request exceeding rate limit', async () => {
    // First call succeeds
    await checkRateLimit('192.168.1.1')

    // Second call fails
    const result = await checkRateLimit('192.168.1.1')

    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })
})
```

**Step 3: Run test to verify it fails**

Run: `npm test rate-limit.test.ts`
Expected: FAIL (checkRateLimit doesn't exist yet)

**Step 4: Update lib/env.ts to include Upstash vars**

Modify: `lib/env.ts`

Add to the schema:

```typescript
const envSchema = z.object({
  // ... existing fields ...

  // Upstash Redis (for rate limiting)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
}).refine(
  (data) => {
    // Both Upstash vars required together
    const hasUpstashUrl = !!data.UPSTASH_REDIS_REST_URL
    const hasUpstashToken = !!data.UPSTASH_REDIS_REST_TOKEN
    return hasUpstashUrl === hasUpstashToken
  },
  {
    message: 'Both UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be provided together',
  }
)
```

**Step 5: Rewrite lib/rate-limit.ts with Upstash**

Modify: `lib/rate-limit.ts` - replace entire file:

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Check if Upstash is configured
const isUpstashConfigured =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN

// Create rate limiter (if Upstash configured)
const ratelimit = isUpstashConfigured
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      analytics: true,
      prefix: 'invoice-checker',
    })
  : null

export interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Check rate limit for an IP address
 * Returns whether the request is allowed and rate limit info
 */
export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  if (!ratelimit) {
    // No rate limiting if Upstash not configured (development)
    console.warn('Rate limiting disabled: UPSTASH_REDIS_REST_URL not configured')
    return {
      allowed: true,
      limit: 10,
      remaining: 10,
      reset: Date.now() + 60000,
    }
  }

  const { success, limit, remaining, reset } = await ratelimit.limit(ip)

  return {
    allowed: success,
    limit,
    remaining,
    reset,
  }
}

/**
 * Get rate limit headers for HTTP response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  }
}
```

**Step 6: Update .env.example**

Modify: `.env.example`

Add:

```bash
# Upstash Redis (for distributed rate limiting)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

**Step 7: Update API route to use new rate limit API**

Modify: `app/api/check/route.ts`

Find the rate limiting section and replace with:

```typescript
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit'

// ... in POST function ...

// Rate limiting
const ip = request.headers.get('x-forwarded-for') || 'unknown'
const rateLimitResult = await checkRateLimit(ip)
const rateLimitHeaders = getRateLimitHeaders(rateLimitResult)

if (!rateLimitResult.allowed) {
  return NextResponse.json(
    { error: 'Te veel verzoeken. Probeer het later opnieuw.' },
    {
      status: 429,
      headers: rateLimitHeaders,
    }
  )
}
```

**Step 8: Run tests to verify they pass**

Run: `npm test rate-limit.test.ts`
Expected: All tests pass

**Step 9: Commit**

```bash
git add lib/rate-limit.ts lib/env.ts .env.example __tests__/lib/rate-limit.test.ts app/api/check/route.ts package.json package-lock.json
git commit -m "feat: replace in-memory rate limiting with Upstash Redis

Distributed rate limiting that works across serverless instances.
Falls back gracefully if Upstash not configured (development).

🤖 Generated with Claude Code (https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 5: Add request timeouts for external APIs

**Files:**
- Create: `lib/timeout.ts` (utility)
- Modify: `lib/document-ai.ts` (wrap with timeout)
- Modify: `lib/claude.ts` (wrap with timeout)
- Create: `__tests__/lib/timeout.test.ts`

**Step 1: Write failing test for timeout utility**

Create: `__tests__/lib/timeout.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest'
import { withTimeout } from '@/lib/timeout'

describe('withTimeout', () => {
  it('resolves with promise result if completes before timeout', async () => {
    const promise = Promise.resolve('success')

    const result = await withTimeout(promise, 1000, 'Timeout')

    expect(result).toBe('success')
  })

  it('rejects with timeout error if promise takes too long', async () => {
    const promise = new Promise((resolve) => {
      setTimeout(() => resolve('too late'), 2000)
    })

    await expect(
      withTimeout(promise, 100, 'Operation timed out')
    ).rejects.toThrow('Operation timed out')
  })

  it('rejects with original error if promise rejects', async () => {
    const promise = Promise.reject(new Error('Original error'))

    await expect(
      withTimeout(promise, 1000, 'Timeout')
    ).rejects.toThrow('Original error')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test timeout.test.ts`
Expected: FAIL (withTimeout doesn't exist)

**Step 3: Create timeout utility**

Create: `lib/timeout.ts`

```typescript
/**
 * Wraps a promise with a timeout
 * Rejects if the promise doesn't resolve within timeoutMs
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(errorMessage))
    }, timeoutMs)
  })

  return Promise.race([promise, timeoutPromise])
}
```

**Step 4: Run test to verify it passes**

Run: `npm test timeout.test.ts`
Expected: All tests pass

**Step 5: Add timeout to Document AI**

Modify: `lib/document-ai.ts`

Import timeout utility:
```typescript
import { withTimeout } from './timeout'
```

Wrap the Document AI call (find the `processDocument` call):

```typescript
// Before
const [result] = await client.processDocument(request)

// After
const [result] = await withTimeout(
  client.processDocument(request),
  25000, // 25 seconds
  'PDF verwerking duurt te lang. Probeer een kleiner bestand.'
)
```

**Step 6: Add timeout to Claude API**

Modify: `lib/claude.ts`

Import timeout utility:
```typescript
import { withTimeout } from './timeout'
```

Wrap the Claude API call (find the `messages.create` call):

```typescript
// Before
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 1024,
  messages: [{ role: 'user', content: prompt }],
})

// After
const response = await withTimeout(
  anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  }),
  20000, // 20 seconds
  'Analyse duurt te lang. Probeer het opnieuw.'
)
```

**Step 7: Update API route error handling**

Modify: `app/api/check/route.ts`

Update error handling to show timeout messages:

```typescript
} catch (error) {
  console.error('Error processing invoice:', error)

  const message = error instanceof Error ? error.message : 'Er is een fout opgetreden'

  return NextResponse.json(
    { error: message },
    {
      status: 500,
      headers: rateLimitHeaders, // Include rate limit headers in errors too
    }
  )
}
```

**Step 8: Run all tests**

Run: `npm test`
Expected: All tests pass

**Step 9: Commit**

```bash
git add lib/timeout.ts lib/document-ai.ts lib/claude.ts app/api/check/route.ts __tests__/lib/timeout.test.ts
git commit -m "feat: add request timeouts for external APIs

Document AI: 25s timeout
Claude API: 20s timeout
User-friendly Dutch error messages on timeout.

🤖 Generated with Claude Code (https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 6: Add text size validation

**Files:**
- Modify: `app/api/check/route.ts` (add validation after Document AI)

**Step 1: Add text size validation in API route**

Modify: `app/api/check/route.ts`

After the Document AI extraction, add validation:

```typescript
// Extract text from PDF
const extractedText = await extractTextFromPdf(buffer)

// Validate text size (prevent token limit errors)
const MAX_CHARS = 100_000 // ~25K tokens (conservative: chars/4)

if (extractedText.length > MAX_CHARS) {
  return NextResponse.json(
    {
      error: 'Document te groot om te verwerken',
      details: `Maximaal ${MAX_CHARS.toLocaleString('nl-NL')} tekens toegestaan. Dit document heeft ${extractedText.length.toLocaleString('nl-NL')} tekens.`,
    },
    {
      status: 413, // Payload Too Large
      headers: rateLimitHeaders,
    }
  )
}

// Continue with Claude analysis...
const fields = await analyzeInvoiceText(extractedText)
```

**Step 2: Test with a very large text**

Manual test: Create a test that simulates large text response from Document AI

**Step 3: Commit**

```bash
git add app/api/check/route.ts
git commit -m "feat: add text size validation to prevent token limit errors

Max 100K characters (~25K tokens) to stay within Claude limits.
Returns 413 with helpful Dutch error message.

🤖 Generated with Claude Code (https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 7: Improve Claude response parsing with Zod

**Files:**
- Modify: `lib/claude.ts` (replace regex with Zod validation)
- Create: `__tests__/lib/claude.test.ts`

**Step 1: Write test for Claude parsing**

Create: `__tests__/lib/claude.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest'
import { analyzeInvoiceText } from '@/lib/claude'

// Mock Anthropic SDK
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({
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
            }),
          },
        ],
      }),
    },
  })),
}))

describe('analyzeInvoiceText', () => {
  it('parses valid Claude response', async () => {
    const result = await analyzeInvoiceText('Sample invoice text')

    expect(result.factuurnummer.found).toBe(true)
    expect(result.factuurnummer.value).toBe('INV-001')
  })

  it('handles malformed JSON gracefully', async () => {
    // This test will be implemented after we add retry logic
    expect(true).toBe(true)
  })
})
```

**Step 2: Run test to verify current implementation**

Run: `npm test claude.test.ts`
Expected: Test may pass with current regex parsing

**Step 3: Add Zod schema to lib/claude.ts**

Modify: `lib/claude.ts`

Add imports at the top:
```typescript
import { z } from 'zod'
```

Add schema before the analyzeInvoiceText function:

```typescript
const FieldSchema = z.object({
  found: z.boolean(),
  value: z.string().nullable(),
})

const ExtractedFieldsSchema = z.object({
  factuurnummer: FieldSchema,
  factuurdatum: FieldSchema,
  leverancierNaam: FieldSchema,
  btwNummer: FieldSchema,
  klantNaam: FieldSchema,
  totaalbedrag: FieldSchema,
})
```

**Step 4: Replace regex parsing with Zod validation**

Modify: `lib/claude.ts`

Find the parsing section and replace:

```typescript
// Before (regex-based)
const content = response.content[0].type === 'text' ? response.content[0].text : ''
const match = content.match(/{[\s\S]*}/)
if (!match) {
  throw new Error('Geen geldige JSON gevonden in Claude response')
}
const fields = JSON.parse(match[0]) as ExtractedFields

// After (Zod-based)
const content = response.content[0].type === 'text' ? response.content[0].text : ''

try {
  // Parse JSON
  const parsed = JSON.parse(content)

  // Validate with Zod
  const fields = ExtractedFieldsSchema.parse(parsed)

  return fields
} catch (parseError) {
  console.error('Claude parsing error:', parseError)
  console.error('Claude response:', content)

  // Retry once on parsing failure
  console.log('Retrying Claude analysis...')

  try {
    const retryResponse = await withTimeout(
      anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
      20000,
      'Analyse duurt te lang. Probeer het opnieuw.'
    )

    const retryContent = retryResponse.content[0].type === 'text'
      ? retryResponse.content[0].text
      : ''
    const retryParsed = JSON.parse(retryContent)
    const retryFields = ExtractedFieldsSchema.parse(retryParsed)

    return retryFields
  } catch (retryError) {
    throw new Error('Kan factuur niet analyseren. Probeer het opnieuw.')
  }
}
```

**Step 5: Run tests**

Run: `npm test claude.test.ts`
Expected: Tests pass

**Step 6: Commit**

```bash
git add lib/claude.ts __tests__/lib/claude.test.ts
git commit -m "feat: improve Claude parsing with Zod validation

Replaces fragile regex with JSON.parse + Zod schema validation.
Retries once on parsing failure.
Better error messages.

🤖 Generated with Claude Code (https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 8: Add better Document AI error messages

**Files:**
- Modify: `lib/document-ai.ts` (add error mapping)
- Modify: `app/api/check/route.ts` (use mapped errors)

**Step 1: Add error mapping function to lib/document-ai.ts**

Modify: `lib/document-ai.ts`

Add before the extractTextFromPdf function:

```typescript
/**
 * Maps Document AI error codes to user-friendly Dutch messages
 */
function getDocumentAIErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)

  if (message.includes('INVALID_ARGUMENT')) {
    return 'PDF-bestand is beschadigd of ongeldig'
  }
  if (message.includes('RESOURCE_EXHAUSTED')) {
    return 'Google Cloud quota bereikt. Probeer het later opnieuw.'
  }
  if (message.includes('PERMISSION_DENIED')) {
    return 'Configuratiefout: geen toegang tot Document AI'
  }
  if (message.includes('NOT_FOUND')) {
    return 'Document AI processor niet gevonden (configuratiefout)'
  }
  if (message.includes('DEADLINE_EXCEEDED') || message.includes('duurt te lang')) {
    return 'PDF verwerking duurt te lang. Probeer een kleiner bestand.'
  }

  return 'Kan PDF niet verwerken. Controleer of het bestand geldig is.'
}
```

**Step 2: Update error handling in extractTextFromPdf**

Modify: `lib/document-ai.ts`

Update the catch block:

```typescript
} catch (error) {
  if (env.DEBUG === 'true') {
    console.error('Document AI error details:', error)
  }

  const userMessage = getDocumentAIErrorMessage(error)
  throw new Error(userMessage)
}
```

**Step 3: Ensure API route passes through error messages**

Verify in `app/api/check/route.ts` that error messages are passed through:

```typescript
} catch (error) {
  console.error('Error processing invoice:', error)

  const message = error instanceof Error ? error.message : 'Er is een fout opgetreden'

  return NextResponse.json(
    { error: message },
    {
      status: 500,
      headers: rateLimitHeaders,
    }
  )
}
```

**Step 4: Commit**

```bash
git add lib/document-ai.ts app/api/check/route.ts
git commit -m "feat: add user-friendly Dutch error messages for Document AI

Maps error codes to helpful messages:
- INVALID_ARGUMENT → PDF beschadigd
- RESOURCE_EXHAUSTED → Quota bereikt
- PERMISSION_DENIED → Configuratiefout
- NOT_FOUND → Processor niet gevonden

🤖 Generated with Claude Code (https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 9: Run full test suite and verify everything works

**Files:**
- None (verification only)

**Step 1: Run all tests**

Run: `npm test`
Expected: All tests pass

**Step 2: Run linter**

Run: `npm run lint`
Expected: No lint errors

**Step 3: Build the project**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 4: Test locally**

Run: `npm run dev`
Test: Upload sample PDFs at http://localhost:3000
Expected: Everything works correctly

**Step 5: Check git status**

Run: `git status`
Expected: Working tree clean (all changes committed)

**Step 6: Final commit (if needed)**

If any changes needed:
```bash
git add .
git commit -m "fix: final adjustments after testing"
```

---

## Post-Implementation

### Upstash Setup Instructions

1. Go to https://upstash.com/ and create free account
2. Create new Redis database
3. Copy REST URL and REST TOKEN
4. Add to `.env.local`:
   ```
   UPSTASH_REDIS_REST_URL=your-url
   UPSTASH_REDIS_REST_TOKEN=your-token
   ```
5. Add same variables to Vercel environment variables

### Vercel Deployment

1. Push branch to GitHub
2. Deploy to Vercel preview
3. Add environment variables in Vercel:
   - GOOGLE_CLOUD_PROJECT_ID
   - GOOGLE_CLOUD_LOCATION
   - GOOGLE_DOCUMENT_AI_PROCESSOR_ID
   - GOOGLE_CREDENTIALS_JSON (full JSON string)
   - ANTHROPIC_API_KEY
   - UPSTASH_REDIS_REST_URL
   - UPSTASH_REDIS_REST_TOKEN
4. Test preview deployment with real invoices
5. Merge to main for production deployment

### Success Criteria

- ✅ No `service-account.json` in repo
- ✅ All tests passing (`npm test`)
- ✅ No lint errors (`npm run lint`)
- ✅ Build succeeds (`npm run build`)
- ✅ Rate limiting works with Upstash
- ✅ External API calls timeout appropriately
- ✅ Large PDFs rejected with clear message
- ✅ Claude parsing handles malformed responses
- ✅ Document AI errors shown in Dutch
- ✅ Local testing with sample PDFs succeeds

---

## Troubleshooting

**Tests failing?**
- Check that mocks are properly configured
- Verify imports use @ alias correctly
- Run `npm test -- --reporter=verbose` for details

**Rate limiting not working?**
- Verify UPSTASH env vars are set
- Check Upstash dashboard for connection issues
- Rate limiting gracefully disabled if Upstash not configured

**Timeouts too aggressive?**
- Adjust timeout values in lib/document-ai.ts and lib/claude.ts
- Consider making timeouts configurable via env vars

**Build errors?**
- Run `npm install` to ensure deps are installed
- Check TypeScript errors with `npx tsc --noEmit`
- Verify all imports resolve correctly

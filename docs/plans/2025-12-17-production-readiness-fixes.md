# Production Readiness Fixes - Design Document

**Date**: 2025-12-17
**Status**: Approved
**Target Platform**: Vercel (Serverless)
**Testing Framework**: Vitest

## Context

Code review identified 1 critical and 6 important issues preventing production deployment. This document outlines the fix strategy.

## Deployment Context

- **Platform**: Vercel (serverless)
- **Rate Limiting**: Upstash Redis (free tier: 10K req/day)
- **Testing**: Vitest with @testing-library/react
- **Credential Storage**: Environment variables only (no files)

## Phase 1: Critical - Secure Credentials

### Issue
`service-account.json` exists in repo directory. Not committed to git (verified), but risky to keep.

### Solution
1. Delete local `service-account.json` file
2. Use `GOOGLE_CREDENTIALS_JSON` environment variable (already supported in `lib/env.ts`)
3. Update `.env.local` with JSON content
4. Test Document AI functionality locally
5. Document in CLAUDE.md that production requires `GOOGLE_CREDENTIALS_JSON`

### Why This Approach
- Zero code changes required (env.ts already supports this)
- Vercel-compatible (serverless can't use file paths)
- 5-minute fix with no risk

### Files Affected
- `.env.local` (update)
- `docs/CLAUDE.md` (document the requirement)

---

## Phase 2: Important Issues

### 2.1 Testing Infrastructure

**Goal**: Set up Vitest with Next.js integration

**Tasks**:
- Install: `vitest`, `@vitest/ui`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
- Create `vitest.config.ts` with path aliases matching `tsconfig.json`
- Add scripts: `"test": "vitest"`, `"test:watch": "vitest watch"`, `"test:ui": "vitest --ui"`
- Create `__tests__` directories

**Success Criteria**: `npm test` runs successfully

---

### 2.2 Core Logic Tests

**Goal**: 80%+ coverage on business logic

**Test Coverage**:

**lib/compliance.ts**:
- Green status: 0 missing fields
- Orange status: 1 missing field
- Orange status: 2 missing fields
- Red status: 3 missing fields
- Red status: 6 missing fields (all missing)

**lib/env.ts**:
- Valid environment variables pass
- Missing required vars throw error
- Invalid ANTHROPIC_API_KEY format rejected

**lib/rate-limit.ts** (after Upstash migration):
- First request succeeds
- 11th request within window returns 429
- Reset after window expires

**Mocking Strategy**:
- Mock `@google-cloud/documentai` for API route tests
- Mock `@anthropic-ai/sdk` for Claude tests
- Use Upstash's mock Redis client for rate limit tests

---

### 2.3 Distributed Rate Limiting

**Goal**: Replace in-memory rate limiting with Upstash Redis

**Current Implementation** (`lib/rate-limit.ts`):
- In-memory `Map<string, number[]>`
- Works for single instance only
- Won't work on Vercel (multiple serverless instances)

**New Implementation**:
```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  analytics: true,
})
```

**Environment Variables**:
- `UPSTASH_REDIS_REST_URL` (from Upstash dashboard)
- `UPSTASH_REDIS_REST_TOKEN` (from Upstash dashboard)

**API Surface**: Keep same (10 req/min per IP, same headers)

**Files**:
- `lib/rate-limit.ts` (replace implementation)
- `lib/env.ts` (add Upstash env vars)
- `.env.example` (document new vars)
- `__tests__/lib/rate-limit.test.ts` (new)

---

### 2.4 Request Timeouts

**Goal**: Prevent hanging on external API calls

**Current Issue**:
- Document AI and Claude calls have no timeout
- If services hang, request waits 60s until `maxDuration`

**Solution**:
```typescript
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string
): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
  )
  return Promise.race([promise, timeout])
}
```

**Timeouts**:
- Document AI: 25 seconds (PDF processing can be slow)
- Claude API: 20 seconds (text analysis is fast)
- Total API route: 60s (Next.js `maxDuration`)

**Error Messages** (Dutch):
- Document AI timeout: "PDF verwerking duurt te lang. Probeer een kleiner bestand."
- Claude timeout: "Analyse duurt te lang. Probeer het opnieuw."

**Files**:
- `lib/document-ai.ts` (wrap call)
- `lib/claude.ts` (wrap call)
- `app/api/check/route.ts` (handle timeout errors)

---

### 2.5 Text Size Validation

**Goal**: Prevent token limit errors from Claude

**Current Issue**:
- No validation on extracted text size
- Large PDFs could exceed Claude's context window (~200K tokens)
- Need to stay under ~25K tokens for reliable processing

**Solution**:
```typescript
const MAX_CHARS = 100_000 // ~25K tokens (rough estimate: chars/4)

if (extractedText.length > MAX_CHARS) {
  return NextResponse.json(
    {
      error: 'Document te groot om te verwerken',
      details: `Maximaal ${MAX_CHARS.toLocaleString('nl-NL')} tekens toegestaan`
    },
    { status: 413 }
  )
}
```

**Token Estimation**: `chars / 4` (conservative estimate)

**Files**:
- `app/api/check/route.ts` (add validation after Document AI)

---

### 2.6 Robust Claude Parsing

**Goal**: Replace fragile regex with Zod validation

**Current Issue** (`lib/claude.ts:59-69`):
- Uses regex `/{[\s\S]*}/` to extract JSON
- Could match wrong braces
- No schema validation

**Solution**:
```typescript
import { z } from 'zod'

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

// Parse and validate
const parsed = JSON.parse(content)
const validated = ExtractedFieldsSchema.parse(parsed)
```

**Error Handling**:
- If parsing fails, log error and retry once
- If second attempt fails, return error to user
- Add fallback message: "Kan factuur niet analyseren"

**Files**:
- `lib/claude.ts` (replace regex parsing)

---

### 2.7 Better Document AI Error Messages

**Goal**: User-friendly Dutch error messages

**Current Issue** (`lib/document-ai.ts:88-101`):
- Generic technical errors shown to users
- No context or guidance

**Solution**: Map error codes to Dutch messages

```typescript
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

  return 'Kan PDF niet verwerken. Controleer of het bestand geldig is.'
}
```

**Files**:
- `lib/document-ai.ts` (add error mapping)
- `app/api/check/route.ts` (use mapped errors)

---

## Implementation Order

### Phase 1 (Critical - 15 minutes)
1. Delete `service-account.json`
2. Add `GOOGLE_CREDENTIALS_JSON` to `.env.local`
3. Test locally
4. Update CLAUDE.md

### Phase 2 (Important - 3-4 hours)
1. Testing infrastructure (30 min)
2. Core logic tests (45 min)
3. Distributed rate limiting (45 min)
4. Request timeouts (30 min)
5. Text size validation (15 min)
6. Claude parsing with Zod (30 min)
7. Document AI error messages (30 min)
8. Integration testing (30 min)

## Success Criteria

**Phase 1**:
- ✅ No `service-account.json` in repo
- ✅ `npm run dev` works with env var
- ✅ PDF upload successfully extracts text

**Phase 2**:
- ✅ `npm test` passes with 80%+ coverage
- ✅ Rate limiting works across multiple Vercel instances
- ✅ External API calls timeout appropriately
- ✅ Large PDFs rejected with clear message
- ✅ Claude parsing handles malformed responses
- ✅ Document AI errors shown in Dutch

## Risks & Mitigations

**Risk**: Upstash free tier limits (10K req/day)
**Mitigation**: Monitor usage in Upstash dashboard. Upgrade to paid tier if needed ($0.20/100K requests)

**Risk**: Tests mock too much, missing real integration issues
**Mitigation**: Add manual testing checklist with real PDFs before production deploy

**Risk**: Timeouts too short for complex PDFs
**Mitigation**: Make timeouts configurable via env vars if needed

## Next Steps

After design approval:
1. Create git worktree for isolated development
2. Generate detailed implementation plan
3. Execute Phase 1 (critical fixes)
4. Execute Phase 2 (important fixes)
5. Request code review
6. Deploy to Vercel preview
7. Test with real invoices

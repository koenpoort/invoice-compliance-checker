# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm test             # Run Vitest tests
npm test -- --ui     # Run tests with interactive UI
```

## Tech Stack

### Core Framework
- **Next.js 16.0.10** (App Router, React 18)
- **TypeScript 5** (strict mode)
- **React 18** (UI library)

### Styling
- **Tailwind CSS 3.4.1** (neo-brutalist custom theme)
- **Lucide React 0.460.0** (icons)

### External APIs
- **Google Cloud Document AI 8.10.0** (PDF text extraction)
- **Anthropic SDK 0.32.0** (Claude Sonnet 4 for field analysis)

### Infrastructure
- **Upstash Redis 1.35.8** (distributed rate limiting)
- **Upstash Ratelimit 2.0.7** (rate limiting implementation)

### Validation & Utilities
- **Zod 4.2.1** (environment variable + API response validation)

### Testing
- **Vitest 4.0.16** (test runner with 131 tests across 11 suites)
- **Testing Library React 16.3.1** (component testing)
- **jsdom 27.3.0** / **happy-dom 20.0.11** (DOM emulation)

## Environment Setup

Copy `.env.example` to `.env.local` and configure:

```bash
# Google Cloud Document AI (ALL REQUIRED)
GOOGLE_CLOUD_PROJECT_ID=your-project-number
GOOGLE_CLOUD_LOCATION=eu
GOOGLE_DOCUMENT_AI_PROCESSOR_ID=your-processor-id

# Google Credentials (ONE of these required)
# Option 1: Development (file path)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
# Option 2: Production (JSON string - recommended for serverless)
GOOGLE_CREDENTIALS_JSON={"type":"service_account",...full JSON...}

# Anthropic Claude API (REQUIRED)
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Upstash Redis (OPTIONAL - for distributed rate limiting)
# If not provided, falls back to in-memory rate limiting
# Both variables must be provided together or omitted together
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Optional
DEBUG=true  # Enables detailed logging in document-ai.ts
```

**Important:** Production deploys should use `GOOGLE_CREDENTIALS_JSON` (not file paths). Both Upstash variables must be provided together or omitted together. Environment variables are validated with Zod schema in `lib/env.ts`.

## Architecture

This app validates Dutch freelancer (zzp'er) invoices against NL/EU tax requirements.

**API Flow** (`app/api/check/route.ts`):
1. **Rate Limiting** - `lib/rate-limit.ts` enforces 10 requests/min per IP using Upstash Redis (distributed, multi-instance safe) with automatic fallback to in-memory if Upstash not configured
2. **File Validation** - PDF only, max 10MB
3. **Text Size Validation** - Extracted text must be ≤100,000 characters to prevent token limit errors
4. **Text Extraction** - `lib/document-ai.ts` sends PDF to Google Document AI (25-second timeout, user-friendly Dutch error messages)
5. **Field Analysis** - `lib/claude.ts` uses Claude Sonnet 4 (model: `claude-sonnet-4-20250514`) to identify 14 required invoice fields with Zod validation, markdown code fence stripping, and retry logic (1 retry on parse/validation failure, 20-second timeout):
   - factuurnummer (invoice number)
   - factuurdatum (invoice date)
   - leverancierNaam (vendor name)
   - btwNummer (VAT number)
   - klantNaam (customer name)
   - totaalbedrag (total amount)
   - kvkNummer (KVK/Chamber of Commerce number)
   - leverancierAdres (vendor address - must be complete: street, number, postal code, city)
   - klantAdres (customer address - must be complete)
   - omschrijving (description of goods/services with quantity)
   - leveringsdatum (delivery date)
   - bedragExclBtw (amount excluding VAT)
   - btwTarief (VAT rate: 0%, 9%, or 21%)
   - btwBedrag (VAT amount)
6. **Compliance Scoring** - `lib/compliance.ts` returns status:
   - Green: 0 missing fields (compliant)
   - Orange: 1-2 missing fields (warning)
   - Red: 3+ missing fields (not compliant)

**Page State Machine** (`app/page.tsx`):
- "upload" → "loading" → "result" → reset to "upload"

**Components:**
- `app/page.tsx` - Main client component with state management
- `components/upload-zone.tsx` - Drag & drop PDF upload (max 10MB)
- `components/loading-state.tsx` - Animated loading spinner
- `components/result-display.tsx` - Traffic light status with field checklist
- `components/ui/button.tsx` - Reusable button (primary/secondary/outline variants)
- `components/ui/card.tsx` - Reusable card with optional hover effect

**Rate Limiting:**
- Upstash Redis implementation (distributed, multi-instance safe)
- Automatic fallback to in-memory if Upstash not configured (logs warning)
- Sliding window: 10 requests per minute per IP
- Returns headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- Configure via `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (optional)

## Testing

Test suite built with **Vitest 4.0.16** and **Testing Library**. Run tests with:

```bash
npm test              # Run all tests
npm test -- --ui      # Open interactive test UI
npm test -- --watch   # Watch mode
```

**Test Coverage (131 tests across 11 suites):**

### Library Tests (36 tests)

1. **`__tests__/lib/compliance.test.ts`** (8 tests)
   - Green status (0 missing fields)
   - Orange status (1-2 missing fields)
   - Red status (3+ missing fields)

2. **`__tests__/lib/rate-limit.test.ts`** (2 tests)
   - Allowed requests within limit
   - Blocked requests exceeding limit

3. **`__tests__/lib/rate-limit-fallback.test.ts`** (4 tests)
   - Fallback mode when Upstash not configured
   - Correct fallback values
   - Warning logging
   - Header generation

4. **`__tests__/lib/timeout.test.ts`** (3 tests)
   - Promise resolves before timeout
   - Promise rejects on timeout
   - Original error preserved

5. **`__tests__/lib/claude.test.ts`** (9 tests)
   - Valid Claude response parsing with Zod
   - Retry on JSON parse failure
   - Retry on Zod validation failure
   - Error when both attempts fail
   - Required fields validation
   - Address field parsing
   - Incomplete address handling
   - Markdown code fence stripping

6. **`__tests__/lib/document-ai.test.ts`** (10 tests)
   - Text extraction from valid PDF
   - Error handling for empty responses
   - Dutch error message mapping (INVALID_ARGUMENT, RESOURCE_EXHAUSTED, PERMISSION_DENIED, NOT_FOUND, DEADLINE_EXCEEDED)
   - Generic error fallback

### Component Tests (95 tests, updated test data for 14 fields)

7. **`__tests__/components/button.test.tsx`** (21 tests)
8. **`__tests__/components/card.test.tsx`** (26 tests)
9. **`__tests__/components/loading-state.test.tsx`** (8 tests)
10. **`__tests__/components/upload-zone.test.tsx`** (20 tests)
11. **`__tests__/components/result-display.test.tsx`** (20 tests)

**Configuration:**
- `vitest.config.ts` - jsdom environment, global test functions
- `eslint.config.mjs` - ESLint 9 flat config
- `__tests__/setup.ts` - Testing Library matchers

## Design System

Neo-brutalism theme with bold black borders. Custom Tailwind classes in `tailwind.config.ts`:

**Colors:**
- `neo-bg: #FFFDF5` (cream background)
- `neo-fg: #000000` (black foreground)
- `neo-accent: #FF3B3B` (red accent)
- `neo-secondary: #FFE500` (yellow secondary)
- `neo-muted: #A78BFA` (purple muted)

**Shadows:**
- `neo-sm` (4px), `neo-md` (8px), `neo-lg` (12px), `neo-xl` (16px)

**Font:**
- Space Grotesk (weights: 400, 500, 700)

**Background Patterns:**
- Radial grid dots (24px × 24px)
- Utility classes: `bg-halftone`, `bg-grid`, `bg-noise`

**Animations:**
- `spin-slow`, `pulse-gentle`, `bounce-gentle`, `fade-in-up`
- Respects `prefers-reduced-motion`

## Security

- Security headers configured in `next.config.mjs` (X-Frame-Options, CSP, etc.)
- No file storage (stateless processing)
- Strict TypeScript types throughout
- Environment validation with Zod
- PDF validation (type + size)
- Text size validation (max 100,000 chars)
- Zod validation of API responses from Claude
- Timeout protection (25s Document AI, 20s Claude)
- Rate limiting per IP

## Language

All UI text and Claude prompts are in Dutch.

## ESLint

Uses ESLint 9 with flat config (`eslint.config.mjs`):

```bash
npm run lint          # Run ESLint
```

Key rules:
- TypeScript strict mode with unused var warnings
- React hooks rules enforced
- Console statements allowed (for DEBUG logging)
- Test files excluded from linting

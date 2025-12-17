# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Tech Stack

- **Next.js 16.0.10** (App Router, React 18)
- **TypeScript 5** (strict mode)
- **Tailwind CSS 3.4.1** (neo-brutalist custom theme)
- **Google Cloud Document AI 8.10.0** (PDF text extraction)
- **Anthropic SDK 0.32.0** (Claude Sonnet 4 for field analysis)
- **Zod 4.2.1** (environment variable validation)
- **Lucide React 0.460.0** (icons)

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

# Optional
DEBUG=true  # Enables detailed logging in document-ai.ts
```

**Important:** Production deploys should use `GOOGLE_CREDENTIALS_JSON` (not file paths). Environment variables are validated with Zod schema in `lib/env.ts`.

## Architecture

This app validates Dutch freelancer (zzp'er) invoices against NL/EU tax requirements.

**API Flow** (`app/api/check/route.ts`):
1. **Rate Limiting** - `lib/rate-limit.ts` enforces 10 requests/min per IP (in-memory)
2. **File Validation** - PDF only, max 10MB
3. **Text Extraction** - `lib/document-ai.ts` sends PDF to Google Document AI
4. **Field Analysis** - `lib/claude.ts` uses Claude Sonnet 4 to identify 6 required invoice fields:
   - factuurnummer (invoice number)
   - factuurdatum (invoice date)
   - leverancierNaam (vendor name)
   - btwNummer (VAT number)
   - klantNaam (customer name)
   - totaalbedrag (total amount)
5. **Compliance Scoring** - `lib/compliance.ts` returns status:
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
- In-memory implementation (single-instance only)
- For multi-instance production: use Upstash, Redis, or Vercel Edge Config
- Returns headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

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
- Rate limiting per IP

## Language

All UI text and Claude prompts are in Dutch.

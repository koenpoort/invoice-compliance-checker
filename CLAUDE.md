# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Environment Setup

Copy `.env.example` to `.env.local` and configure:
- `GOOGLE_CLOUD_PROJECT_ID`, `GOOGLE_CLOUD_LOCATION`, `GOOGLE_DOCUMENT_AI_PROCESSOR_ID` - Google Document AI
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to service account JSON (local dev only)
- `ANTHROPIC_API_KEY` - Claude API key

## Architecture

This app validates Dutch freelancer (zzp'er) invoices against NL/EU tax requirements.

**API Flow** (`app/api/check/route.ts`):
1. **Text Extraction** - `lib/document-ai.ts` sends PDF to Google Document AI
2. **Field Analysis** - `lib/claude.ts` uses Claude Sonnet 4 to identify invoice fields (factuurnummer, factuurdatum, leverancier naam, BTW nummer, klant naam, totaalbedrag)
3. **Compliance Scoring** - `lib/compliance.ts` returns status: green (0 missing), orange (1-2 missing), red (3+ missing)

**Components:**
- `app/page.tsx` - Main client component with state management
- `components/upload-zone.tsx` - Drag & drop PDF upload (max 10MB)
- `components/result-display.tsx` - Traffic light status with field checklist

## Design System

Neomorphism theme with bold black borders. Custom Tailwind classes:
- Colors: `cream` (background), `red` (accent), `yellow` (secondary)
- Shadows: `neo-sm` (4px), `neo-md` (8px), `neo-lg` (12px), `neo-xl` (16px)
- Font: Space Grotesk

## Language

All UI text and Claude prompts are in Dutch.

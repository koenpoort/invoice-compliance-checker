import { NextResponse } from "next/server"

/**
 * Health check endpoint to diagnose environment configuration
 * Returns status of all required environment variables (without exposing values)
 */
export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    checks: {
      GOOGLE_CLOUD_PROJECT_ID: !!process.env.GOOGLE_CLOUD_PROJECT_ID,
      GOOGLE_CLOUD_LOCATION: !!process.env.GOOGLE_CLOUD_LOCATION,
      GOOGLE_DOCUMENT_AI_PROCESSOR_ID: !!process.env.GOOGLE_DOCUMENT_AI_PROCESSOR_ID,
      GOOGLE_CREDENTIALS_JSON: !!process.env.GOOGLE_CREDENTIALS_JSON,
      GOOGLE_CREDENTIALS_JSON_IS_VALID_JSON: (() => {
        try {
          if (!process.env.GOOGLE_CREDENTIALS_JSON) return false
          JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON)
          return true
        } catch {
          return false
        }
      })(),
      ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
      ANTHROPIC_API_KEY_FORMAT: process.env.ANTHROPIC_API_KEY?.startsWith('sk-ant-') ?? false,
      UPSTASH_REDIS_REST_URL: !!process.env.UPSTASH_REDIS_REST_URL,
      UPSTASH_REDIS_REST_TOKEN: !!process.env.UPSTASH_REDIS_REST_TOKEN,
    },
    issues: [] as string[],
  }

  // Check for issues
  if (!checks.checks.GOOGLE_CLOUD_PROJECT_ID) {
    checks.issues.push("GOOGLE_CLOUD_PROJECT_ID is missing")
  }
  if (!checks.checks.GOOGLE_DOCUMENT_AI_PROCESSOR_ID) {
    checks.issues.push("GOOGLE_DOCUMENT_AI_PROCESSOR_ID is missing")
  }
  if (!checks.checks.GOOGLE_CREDENTIALS_JSON) {
    checks.issues.push("GOOGLE_CREDENTIALS_JSON is missing (required for production)")
  }
  if (!checks.checks.GOOGLE_CREDENTIALS_JSON_IS_VALID_JSON) {
    checks.issues.push("GOOGLE_CREDENTIALS_JSON is not valid JSON")
  }
  if (!checks.checks.ANTHROPIC_API_KEY) {
    checks.issues.push("ANTHROPIC_API_KEY is missing")
  }
  if (!checks.checks.ANTHROPIC_API_KEY_FORMAT) {
    checks.issues.push("ANTHROPIC_API_KEY doesn't start with 'sk-ant-'")
  }

  const allHealthy = checks.issues.length === 0

  return NextResponse.json(
    {
      status: allHealthy ? "healthy" : "unhealthy",
      ...checks,
    },
    {
      status: allHealthy ? 200 : 500,
    }
  )
}

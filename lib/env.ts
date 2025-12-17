import { z } from "zod"

/**
 * Environment variable validation schema
 * Validates all required environment variables at startup
 */
const envSchema = z.object({
  // Google Cloud Document AI
  GOOGLE_CLOUD_PROJECT_ID: z
    .string()
    .min(1, "GOOGLE_CLOUD_PROJECT_ID is required"),
  GOOGLE_CLOUD_LOCATION: z.string().default("eu"),
  GOOGLE_DOCUMENT_AI_PROCESSOR_ID: z
    .string()
    .min(1, "GOOGLE_DOCUMENT_AI_PROCESSOR_ID is required"),

  // Credentials (one of these is required)
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
  GOOGLE_CREDENTIALS_JSON: z.string().optional(),

  // Anthropic Claude API
  ANTHROPIC_API_KEY: z
    .string()
    .min(1, "ANTHROPIC_API_KEY is required")
    .startsWith("sk-ant-", "ANTHROPIC_API_KEY must start with 'sk-ant-'"),

  // Upstash Redis (for rate limiting)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DEBUG: z
    .string()
    .optional()
    .transform((val) => val === "true"),
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

// Validate and export typed environment variables
function validateEnv() {
  try {
    const parsed = envSchema.parse(process.env)

    // Additional validation: ensure credentials are properly configured
    if (parsed.NODE_ENV === "production") {
      // Production: Require GOOGLE_CREDENTIALS_JSON (serverless-friendly)
      if (!parsed.GOOGLE_CREDENTIALS_JSON) {
        throw new Error(
          "GOOGLE_CREDENTIALS_JSON is required in production environments. " +
            "Set it to the full JSON content of your service account file."
        )
      }
    } else {
      // Development: Require at least one credential method
      if (
        !parsed.GOOGLE_APPLICATION_CREDENTIALS &&
        !parsed.GOOGLE_CREDENTIALS_JSON
      ) {
        throw new Error(
          "Either GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_CREDENTIALS_JSON must be set in development"
        )
      }
    }

    // Validate GOOGLE_CREDENTIALS_JSON is valid JSON if provided
    if (parsed.GOOGLE_CREDENTIALS_JSON) {
      try {
        JSON.parse(parsed.GOOGLE_CREDENTIALS_JSON)
      } catch {
        throw new Error(
          "GOOGLE_CREDENTIALS_JSON contains invalid JSON. Please check the format."
        )
      }
    }

    return parsed
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Environment variable validation failed:")
      error.issues.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`)
      })
      throw new Error("Invalid environment configuration")
    }
    throw error
  }
}

// Export validated environment variables
export const env = validateEnv()

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>

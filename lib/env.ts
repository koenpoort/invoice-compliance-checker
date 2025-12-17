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

  // Environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DEBUG: z
    .string()
    .optional()
    .transform((val) => val === "true"),
})

// Validate and export typed environment variables
function validateEnv() {
  try {
    const parsed = envSchema.parse(process.env)

    // Additional validation: ensure at least one credential method is provided
    if (
      !parsed.GOOGLE_APPLICATION_CREDENTIALS &&
      !parsed.GOOGLE_CREDENTIALS_JSON &&
      parsed.NODE_ENV !== "production"
    ) {
      throw new Error(
        "Either GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_CREDENTIALS_JSON must be set in development"
      )
    }

    return parsed
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Environment variable validation failed:")
      error.errors.forEach((err) => {
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

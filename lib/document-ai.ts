import { DocumentProcessorServiceClient } from "@google-cloud/documentai"
import { readFileSync } from "fs"
import { env } from "./env"

const projectId = env.GOOGLE_CLOUD_PROJECT_ID
const location = env.GOOGLE_CLOUD_LOCATION
const processorId = env.GOOGLE_DOCUMENT_AI_PROCESSOR_ID
const credentialsPath = env.GOOGLE_APPLICATION_CREDENTIALS
const credentialsJson = env.GOOGLE_CREDENTIALS_JSON
const isProduction = env.NODE_ENV === "production"
const DEBUG = env.DEBUG

export async function extractTextFromPdf(
  fileBuffer: Buffer
): Promise<string> {
  // Debug logging (only in development or when DEBUG=true)
  if (DEBUG) {
    console.log("=== Document AI Configuration ===")
    console.log("Project ID:", projectId ? "***" : "missing")
    console.log("Location:", location)
    console.log("Processor ID:", processorId ? "***" : "missing")
    console.log("Environment:", isProduction ? "production" : "development")
  }

  if (!projectId || !processorId) {
    throw new Error("Google Document AI credentials not configured")
  }

  // Load credentials based on environment
  let credentials
  try {
    if (credentialsJson) {
      // Production: Use JSON credentials from environment variable
      if (DEBUG) console.log("Loading credentials from GOOGLE_CREDENTIALS_JSON env var")
      credentials = JSON.parse(credentialsJson)
    } else if (credentialsPath && !isProduction) {
      // Development: Load from file
      if (DEBUG) console.log("Loading credentials from file:", credentialsPath)
      credentials = JSON.parse(readFileSync(credentialsPath, "utf-8"))
    } else if (isProduction) {
      // Production: Use default credentials (Google Cloud environment)
      if (DEBUG) console.log("Using default Google Cloud credentials")
      credentials = undefined // Will use application default credentials
    } else {
      throw new Error(
        "No credentials configured. Set GOOGLE_CREDENTIALS_JSON or GOOGLE_APPLICATION_CREDENTIALS"
      )
    }

    if (DEBUG) console.log("Credentials loaded successfully")
  } catch (error) {
    console.error("Failed to load credentials:", error)
    throw new Error("Could not load Google Cloud credentials")
  }

  // Initialize client with explicit credentials and regional endpoint
  const apiEndpoint = `${location}-documentai.googleapis.com`
  if (DEBUG) console.log("API Endpoint:", apiEndpoint)

  const client = new DocumentProcessorServiceClient({
    credentials,
    projectId,
    apiEndpoint,
  })

  const name = `projects/${projectId}/locations/${location}/processors/${processorId}`
  if (DEBUG) console.log("Processor name:", name)

  const request = {
    name,
    rawDocument: {
      content: fileBuffer.toString("base64"),
      mimeType: "application/pdf",
    },
  }

  try {
    if (DEBUG) console.log("Calling Document AI API...")
    const [result] = await client.processDocument(request)
    const { document } = result

    if (!document?.text) {
      throw new Error("Could not extract text from PDF")
    }

    if (DEBUG) console.log("Text extraction successful, length:", document.text.length)
    return document.text
  } catch (error: any) {
    // Always log errors, but limit detail in production
    if (DEBUG) {
      console.error("Document AI Error Details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        metadata: error.metadata,
      })
    } else {
      console.error("Document AI Error:", error.message, "Code:", error.code)
    }
    throw error
  }
}

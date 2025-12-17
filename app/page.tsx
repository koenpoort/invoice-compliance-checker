"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { UploadZone } from "@/components/upload-zone"
import { LoadingState } from "@/components/loading-state"
import { ResultDisplay, ComplianceResult } from "@/components/result-display"

type AppState = "upload" | "loading" | "result"

export default function Home() {
  const [state, setState] = useState<AppState>("upload")
  const [result, setResult] = useState<ComplianceResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = async (file: File) => {
    setState("loading")
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/check", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Er ging iets mis")
      }

      const data = await response.json()
      setResult(data)
      setState("result")
    } catch (err) {
      console.error("Upload error:", err)
      setError(err instanceof Error ? err.message : "Er ging iets mis")
      setState("upload")
    }
  }

  const handleReset = () => {
    setState("upload")
    setResult(null)
    setError(null)
  }

  return (
    <main className="min-h-screen bg-neo-bg">
      {/* Header */}
      <header className="border-b-4 border-black bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 border-4 border-black bg-neo-secondary shadow-neo-sm flex items-center justify-center -rotate-12 transition-transform duration-300 hover:rotate-12 hover:scale-110">
              <Star className="w-6 h-6" strokeWidth={3} fill="black" />
            </div>
            <span className="text-xl font-bold uppercase tracking-tight">
              Factuur Checker
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* Hero text - only show on upload state */}
        {state === "upload" && (
          <div className="text-center mb-12">
            <div className="rotate-1 inline-block mb-6">
              <div className="border-4 border-black bg-white shadow-neo-lg px-12 py-8">
                <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter">
                  Check je factuur
                </h1>
              </div>
            </div>
            <p className="text-xl md:text-2xl font-bold max-w-2xl mx-auto">
              Controleer of je factuur voldoet aan alle Nederlandse wettelijke
              eisen. <span className="text-neo-accent">Gratis</span>, zonder
              account.
            </p>
          </div>
        )}

        {/* Error banner */}
        {error && state === "upload" && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="border-4 border-black bg-neo-accent p-4 shadow-neo-sm">
              <p className="font-bold text-center">{error}</p>
            </div>
          </div>
        )}

        {/* Dynamic content based on state */}
        {state === "upload" && (
          <UploadZone onFileSelect={handleFileSelect} />
        )}

        {state === "loading" && <LoadingState />}

        {state === "result" && result && (
          <ResultDisplay result={result} onReset={handleReset} />
        )}
      </div>

      {/* Footer */}
      <footer className="border-t-4 border-black bg-black mt-auto">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center font-bold text-sm text-white">
            Made for Dutch freelancers (zzp&apos;ers) who want peace of mind
            before sending invoices.
          </p>
        </div>
      </footer>
    </main>
  )
}

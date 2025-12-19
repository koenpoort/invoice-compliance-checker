"use client"

import { useCallback, useState, useRef, useId } from "react"
import { FileText, Upload, Zap, CheckCircle2 } from "lucide-react"
import { Button } from "./ui/button"

interface UploadZoneProps {
  onFileSelect: (file: File) => void
  isLoading?: boolean
}

export function UploadZone({ onFileSelect, isLoading = false }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropzoneId = useId()
  const errorId = useId()
  const instructionsId = useId()

  const handleFile = useCallback(
    (file: File) => {
      setError(null)
      setSelectedFileName(null)

      if (file.type !== "application/pdf") {
        setError("Alleen PDF-bestanden zijn toegestaan. Selecteer een geldig PDF-bestand.")
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        setError("Dit bestand is te groot (maximaal 10MB toegestaan).")
        return
      }

      setSelectedFileName(file.name)
      onFileSelect(file)
    },
    [onFileSelect]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    // Only set isDragging to false if we're leaving the dropzone entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false)
    }
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFile(file)
      }
      // Reset input so same file can be selected again
      e.target.value = ""
    },
    [handleFile]
  )

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      inputRef.current?.click()
    }
  }, [])

  const handleButtonClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  return (
    <section
      className="w-full max-w-2xl mx-auto"
      aria-labelledby={dropzoneId}
    >
      {/* Main dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onKeyDown={handleKeyDown}
        tabIndex={isLoading ? -1 : 0}
        role="button"
        aria-describedby={`${instructionsId} ${error ? errorId : ""}`}
        aria-busy={isLoading}
        aria-disabled={isLoading}
        className={`
          relative
          border-4 border-dashed
          bg-neo-surface
          p-8 md:p-12
          text-center
          transition-all duration-200
          cursor-pointer
          focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neo-muted focus-visible:ring-offset-2 focus-visible:ring-offset-neo-bg
          ${isDragging
            ? "border-neo-success bg-neo-success/10 scale-[1.02] border-solid"
            : "border-neo-fg hover:border-neo-muted hover:bg-neo-muted/5"
          }
          ${isLoading ? "opacity-50 pointer-events-none cursor-not-allowed" : ""}
          ${error ? "border-neo-accent" : ""}
        `}
      >
        {/* Rotated headline */}
        <div className="-rotate-2 mb-6">
          <h2
            id={dropzoneId}
            className="text-3xl md:text-5xl font-bold uppercase tracking-tight"
          >
            Drop je factuur hier
          </h2>
        </div>

        {/* Icon with animation */}
        <div
          className={`
            inline-flex items-center justify-center
            w-20 h-20 md:w-24 md:h-24
            border-4 border-neo-fg
            bg-neo-secondary
            shadow-neo-sm
            mb-6
            transition-all duration-300
            ${isDragging ? "rotate-12 scale-110 bg-neo-success" : "-rotate-6 hover:rotate-0 hover:scale-105"}
          `}
          aria-hidden="true"
        >
          <FileText className="w-10 h-10 md:w-12 md:h-12" strokeWidth={2.5} />
        </div>

        {/* Instructions */}
        <p id={instructionsId} className="text-lg font-bold mb-6">
          Sleep een PDF hierheen of{" "}
          <span className="underline decoration-neo-secondary decoration-4 underline-offset-4">
            klik om te selecteren
          </span>
        </p>

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleInputChange}
          className="sr-only"
          disabled={isLoading}
          aria-label="Selecteer een PDF-bestand om te uploaden"
          tabIndex={-1}
        />

        {/* Upload button */}
        <Button
          variant="secondary"
          size="lg"
          onClick={handleButtonClick}
          disabled={isLoading}
          type="button"
          aria-label="Selecteer een PDF-bestand"
        >
          <Upload className="w-5 h-5" strokeWidth={3} aria-hidden="true" />
          Selecteer PDF
        </Button>

        {/* Success indicator when file is selected */}
        {selectedFileName && !error && (
          <div
            className="mt-6 p-4 border-4 border-neo-fg bg-neo-success/20 animate-fade-in-up"
            role="status"
            aria-live="polite"
          >
            <p className="font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
              {selectedFileName}
            </p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div
            id={errorId}
            className="mt-6 p-4 border-4 border-neo-fg bg-neo-accent/20 animate-shake"
            role="alert"
            aria-live="assertive"
          >
            <p className="font-bold">{error}</p>
          </div>
        )}
      </div>

      {/* Trust signals below dropzone */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2 font-bold text-neo-fg/70">
          <Zap className="w-4 h-4 text-neo-secondary" aria-hidden="true" />
          <span>Alleen PDF, max 10MB</span>
        </div>
        <div className="hidden sm:block w-1 h-1 rounded-full bg-neo-fg/30" aria-hidden="true" />
        <div className="flex items-center gap-2 font-bold text-neo-fg/70">
          <CheckCircle2 className="w-4 h-4 text-neo-success" aria-hidden="true" />
          <span>GDPR-compliant</span>
        </div>
        <div className="hidden sm:block w-1 h-1 rounded-full bg-neo-fg/30" aria-hidden="true" />
        <div className="flex items-center gap-2 font-bold text-neo-fg/70">
          <CheckCircle2 className="w-4 h-4 text-neo-success" aria-hidden="true" />
          <span>Geen opslag</span>
        </div>
      </div>
    </section>
  )
}

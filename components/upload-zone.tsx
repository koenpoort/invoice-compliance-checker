"use client"

import { useCallback, useState } from "react"
import { FileText, Upload } from "lucide-react"
import { Button } from "./ui/button"

interface UploadZoneProps {
  onFileSelect: (file: File) => void
  isLoading?: boolean
}

export function UploadZone({ onFileSelect, isLoading = false }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = useCallback(
    (file: File) => {
      setError(null)

      if (file.type !== "application/pdf") {
        setError("Alleen PDF bestanden toegestaan")
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        setError("Bestand te groot (max 10MB)")
        return
      }

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
    setIsDragging(false)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile]
  )

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative
          border-4 border-dashed border-black
          bg-white
          p-12
          text-center
          transition-colors duration-200
          ${isDragging ? "bg-neo-secondary" : ""}
          ${isLoading ? "opacity-50 pointer-events-none" : ""}
        `}
      >
        {/* Rotated headline */}
        <div className="-rotate-2 mb-8">
          <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tight">
            Drop je factuur hier
          </h2>
        </div>

        {/* Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 border-4 border-black bg-neo-muted shadow-neo-sm mb-8 transition-all duration-200 hover:shadow-neo-md hover:-translate-y-1 active:shadow-none active:translate-y-0 cursor-pointer">
          <FileText className="w-12 h-12" strokeWidth={3} />
        </div>

        {/* Subtext */}
        <p className="text-lg font-bold mb-8">
          Sleep een PDF of klik om te uploaden
        </p>

        {/* Hidden file input */}
        <input
          type="file"
          accept="application/pdf"
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />

        {/* Upload button (decorative, click triggers input) */}
        <Button variant="secondary" className="pointer-events-none">
          <Upload className="w-5 h-5 mr-2" strokeWidth={3} />
          Selecteer PDF
        </Button>

        {/* Error message */}
        {error && (
          <div className="mt-6 p-4 border-4 border-black bg-neo-accent">
            <p className="font-bold uppercase">{error}</p>
          </div>
        )}
      </div>

      {/* Format hint */}
      <p className="mt-4 text-center text-sm font-bold text-black/60">
        Alleen PDF bestanden, maximaal 10MB
      </p>
    </div>
  )
}

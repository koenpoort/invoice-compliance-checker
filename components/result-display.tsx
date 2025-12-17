"use client"

import { Check, X, AlertTriangle, RefreshCw, ExternalLink } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"

export interface FieldResult {
  name: string
  found: boolean
  value?: string
}

export interface ComplianceResult {
  status: "green" | "orange" | "red"
  fields: FieldResult[]
}

interface ResultDisplayProps {
  result: ComplianceResult
  onReset: () => void
}

const statusConfig = {
  green: {
    label: "GOEDGEKEURD",
    bg: "bg-green-400",
    rotation: "rotate-3",
    icon: Check,
    message: "Je factuur bevat alle verplichte velden!",
  },
  orange: {
    label: "LET OP",
    bg: "bg-neo-secondary",
    rotation: "-rotate-2",
    icon: AlertTriangle,
    message: "Enkele velden ontbreken mogelijk op je factuur.",
  },
  red: {
    label: "NIET COMPLIANT",
    bg: "bg-neo-accent",
    rotation: "rotate-2",
    icon: X,
    message: "Belangrijke velden ontbreken op je factuur.",
  },
}

const fieldLabels: Record<string, string> = {
  factuurnummer: "Factuurnummer",
  factuurdatum: "Factuurdatum",
  leverancierNaam: "Naam leverancier",
  btwNummer: "BTW-nummer",
  klantNaam: "Naam klant",
  totaalbedrag: "Totaalbedrag",
}

export function ResultDisplay({ result, onReset }: ResultDisplayProps) {
  const config = statusConfig[result.status]
  const StatusIcon = config.icon
  const foundCount = result.fields.filter((f) => f.found).length
  const totalCount = result.fields.length

  // Playful rotation pattern for cards
  const cardRotations = ["-rotate-1", "rotate-1", "-rotate-2", "rotate-2", "rotate-1", "-rotate-1"]

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Status badge */}
      <div className={`${config.rotation} mb-8`}>
        <div
          className={`
            inline-block
            border-4 border-black
            ${config.bg}
            shadow-neo-lg
            px-8 py-6
          `}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 border-4 border-black bg-white flex items-center justify-center rotate-6 shadow-neo-sm">
              <StatusIcon className="w-8 h-8" strokeWidth={3} />
            </div>
            <span className="text-4xl md:text-5xl font-bold uppercase tracking-tight">
              {config.label}
            </span>
          </div>
        </div>
      </div>

      {/* Message */}
      <p className="text-xl font-bold text-center mb-8">{config.message}</p>

      {/* Score */}
      <div className="text-center mb-8">
        <span className="text-6xl font-bold">{foundCount}</span>
        <span className="text-3xl font-bold text-black/40">/{totalCount}</span>
        <p className="text-sm font-bold uppercase tracking-widest mt-2">
          velden gevonden
        </p>
      </div>

      {/* Field checklist */}
      <div className="space-y-3 mb-8">
        {result.fields.map((field, index) => (
          <Card
            key={field.name}
            hover={false}
            className={`shadow-neo-sm transition-all duration-300 ${cardRotations[index % cardRotations.length]} hover:rotate-0 hover:scale-[1.02] hover:shadow-neo-md animate-fade-in-up`}
            style={{
              animationDelay: `${index * 100}ms`,
              opacity: 0,
            }}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`
                    w-10 h-10 border-4 border-black flex items-center justify-center
                    transition-transform duration-300 hover:rotate-12
                    ${field.found ? "bg-green-400 -rotate-3" : "bg-neo-accent rotate-3"}
                  `}
                >
                  {field.found ? (
                    <Check className="w-6 h-6" strokeWidth={3} />
                  ) : (
                    <X className="w-6 h-6" strokeWidth={3} />
                  )}
                </div>
                <span className="font-bold text-lg">
                  {fieldLabels[field.name] || field.name}
                </span>
              </div>
              {field.found && field.value && (
                <span className="text-sm font-bold text-black/60 truncate max-w-[200px]">
                  {field.value}
                </span>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button variant="secondary" onClick={onReset}>
          <RefreshCw className="w-5 h-5 mr-2" strokeWidth={3} />
          Check nog een factuur
        </Button>
      </div>

      {/* Disclaimer */}
      <div className="mt-12 p-6 border-4 border-black bg-neo-muted/30">
        <p className="text-sm font-bold text-center">
          Dit is een hulpmiddel, geen vervanging van een boekhouder of fiscaal
          adviseur.{" "}
          <a
            href="https://www.belastingdienst.nl/wps/wcm/connect/nl/btw/content/waaraan-moet-een-factuur-voldoen"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 underline hover:text-neo-accent"
          >
            Officiële factuureisen
            <ExternalLink className="w-4 h-4" strokeWidth={3} />
          </a>
        </p>
      </div>
    </div>
  )
}

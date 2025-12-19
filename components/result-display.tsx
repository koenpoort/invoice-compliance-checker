"use client"

import { useEffect, useState, useId } from "react"
import { Check, X, AlertTriangle, RefreshCw, ExternalLink, PartyPopper, Shield } from "lucide-react"
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
    bg: "bg-neo-success",
    textColor: "text-white",
    rotation: "rotate-3",
    icon: Check,
    celebrationIcon: PartyPopper,
    message: "Uitstekend! Je factuur bevat alle verplichte velden.",
    ariaLabel: "Factuur goedgekeurd - alle velden aanwezig",
  },
  orange: {
    label: "LET OP",
    bg: "bg-neo-secondary",
    textColor: "text-neo-fg",
    rotation: "-rotate-2",
    icon: AlertTriangle,
    celebrationIcon: Shield,
    message: "Enkele velden ontbreken mogelijk. Controleer de onderstaande lijst.",
    ariaLabel: "Factuur vereist aandacht - sommige velden ontbreken",
  },
  red: {
    label: "NIET COMPLIANT",
    bg: "bg-neo-accent",
    textColor: "text-white",
    rotation: "rotate-2",
    icon: X,
    celebrationIcon: Shield,
    message: "Belangrijke velden ontbreken. Deze factuur voldoet niet aan de eisen.",
    ariaLabel: "Factuur niet compliant - belangrijke velden ontbreken",
  },
}

const fieldLabels: Record<string, { label: string; description: string }> = {
  factuurnummer: {
    label: "Factuurnummer",
    description: "Uniek identificatienummer van de factuur",
  },
  factuurdatum: {
    label: "Factuurdatum",
    description: "Datum waarop de factuur is opgesteld",
  },
  leverancierNaam: {
    label: "Naam leverancier",
    description: "De volledige bedrijfsnaam van de leverancier",
  },
  btwNummer: {
    label: "BTW-nummer",
    description: "Het BTW-identificatienummer van de leverancier",
  },
  klantNaam: {
    label: "Naam klant",
    description: "De volledige naam of bedrijfsnaam van de klant",
  },
  totaalbedrag: {
    label: "Totaalbedrag",
    description: "Het totale factuurbedrag inclusief BTW",
  },
}

// Confetti component for celebration
function Confetti({ count = 20 }: { count?: number }) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)
  }, [])

  if (prefersReducedMotion) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => {
        const colors = ["bg-neo-secondary", "bg-neo-success", "bg-neo-muted", "bg-neo-accent"]
        const color = colors[i % colors.length]
        const left = Math.random() * 100
        const delay = Math.random() * 0.5
        const size = 8 + Math.random() * 8

        return (
          <div
            key={i}
            className={`absolute ${color} rotate-45`}
            style={{
              left: `${left}%`,
              top: "-20px",
              width: `${size}px`,
              height: `${size}px`,
              animation: `fall 2s ease-out ${delay}s forwards`,
            }}
          />
        )
      })}
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

export function ResultDisplay({ result, onReset }: ResultDisplayProps) {
  const config = statusConfig[result.status]
  const StatusIcon = config.icon
  const CelebrationIcon = config.celebrationIcon
  const foundCount = result.fields.filter((f) => f.found).length
  const totalCount = result.fields.length
  const [showConfetti, setShowConfetti] = useState(false)

  const headingId = useId()
  const descriptionId = useId()

  // Trigger confetti for green status
  useEffect(() => {
    if (result.status === "green") {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [result.status])

  // Playful rotation pattern for cards
  const cardRotations = ["-rotate-1", "rotate-1", "-rotate-2", "rotate-2", "rotate-1", "-rotate-1"]

  return (
    <section
      className="w-full max-w-2xl mx-auto"
      aria-labelledby={headingId}
      aria-describedby={descriptionId}
    >
      {/* Confetti celebration for green status */}
      {showConfetti && <Confetti />}

      {/* Status badge */}
      <div className={`${config.rotation} mb-8`}>
        <div
          className={`
            inline-block
            border-4 border-neo-fg
            ${config.bg}
            shadow-neo-lg
            px-6 py-4 md:px-8 md:py-6
            animate-scale-in
          `}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-3 md:gap-4">
            <div
              className="w-10 h-10 md:w-12 md:h-12 border-4 border-neo-fg bg-neo-surface flex items-center justify-center rotate-6 shadow-neo-sm"
              aria-hidden="true"
            >
              <StatusIcon className="w-6 h-6 md:w-8 md:h-8" strokeWidth={3} />
            </div>
            <h1
              id={headingId}
              className={`text-2xl md:text-4xl lg:text-5xl font-bold uppercase tracking-tight ${config.textColor}`}
            >
              {config.label}
            </h1>
            {result.status === "green" && (
              <CelebrationIcon
                className="w-8 h-8 text-neo-secondary animate-wiggle hidden md:block"
                aria-hidden="true"
              />
            )}
          </div>
        </div>
      </div>

      {/* Screen reader accessible status */}
      <p className="sr-only" role="status">
        {config.ariaLabel}. {foundCount} van de {totalCount} velden gevonden.
      </p>

      {/* Message */}
      <p
        id={descriptionId}
        className="text-lg md:text-xl font-bold text-center mb-8"
      >
        {config.message}
      </p>

      {/* Score with progress visualization */}
      <div className="text-center mb-8">
        <div className="inline-block border-4 border-neo-fg bg-neo-surface shadow-neo-sm p-4 md:p-6 -rotate-1">
          <span className="text-5xl md:text-6xl font-bold" aria-hidden="true">
            {foundCount}
          </span>
          <span className="text-2xl md:text-3xl font-bold text-neo-fg/40" aria-hidden="true">
            /{totalCount}
          </span>
          <p className="text-sm font-bold uppercase tracking-widest mt-2">
            velden gevonden
          </p>
        </div>
      </div>

      {/* Field checklist */}
      <div className="space-y-3 mb-8" role="list" aria-label="Controlelijst factuureisen">
        {result.fields.map((field, index) => {
          const fieldInfo = fieldLabels[field.name] || { label: field.name, description: "" }

          return (
            <Card
              key={field.name}
              as="article"
              hover={false}
              className={`
                shadow-neo-sm transition-all duration-300
                ${cardRotations[index % cardRotations.length]}
                hover:rotate-0 hover:scale-[1.02] hover:shadow-neo-md
                animate-fade-in-up
                focus-within:ring-4 focus-within:ring-neo-muted focus-within:ring-offset-2
              `}
              style={{
                animationDelay: `${index * 80}ms`,
                opacity: 0,
              }}
              role="listitem"
            >
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                  <div
                    className={`
                      flex-shrink-0
                      w-8 h-8 md:w-10 md:h-10 border-4 border-neo-fg flex items-center justify-center
                      transition-transform duration-300
                      ${field.found ? "bg-neo-success -rotate-3" : "bg-neo-accent rotate-3"}
                    `}
                    aria-hidden="true"
                  >
                    {field.found ? (
                      <Check className="w-4 h-4 md:w-6 md:h-6 text-white" strokeWidth={3} />
                    ) : (
                      <X className="w-4 h-4 md:w-6 md:h-6 text-white" strokeWidth={3} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-base md:text-lg">
                      {fieldInfo.label}
                      <span className="sr-only">
                        : {field.found ? "gevonden" : "niet gevonden"}
                      </span>
                    </p>
                    {fieldInfo.description && (
                      <p className="text-xs md:text-sm text-neo-fg/60 truncate">
                        {fieldInfo.description}
                      </p>
                    )}
                  </div>
                </div>
                {field.found && field.value && (
                  <span
                    className="text-xs md:text-sm font-bold text-neo-fg/60 truncate max-w-[120px] md:max-w-[200px] flex-shrink-0"
                    title={field.value}
                  >
                    {field.value}
                  </span>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          variant="secondary"
          size="lg"
          onClick={onReset}
          aria-label="Controleer een nieuwe factuur"
        >
          <RefreshCw className="w-5 h-5" strokeWidth={3} aria-hidden="true" />
          Check nog een factuur
        </Button>
      </div>

      {/* Disclaimer */}
      <aside
        className="mt-12 p-6 border-4 border-neo-fg bg-neo-muted/20"
        aria-label="Disclaimer"
      >
        <p className="text-sm font-bold text-center">
          Dit is een hulpmiddel, geen vervanging van een boekhouder of fiscaal
          adviseur.{" "}
          <a
            href="https://www.belastingdienst.nl/wps/wcm/connect/nl/btw/content/waaraan-moet-een-factuur-voldoen"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 underline decoration-neo-secondary decoration-2 underline-offset-2 hover:text-neo-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neo-muted"
          >
            Officiële factuureisen
            <ExternalLink className="w-4 h-4" strokeWidth={3} aria-hidden="true" />
            <span className="sr-only">(opent in nieuw tabblad)</span>
          </a>
        </p>
      </aside>
    </section>
  )
}

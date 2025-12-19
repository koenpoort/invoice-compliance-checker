"use client"

import { useState, useEffect } from "react"
import {
  Star,
  Zap,
  Shield,
  Clock,
  Users,
  CheckCircle2,
  ArrowRight,
} from "lucide-react"
import { UploadZone } from "@/components/upload-zone"
import { LoadingState } from "@/components/loading-state"
import { ResultDisplay, ComplianceResult } from "@/components/result-display"

type AppState = "upload" | "loading" | "result"

// Social proof counter component
function AnimatedCounter({ target, label }: { target: number; label: string }) {
  const [count, setCount] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)
  }, [])

  useEffect(() => {
    if (prefersReducedMotion) {
      setCount(target)
      return
    }

    const duration = 2000
    const steps = 60
    const increment = target / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [target, prefersReducedMotion])

  return (
    <div className="text-center">
      <div className="text-3xl md:text-5xl font-bold tabular-nums">
        {count.toLocaleString("nl-NL")}+
      </div>
      <div className="text-sm md:text-base font-bold uppercase tracking-wider text-neo-fg/70 mt-1">
        {label}
      </div>
    </div>
  )
}

// Trust badge component
function TrustBadge({
  icon: Icon,
  text,
  highlight = false,
}: {
  icon: typeof Zap
  text: string
  highlight?: boolean
}) {
  return (
    <div
      className={`
        inline-flex items-center gap-2 px-4 py-2
        border-4 border-neo-fg
        font-bold text-sm uppercase tracking-wide
        shadow-neo-sm
        transition-all duration-200
        hover:shadow-neo-md hover:-translate-y-0.5
        ${highlight ? "bg-neo-secondary -rotate-1" : "bg-neo-surface rotate-1"}
      `}
    >
      <Icon className="w-4 h-4" strokeWidth={3} aria-hidden="true" />
      <span>{text}</span>
    </div>
  )
}

// Testimonial component
function Testimonial({
  quote,
  author,
  role,
  rotation,
}: {
  quote: string
  author: string
  role: string
  rotation: string
}) {
  return (
    <blockquote
      className={`
        relative
        border-4 border-neo-fg bg-neo-surface
        p-6
        shadow-neo-md
        ${rotation}
        transition-all duration-300
        hover:rotate-0 hover:scale-[1.02] hover:shadow-neo-lg
      `}
    >
      <div
        className="absolute -top-4 -left-2 text-6xl font-bold text-neo-secondary leading-none"
        aria-hidden="true"
      >
        &ldquo;
      </div>
      <p className="text-base md:text-lg font-bold mb-4 pl-4">{quote}</p>
      <footer className="flex items-center gap-3">
        <div
          className="w-10 h-10 border-4 border-neo-fg bg-neo-muted flex items-center justify-center font-bold text-white"
          aria-hidden="true"
        >
          {author.charAt(0)}
        </div>
        <div>
          <cite className="not-italic font-bold">{author}</cite>
          <p className="text-sm text-neo-fg/60">{role}</p>
        </div>
      </footer>
    </blockquote>
  )
}

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
        throw new Error(errorData.error || "Er ging iets mis bij het verwerken")
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
    <>
      {/* Skip link for keyboard navigation */}
      <a
        href="#main-content"
        className="skip-link"
      >
        Ga naar hoofdinhoud
      </a>

      <div className="min-h-screen bg-neo-bg flex flex-col">
        {/* Header */}
        <header className="border-b-4 border-neo-fg bg-neo-surface">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <a
                href="/"
                className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neo-muted rounded-sm"
                aria-label="Factuur Checker - Ga naar homepagina"
              >
                <div
                  className="w-12 h-12 border-4 border-neo-fg bg-neo-secondary shadow-neo-sm flex items-center justify-center -rotate-12 transition-transform duration-300 hover:rotate-12 hover:scale-110"
                  aria-hidden="true"
                >
                  <Star className="w-6 h-6" strokeWidth={3} fill="currentColor" />
                </div>
                <span className="text-xl font-bold uppercase tracking-tight">
                  Factuur Checker
                </span>
              </a>

              {/* Quick trust signals in header */}
              <div className="hidden md:flex items-center gap-4">
                <span className="flex items-center gap-2 text-sm font-bold text-neo-fg/70">
                  <Shield className="w-4 h-4 text-neo-success" aria-hidden="true" />
                  100% Gratis
                </span>
                <span className="flex items-center gap-2 text-sm font-bold text-neo-fg/70">
                  <Clock className="w-4 h-4 text-neo-secondary" aria-hidden="true" />
                  30 sec check
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main id="main-content" className="flex-1">
          <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
            {/* Hero section - only show on upload state */}
            {state === "upload" && (
              <>
                {/* Hero */}
                <section className="text-center mb-12" aria-labelledby="hero-heading">
                  {/* Urgency tag */}
                  <div className="mb-6 animate-fade-in-up">
                    <span
                      className="inline-flex items-center gap-2 px-4 py-2 border-4 border-neo-fg bg-neo-accent text-white font-bold text-sm uppercase tracking-wider shadow-neo-sm -rotate-2"
                    >
                      <Zap className="w-4 h-4" aria-hidden="true" />
                      Check in 30 seconden
                    </span>
                  </div>

                  {/* Main headline */}
                  <div className="rotate-1 inline-block mb-6">
                    <div className="border-4 border-neo-fg bg-neo-surface shadow-neo-lg px-6 py-6 md:px-12 md:py-8">
                      <h1
                        id="hero-heading"
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tighter"
                      >
                        Check je factuur
                      </h1>
                    </div>
                  </div>

                  {/* Subheadline */}
                  <p className="text-lg md:text-xl lg:text-2xl font-bold max-w-2xl mx-auto mb-8">
                    Controleer of je factuur voldoet aan alle{" "}
                    <span className="underline decoration-neo-secondary decoration-4 underline-offset-4">
                      Nederlandse wettelijke eisen
                    </span>
                    .{" "}
                    <span className="text-neo-accent">Gratis</span>, zonder account.
                  </p>

                  {/* Trust badges */}
                  <div
                    className="flex flex-wrap justify-center gap-3 md:gap-4 mb-8"
                    role="list"
                    aria-label="Voordelen"
                  >
                    <div role="listitem">
                      <TrustBadge icon={Shield} text="GDPR Compliant" />
                    </div>
                    <div role="listitem">
                      <TrustBadge icon={Zap} text="Direct resultaat" highlight />
                    </div>
                    <div role="listitem">
                      <TrustBadge icon={CheckCircle2} text="Geen registratie" />
                    </div>
                  </div>
                </section>

                {/* Error banner */}
                {error && (
                  <div className="max-w-2xl mx-auto mb-8" role="alert" aria-live="assertive">
                    <div className="border-4 border-neo-fg bg-neo-accent/20 p-4 shadow-neo-sm animate-shake">
                      <p className="font-bold text-center">{error}</p>
                    </div>
                  </div>
                )}

                {/* Upload zone */}
                <UploadZone onFileSelect={handleFileSelect} />

                {/* How it works section */}
                <section
                  className="mt-16 md:mt-24"
                  aria-labelledby="how-it-works-heading"
                >
                  <h2
                    id="how-it-works-heading"
                    className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-center mb-8 -rotate-1"
                  >
                    Hoe werkt het?
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {[
                      {
                        step: 1,
                        title: "Upload",
                        description: "Sleep je PDF-factuur in het uploadveld",
                        rotation: "-rotate-2",
                        bg: "bg-neo-secondary",
                      },
                      {
                        step: 2,
                        title: "Analyse",
                        description: "AI controleert alle verplichte velden",
                        rotation: "rotate-1",
                        bg: "bg-neo-muted",
                      },
                      {
                        step: 3,
                        title: "Resultaat",
                        description: "Direct inzicht of je factuur compliant is",
                        rotation: "-rotate-1",
                        bg: "bg-neo-success",
                      },
                    ].map((item, index) => (
                      <article
                        key={item.step}
                        className={`
                          border-4 border-neo-fg ${item.bg} p-6 shadow-neo-md
                          ${item.rotation}
                          transition-all duration-300
                          hover:rotate-0 hover:scale-[1.02] hover:shadow-neo-lg
                          animate-fade-in-up
                        `}
                        style={{ animationDelay: `${index * 100}ms`, opacity: 0 }}
                      >
                        <div
                          className="w-12 h-12 border-4 border-neo-fg bg-neo-surface flex items-center justify-center font-bold text-2xl mb-4 rotate-3"
                          aria-hidden="true"
                        >
                          {item.step}
                        </div>
                        <h3 className="text-xl font-bold uppercase mb-2">{item.title}</h3>
                        <p className="font-bold text-neo-fg/80">{item.description}</p>
                      </article>
                    ))}
                  </div>
                </section>

                {/* Social proof section */}
                <section
                  className="mt-16 md:mt-24"
                  aria-labelledby="social-proof-heading"
                >
                  <h2 id="social-proof-heading" className="sr-only">
                    Statistieken en reviews
                  </h2>

                  {/* Stats */}
                  <div className="border-4 border-neo-fg bg-neo-surface shadow-neo-lg p-6 md:p-8 mb-12 rotate-1">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <AnimatedCounter target={12847} label="Facturen gecheckt" />
                      <AnimatedCounter target={98} label="% Tevreden" />
                      <AnimatedCounter target={2500} label="ZZP'ers" />
                      <AnimatedCounter target={30} label="Sec gemiddeld" />
                    </div>
                  </div>

                  {/* Testimonials */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    <Testimonial
                      quote="Eindelijk zekerheid dat mijn facturen compleet zijn. Scheelt me zoveel stress!"
                      author="Maria V."
                      role="Freelance Designer"
                      rotation="-rotate-1"
                    />
                    <Testimonial
                      quote="Supersnel en betrouwbaar. Gebruik het nu voor elke factuur die ik verstuur."
                      author="Thomas B."
                      role="IT Consultant"
                      rotation="rotate-2"
                    />
                  </div>
                </section>

                {/* CTA section */}
                <section className="mt-16 md:mt-24 text-center">
                  <div className="border-4 border-neo-fg bg-neo-secondary shadow-neo-lg p-8 md:p-12 -rotate-1 inline-block">
                    <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight mb-4">
                      Klaar om te beginnen?
                    </h2>
                    <p className="font-bold text-neo-fg/80 mb-6 max-w-md mx-auto">
                      Upload je factuur en krijg direct inzicht. Geen account nodig.
                    </p>
                    <a
                      href="#main-content"
                      className="inline-flex items-center gap-2 px-8 py-4 border-4 border-neo-fg bg-neo-fg text-neo-bg font-bold uppercase tracking-wide shadow-neo-sm hover:shadow-neo-md hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neo-muted focus-visible:ring-offset-2"
                    >
                      Start nu
                      <ArrowRight className="w-5 h-5" aria-hidden="true" />
                    </a>
                  </div>
                </section>
              </>
            )}

            {/* Loading state */}
            {state === "loading" && <LoadingState />}

            {/* Result state */}
            {state === "result" && result && (
              <ResultDisplay result={result} onReset={handleReset} />
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t-4 border-neo-fg bg-neo-fg mt-auto">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="font-bold text-sm text-neo-bg text-center md:text-left">
                Made for Dutch freelancers (zzp&apos;ers) who want peace of mind.
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="https://www.belastingdienst.nl/wps/wcm/connect/nl/btw/content/waaraan-moet-een-factuur-voldoen"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-neo-bg/70 hover:text-neo-secondary underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neo-secondary"
                >
                  Officiële eisen
                  <span className="sr-only">(opent in nieuw tabblad)</span>
                </a>
                <span className="text-neo-bg/40" aria-hidden="true">|</span>
                <span className="text-sm font-bold text-neo-bg/70">
                  <Users className="w-4 h-4 inline mr-1" aria-hidden="true" />
                  Voor ZZP&apos;ers
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

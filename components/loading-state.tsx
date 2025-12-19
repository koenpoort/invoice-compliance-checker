"use client"

import { useEffect, useState } from "react"
import { FileSearch, Sparkles, CheckCircle2 } from "lucide-react"

const LOADING_STEPS = [
  { id: 1, text: "Document uploaden...", icon: FileSearch },
  { id: 2, text: "Tekst analyseren...", icon: Sparkles },
  { id: 3, text: "Velden controleren...", icon: CheckCircle2 },
] as const

export function LoadingState() {
  const [currentStep, setCurrentStep] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [])

  // Progress through steps
  useEffect(() => {
    if (currentStep >= LOADING_STEPS.length - 1) return

    const timer = setTimeout(() => {
      setCurrentStep((prev) => Math.min(prev + 1, LOADING_STEPS.length - 1))
    }, 2500)

    return () => clearTimeout(timer)
  }, [currentStep])

  const CurrentIcon = LOADING_STEPS[currentStep].icon

  return (
    <section
      className="w-full max-w-md mx-auto text-center"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label="Factuur wordt gecontroleerd"
    >
      <div
        className={`
          border-4 border-neo-fg bg-neo-surface shadow-neo-lg p-8 md:p-12
          ${prefersReducedMotion ? "" : "rotate-2"}
        `}
      >
        {/* Animated icon container */}
        <div
          className={`
            inline-flex items-center justify-center
            w-24 h-24
            border-4 border-neo-fg
            bg-neo-secondary
            mb-8
            shadow-neo-sm
            ${prefersReducedMotion ? "" : "-rotate-6 animate-float"}
          `}
          aria-hidden="true"
        >
          <CurrentIcon
            className={`w-12 h-12 ${prefersReducedMotion ? "" : "animate-pulse-gentle"}`}
            strokeWidth={2.5}
          />
        </div>

        {/* Loading text */}
        <div className={prefersReducedMotion ? "" : "rotate-1"}>
          <h2 className="text-2xl md:text-4xl font-bold uppercase tracking-widest">
            Even checken...
          </h2>
        </div>

        {/* Current step text */}
        <p
          className="mt-4 text-lg font-bold text-neo-fg/70"
          key={currentStep}
        >
          {LOADING_STEPS[currentStep].text}
        </p>

        {/* Progress steps */}
        <nav
          className="mt-8"
          aria-label="Voortgang van de controle"
        >
          <ol className="flex justify-center gap-3">
            {LOADING_STEPS.map((step, index) => {
              const isActive = index === currentStep
              const isComplete = index < currentStep

              return (
                <li
                  key={step.id}
                  className="flex items-center"
                >
                  <span
                    className={`
                      w-10 h-10 md:w-12 md:h-12
                      flex items-center justify-center
                      border-4 border-neo-fg
                      font-bold text-lg
                      transition-all duration-300
                      ${isComplete
                        ? "bg-neo-success text-white"
                        : isActive
                          ? `bg-neo-secondary ${prefersReducedMotion ? "" : "animate-pulse-gentle"}`
                          : "bg-neo-surface text-neo-fg/40"
                      }
                    `}
                    aria-current={isActive ? "step" : undefined}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                    ) : (
                      <span aria-hidden="true">{index + 1}</span>
                    )}
                    <span className="sr-only">
                      Stap {index + 1}: {step.text}
                      {isComplete ? " (voltooid)" : isActive ? " (bezig)" : " (wachtend)"}
                    </span>
                  </span>

                  {/* Connector line */}
                  {index < LOADING_STEPS.length - 1 && (
                    <div
                      className={`
                        w-6 h-1
                        border-y-2 border-neo-fg
                        transition-colors duration-300
                        ${isComplete ? "bg-neo-success" : "bg-neo-surface"}
                      `}
                      aria-hidden="true"
                    />
                  )}
                </li>
              )
            })}
          </ol>
        </nav>

        {/* Animated dots for users who prefer motion */}
        {!prefersReducedMotion && (
          <div className="flex justify-center gap-2 mt-8" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 border-2 border-neo-fg bg-neo-accent"
                style={{
                  animation: `bounce-gentle 1s ease-in-out ${i * 0.15}s infinite`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Screen reader announcement */}
      <div className="sr-only" aria-live="polite">
        Je factuur wordt gecontroleerd. Dit kan enkele seconden duren.
      </div>
    </section>
  )
}

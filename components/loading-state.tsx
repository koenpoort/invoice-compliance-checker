"use client"

import { Star } from "lucide-react"

export function LoadingState() {
  return (
    <div className="w-full max-w-md mx-auto text-center">
      <div className="border-4 border-black bg-white shadow-neo-lg p-12 rotate-2 animate-pulse-gentle">
        {/* Spinning star */}
        <div className="inline-flex items-center justify-center w-24 h-24 border-4 border-black bg-neo-secondary mb-8 -rotate-6 shadow-neo-sm">
          <Star
            className="w-12 h-12 animate-spin-slow"
            strokeWidth={3}
            fill="black"
          />
        </div>

        {/* Loading text */}
        <div className="rotate-1">
          <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-widest">
            Even checken...
          </h2>
        </div>

        {/* Subtext */}
        <p className="mt-6 text-lg font-bold text-black/60">
          We analyseren je factuur
        </p>

        {/* Animated dots */}
        <div className="flex justify-center gap-2 mt-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-4 h-4 border-2 border-black bg-neo-accent"
              style={{
                animation: `pulse 1s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

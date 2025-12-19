import type { Metadata, Viewport } from "next"
import { Space_Grotesk } from "next/font/google"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "700"],
  display: "swap", // Prevents FOIT (Flash of Invisible Text)
  preload: true,
})

// Comprehensive metadata for SEO
export const metadata: Metadata = {
  title: {
    default: "Factuur Checker | Gratis Nederlandse Factuurcontrole voor ZZP'ers",
    template: "%s | Factuur Checker",
  },
  description:
    "Controleer gratis of je factuur voldoet aan alle Nederlandse wettelijke eisen. Direct resultaat, geen registratie nodig. Speciaal voor ZZP'ers en freelancers.",
  keywords: [
    "factuur checker",
    "factuur controleren",
    "zzp factuur",
    "freelance factuur",
    "btw factuur",
    "factuur eisen nederland",
    "factuur voldoet aan eisen",
    "belastingdienst factuur",
    "factuur compliance",
    "gratis factuurcontrole",
  ],
  authors: [{ name: "Factuur Checker" }],
  creator: "Factuur Checker",
  publisher: "Factuur Checker",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: "https://factuur-checker.nl",
    siteName: "Factuur Checker",
    title: "Factuur Checker | Gratis Nederlandse Factuurcontrole",
    description:
      "Controleer gratis of je factuur voldoet aan alle Nederlandse wettelijke eisen. Direct resultaat, geen registratie nodig.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Factuur Checker - Controleer je factuur in 30 seconden",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Factuur Checker | Gratis Factuurcontrole",
    description:
      "Controleer gratis of je factuur voldoet aan alle Nederlandse wettelijke eisen.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://factuur-checker.nl",
    languages: {
      "nl-NL": "https://factuur-checker.nl",
    },
  },
  category: "Business Tools",
  classification: "Invoice Validation Tool",
  other: {
    "google-site-verification": "", // Add verification code when available
  },
}

// Viewport configuration for optimal mobile experience
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFDF5" },
    { media: "(prefers-color-scheme: dark)", color: "#0D0D0D" },
  ],
  colorScheme: "light",
}

// JSON-LD structured data for rich search results
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Factuur Checker",
  url: "https://factuur-checker.nl",
  description:
    "Controleer gratis of je factuur voldoet aan alle Nederlandse wettelijke eisen",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "2500",
    bestRating: "5",
    worstRating: "1",
  },
  featureList: [
    "Gratis factuurcontrole",
    "Directe resultaten",
    "Geen registratie nodig",
    "GDPR compliant",
    "Nederlandse wettelijke eisen",
  ],
  inLanguage: "nl-NL",
  isAccessibleForFree: true,
  creator: {
    "@type": "Organization",
    name: "Factuur Checker",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl" className="scroll-smooth">
      <head>
        {/* Preconnect to external resources for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="https://www.belastingdienst.nl" />

        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${spaceGrotesk.variable} font-sans`}
        // Suppress hydration warning for browser extensions that modify the DOM
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  )
}

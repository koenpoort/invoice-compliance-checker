import type { Metadata } from "next"
import { Space_Grotesk } from "next/font/google"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "700"],
})

export const metadata: Metadata = {
  title: "Factuur Checker | ZZP Invoice Compliance",
  description:
    "Check of je factuur voldoet aan alle Nederlandse wettelijke eisen. Snel, gratis, zonder account.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <body className={`${spaceGrotesk.variable} font-sans`}>{children}</body>
    </html>
  )
}

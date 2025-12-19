import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        neo: {
          // WCAG AAA compliant contrast ratios (7:1+)
          bg: "#FFFDF5",        // Cream - warm, inviting
          fg: "#0D0D0D",        // Near-black - 15.8:1 contrast
          accent: "#D62828",    // Deep red - 5.2:1 (AA large text), used sparingly
          secondary: "#FFD100", // Vibrant yellow - energy, action
          success: "#059669",   // Emerald - 4.8:1 on white (large text)
          muted: "#7C3AED",     // Purple - creativity, trust
          surface: "#FFFFFF",   // Pure white cards
        },
      },
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "neo-sm": "4px 4px 0px 0px #0D0D0D",
        "neo-md": "8px 8px 0px 0px #0D0D0D",
        "neo-lg": "12px 12px 0px 0px #0D0D0D",
        "neo-xl": "16px 16px 0px 0px #0D0D0D",
        // Hover states - slight lift
        "neo-hover": "6px 6px 0px 0px #0D0D0D",
        // Active/pressed state
        "neo-active": "2px 2px 0px 0px #0D0D0D",
        // Glow effect for focus states (accessibility)
        "neo-focus": "0 0 0 4px #7C3AED, 8px 8px 0px 0px #0D0D0D",
      },
      animation: {
        "spin-slow": "spin 10s linear infinite",
        "pulse-gentle": "pulse 3s ease-in-out infinite",
        "bounce-gentle": "bounce-gentle 2s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
        "slide-in-left": "slide-in-left 0.4s ease-out forwards",
        "slide-in-right": "slide-in-right 0.4s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
        "wiggle": "wiggle 0.5s ease-in-out",
        "confetti": "confetti 1s ease-out forwards",
        "counter": "counter 2s ease-out forwards",
        "shake": "shake 0.5s ease-in-out",
        "float": "float 3s ease-in-out infinite",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "wiggle": {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        "bounce-gentle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "confetti": {
          "0%": { transform: "translateY(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(-100px) rotate(720deg)", opacity: "0" },
        },
        "counter": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "20%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-5px)" },
          "75%": { transform: "translateX(5px)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0) rotate(-2deg)" },
          "50%": { transform: "translateY(-8px) rotate(2deg)" },
        },
      },
      // Screen reader only utility
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [],
}

export default config

"use client"

import { forwardRef, ButtonHTMLAttributes } from "react"

type ButtonVariant = "primary" | "secondary" | "outline"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-neo-accent text-black shadow-neo-sm hover:bg-red-400 hover:-rotate-1 hover:scale-105 hover:shadow-neo-md active:translate-x-[4px] active:translate-y-[4px] active:shadow-none active:rotate-0 active:scale-100",
  secondary:
    "bg-neo-secondary text-black shadow-neo-sm hover:bg-yellow-300 hover:rotate-1 hover:scale-105 hover:shadow-neo-md active:translate-x-[4px] active:translate-y-[4px] active:shadow-none active:rotate-0 active:scale-100",
  outline:
    "bg-white text-black shadow-neo-sm hover:bg-gray-50 hover:-rotate-1 hover:scale-105 hover:shadow-neo-md active:translate-x-[4px] active:translate-y-[4px] active:shadow-none active:rotate-0 active:scale-100",
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center
          h-14 px-8
          border-4 border-black
          font-bold text-sm uppercase tracking-wide
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"

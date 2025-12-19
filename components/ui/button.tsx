"use client"

import { forwardRef, ButtonHTMLAttributes } from "react"

type ButtonVariant = "primary" | "secondary" | "outline" | "success"
type ButtonSize = "sm" | "md" | "lg"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-neo-accent text-neo-fg shadow-neo-sm hover:brightness-110 hover:-rotate-1 hover:scale-105 hover:shadow-neo-md active:translate-x-[4px] active:translate-y-[4px] active:shadow-none active:rotate-0 active:scale-100",
  secondary:
    "bg-neo-secondary text-neo-fg shadow-neo-sm hover:brightness-110 hover:rotate-1 hover:scale-105 hover:shadow-neo-md active:translate-x-[4px] active:translate-y-[4px] active:shadow-none active:rotate-0 active:scale-100",
  success:
    "bg-neo-success text-white shadow-neo-sm hover:brightness-110 hover:-rotate-1 hover:scale-105 hover:shadow-neo-md active:translate-x-[4px] active:translate-y-[4px] active:shadow-none active:rotate-0 active:scale-100",
  outline:
    "bg-neo-surface text-neo-fg shadow-neo-sm hover:bg-gray-50 hover:-rotate-1 hover:scale-105 hover:shadow-neo-md active:translate-x-[4px] active:translate-y-[4px] active:shadow-none active:rotate-0 active:scale-100",
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-xs",
  md: "h-14 px-8 text-sm",
  lg: "h-16 px-10 text-base",
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading

    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center gap-2
          border-4 border-neo-fg
          font-bold uppercase tracking-wide
          transition-all duration-200
          focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neo-muted focus-visible:ring-offset-2 focus-visible:ring-offset-neo-bg
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-neo-sm
          ${sizeStyles[size]}
          ${variantStyles[variant]}
          ${className}
        `}
        disabled={isDisabled}
        aria-busy={isLoading}
        aria-disabled={isDisabled}
        {...props}
      >
        {isLoading && (
          <span
            className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"

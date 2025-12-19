"use client"

import { forwardRef, HTMLAttributes } from "react"

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  as?: "div" | "article" | "section" | "aside"
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", hover = true, as: Component = "div", children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={`
          border-4 border-neo-fg bg-neo-surface shadow-neo-md
          ${hover ? "transition-all duration-200 hover:-translate-y-1 hover:shadow-neo-lg" : ""}
          ${className}
        `}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

Card.displayName = "Card"

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  as?: "div" | "header"
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className = "", as: Component = "div", children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={`border-b-4 border-neo-fg p-6 ${className}`}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

CardHeader.displayName = "CardHeader"

export const CardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className = "", children, ...props }, ref) => {
  return (
    <div ref={ref} className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  )
})

CardContent.displayName = "CardContent"

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  as?: "div" | "footer"
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className = "", as: Component = "div", children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={`border-t-4 border-neo-fg p-6 ${className}`}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

CardFooter.displayName = "CardFooter"

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoadingState } from '@/components/loading-state'

describe('LoadingState', () => {
  describe('rendering', () => {
    it('renders the main heading', () => {
      render(<LoadingState />)
      expect(screen.getByRole('heading', { name: /even checken/i })).toBeInTheDocument()
    })

    it('renders the initial step text', () => {
      render(<LoadingState />)
      const stepTexts = screen.getAllByText(/document uploaden/i)
      expect(stepTexts.length).toBeGreaterThan(0)
    })

    it('renders progress navigation', () => {
      render(<LoadingState />)
      const nav = screen.getByRole('navigation', { name: /voortgang/i })
      expect(nav).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has role="status" for live updates', () => {
      render(<LoadingState />)
      const sections = screen.getAllByRole('status')
      expect(sections.length).toBeGreaterThan(0)
    })

    it('has aria-live="polite" for screen reader announcements', () => {
      render(<LoadingState />)
      const section = document.querySelector('[aria-live="polite"]')
      expect(section).toBeInTheDocument()
    })

    it('has aria-label describing the process', () => {
      render(<LoadingState />)
      const section = document.querySelector('[aria-label="Factuur wordt gecontroleerd"]')
      expect(section).toBeInTheDocument()
    })

    it('has sr-only announcement', () => {
      render(<LoadingState />)
      expect(screen.getByText(/je factuur wordt gecontroleerd/i)).toHaveClass('sr-only')
    })
  })

  describe('visual elements', () => {
    it('renders step connector lines', () => {
      render(<LoadingState />)
      const connectors = document.querySelectorAll('.w-6.h-1')
      expect(connectors.length).toBe(2) // 2 connectors for 3 steps
    })
  })
})

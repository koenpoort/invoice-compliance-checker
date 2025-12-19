import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  describe('rendering', () => {
    it('renders children correctly', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
    })

    it('applies default variant (primary) styles', () => {
      render(<Button>Primary</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-neo-accent')
    })

    it('applies secondary variant styles', () => {
      render(<Button variant="secondary">Secondary</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-neo-secondary')
    })

    it('applies success variant styles', () => {
      render(<Button variant="success">Success</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-neo-success')
    })

    it('applies outline variant styles', () => {
      render(<Button variant="outline">Outline</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-neo-surface')
    })
  })

  describe('sizes', () => {
    it('applies small size styles', () => {
      render(<Button size="sm">Small</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-10', 'px-4', 'text-xs')
    })

    it('applies default (medium) size styles', () => {
      render(<Button>Medium</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-14', 'px-8', 'text-sm')
    })

    it('applies large size styles', () => {
      render(<Button size="lg">Large</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-16', 'px-10', 'text-base')
    })
  })

  describe('states', () => {
    it('shows loading spinner when isLoading is true', () => {
      render(<Button isLoading>Loading</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-busy', 'true')
      // The spinner should be present (aria-hidden)
      const spinner = button.querySelector('[aria-hidden="true"]')
      expect(spinner).toBeInTheDocument()
    })

    it('is disabled when isLoading is true', () => {
      render(<Button isLoading>Loading</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveAttribute('aria-disabled', 'true')
    })

    it('is disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('applies disabled styles', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed')
    })
  })

  describe('interactions', () => {
    it('calls onClick when clicked', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click me</Button>)
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not call onClick when disabled', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick} disabled>Click me</Button>)
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('does not call onClick when loading', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick} isLoading>Click me</Button>)
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('has focus-visible styles for keyboard navigation', () => {
      render(<Button>Accessible</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-4')
    })

    it('forwards ref correctly', () => {
      const ref = { current: null as HTMLButtonElement | null }
      render(<Button ref={ref}>Ref</Button>)
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    })

    it('passes through additional props', () => {
      render(<Button data-testid="custom-button" aria-label="Custom label">Props</Button>)
      const button = screen.getByTestId('custom-button')
      expect(button).toHaveAttribute('aria-label', 'Custom label')
    })

    it('has correct type attribute by default', () => {
      render(<Button>Submit</Button>)
      const button = screen.getByRole('button')
      // Note: button elements have type="submit" by default when not specified
      expect(button.getAttribute('type')).toBe(null)
    })

    it('allows type override', () => {
      render(<Button type="submit">Submit</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'submit')
    })
  })

  describe('custom className', () => {
    it('merges custom className with default styles', () => {
      render(<Button className="custom-class">Custom</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
      expect(button).toHaveClass('border-4') // Default style still present
    })
  })
})

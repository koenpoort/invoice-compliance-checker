import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'

describe('Card', () => {
  describe('rendering', () => {
    it('renders children correctly', () => {
      render(<Card>Card content</Card>)
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('applies default styles', () => {
      render(<Card data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('border-4', 'border-neo-fg', 'bg-neo-surface', 'shadow-neo-md')
    })

    it('applies hover styles by default', () => {
      render(<Card data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('hover:-translate-y-1', 'hover:shadow-neo-lg')
    })

    it('removes hover styles when hover is false', () => {
      render(<Card data-testid="card" hover={false}>Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).not.toHaveClass('hover:-translate-y-1')
    })
  })

  describe('semantic HTML', () => {
    it('renders as div by default', () => {
      render(<Card data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card.tagName).toBe('DIV')
    })

    it('renders as article when specified', () => {
      render(<Card as="article" data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card.tagName).toBe('ARTICLE')
    })

    it('renders as section when specified', () => {
      render(<Card as="section" data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card.tagName).toBe('SECTION')
    })

    it('renders as aside when specified', () => {
      render(<Card as="aside" data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card.tagName).toBe('ASIDE')
    })
  })

  describe('forwarding ref', () => {
    it('forwards ref correctly', () => {
      const ref = { current: null as HTMLDivElement | null }
      render(<Card ref={ref}>Content</Card>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('custom className', () => {
    it('merges custom className', () => {
      render(<Card className="custom-class" data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('custom-class', 'border-4')
    })
  })
})

describe('CardHeader', () => {
  it('renders children correctly', () => {
    render(<CardHeader>Header content</CardHeader>)
    expect(screen.getByText('Header content')).toBeInTheDocument()
  })

  it('applies default styles', () => {
    render(<CardHeader data-testid="header">Content</CardHeader>)
    const header = screen.getByTestId('header')
    expect(header).toHaveClass('border-b-4', 'border-neo-fg', 'p-6')
  })

  it('renders as div by default', () => {
    render(<CardHeader data-testid="header">Content</CardHeader>)
    const header = screen.getByTestId('header')
    expect(header.tagName).toBe('DIV')
  })

  it('renders as header when specified', () => {
    render(<CardHeader as="header" data-testid="header">Content</CardHeader>)
    const header = screen.getByTestId('header')
    expect(header.tagName).toBe('HEADER')
  })

  it('forwards ref correctly', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<CardHeader ref={ref}>Content</CardHeader>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('merges custom className', () => {
    render(<CardHeader className="custom-class" data-testid="header">Content</CardHeader>)
    const header = screen.getByTestId('header')
    expect(header).toHaveClass('custom-class', 'border-b-4')
  })
})

describe('CardContent', () => {
  it('renders children correctly', () => {
    render(<CardContent>Body content</CardContent>)
    expect(screen.getByText('Body content')).toBeInTheDocument()
  })

  it('applies default styles', () => {
    render(<CardContent data-testid="content">Content</CardContent>)
    const content = screen.getByTestId('content')
    expect(content).toHaveClass('p-6')
  })

  it('forwards ref correctly', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<CardContent ref={ref}>Content</CardContent>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('merges custom className', () => {
    render(<CardContent className="custom-class" data-testid="content">Content</CardContent>)
    const content = screen.getByTestId('content')
    expect(content).toHaveClass('custom-class', 'p-6')
  })
})

describe('CardFooter', () => {
  it('renders children correctly', () => {
    render(<CardFooter>Footer content</CardFooter>)
    expect(screen.getByText('Footer content')).toBeInTheDocument()
  })

  it('applies default styles', () => {
    render(<CardFooter data-testid="footer">Content</CardFooter>)
    const footer = screen.getByTestId('footer')
    expect(footer).toHaveClass('border-t-4', 'border-neo-fg', 'p-6')
  })

  it('renders as div by default', () => {
    render(<CardFooter data-testid="footer">Content</CardFooter>)
    const footer = screen.getByTestId('footer')
    expect(footer.tagName).toBe('DIV')
  })

  it('renders as footer when specified', () => {
    render(<CardFooter as="footer" data-testid="footer">Content</CardFooter>)
    const footer = screen.getByTestId('footer')
    expect(footer.tagName).toBe('FOOTER')
  })

  it('forwards ref correctly', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<CardFooter ref={ref}>Content</CardFooter>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})

describe('Card composition', () => {
  it('renders complete card with all parts', () => {
    render(
      <Card data-testid="card">
        <CardHeader data-testid="header">Header</CardHeader>
        <CardContent data-testid="content">Content</CardContent>
        <CardFooter data-testid="footer">Footer</CardFooter>
      </Card>
    )

    expect(screen.getByTestId('card')).toBeInTheDocument()
    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('content')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
    expect(screen.getByText('Header')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })
})

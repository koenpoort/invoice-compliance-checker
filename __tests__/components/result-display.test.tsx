import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ResultDisplay, ComplianceResult } from '@/components/result-display'

describe('ResultDisplay', () => {
  const mockOnReset = vi.fn()

  const greenResult: ComplianceResult = {
    status: 'green',
    fields: [
      { name: 'factuurnummer', found: true, value: 'INV-001' },
      { name: 'factuurdatum', found: true, value: '2024-01-15' },
      { name: 'leverancierNaam', found: true, value: 'Test BV' },
      { name: 'btwNummer', found: true, value: 'NL123456789B01' },
      { name: 'klantNaam', found: true, value: 'Klant BV' },
      { name: 'totaalbedrag', found: true, value: '€1,000.00' },
      { name: 'kvkNummer', found: true, value: '12345678' },
      { name: 'leverancierAdres', found: true, value: 'Teststraat 1, 1234AB Amsterdam' },
      { name: 'klantAdres', found: true, value: 'Klantweg 2, 5678CD Rotterdam' },
      { name: 'omschrijving', found: true, value: 'Consulting diensten' },
      { name: 'leveringsdatum', found: true, value: '2024-01-10' },
      { name: 'bedragExclBtw', found: true, value: '€826.45' },
      { name: 'btwTarief', found: true, value: '21%' },
      { name: 'btwBedrag', found: true, value: '€173.55' },
    ],
  }

  const orangeResult: ComplianceResult = {
    status: 'orange',
    fields: [
      { name: 'factuurnummer', found: true, value: 'INV-001' },
      { name: 'factuurdatum', found: true, value: '2024-01-15' },
      { name: 'leverancierNaam', found: true, value: 'Test BV' },
      { name: 'btwNummer', found: false },
      { name: 'klantNaam', found: true, value: 'Klant BV' },
      { name: 'totaalbedrag', found: true, value: '€1,000.00' },
      { name: 'kvkNummer', found: true, value: '12345678' },
      { name: 'leverancierAdres', found: true, value: 'Teststraat 1, 1234AB Amsterdam' },
      { name: 'klantAdres', found: true, value: 'Klantweg 2, 5678CD Rotterdam' },
      { name: 'omschrijving', found: true, value: 'Consulting diensten' },
      { name: 'leveringsdatum', found: true, value: '2024-01-10' },
      { name: 'bedragExclBtw', found: true, value: '€826.45' },
      { name: 'btwTarief', found: true, value: '21%' },
      { name: 'btwBedrag', found: true, value: '€173.55' },
    ],
  }

  const redResult: ComplianceResult = {
    status: 'red',
    fields: [
      { name: 'factuurnummer', found: false },
      { name: 'factuurdatum', found: false },
      { name: 'leverancierNaam', found: false },
      { name: 'btwNummer', found: false },
      { name: 'klantNaam', found: true, value: 'Klant BV' },
      { name: 'totaalbedrag', found: true, value: '€1,000.00' },
      { name: 'kvkNummer', found: true, value: '12345678' },
      { name: 'leverancierAdres', found: true, value: 'Teststraat 1, 1234AB Amsterdam' },
      { name: 'klantAdres', found: true, value: 'Klantweg 2, 5678CD Rotterdam' },
      { name: 'omschrijving', found: true, value: 'Consulting diensten' },
      { name: 'leveringsdatum', found: true, value: '2024-01-10' },
      { name: 'bedragExclBtw', found: true, value: '€826.45' },
      { name: 'btwTarief', found: true, value: '21%' },
      { name: 'btwBedrag', found: true, value: '€173.55' },
    ],
  }

  beforeEach(() => {
    mockOnReset.mockClear()
  })

  describe('green status', () => {
    it('displays GOEDGEKEURD label', () => {
      render(<ResultDisplay result={greenResult} onReset={mockOnReset} />)
      expect(screen.getByRole('heading', { name: /goedgekeurd/i })).toBeInTheDocument()
    })

    it('shows success message', () => {
      render(<ResultDisplay result={greenResult} onReset={mockOnReset} />)
      expect(screen.getByText(/alle verplichte velden/i)).toBeInTheDocument()
    })

    it('has status badge with correct styling', () => {
      render(<ResultDisplay result={greenResult} onReset={mockOnReset} />)
      const statusBadges = screen.getAllByRole('status')
      expect(statusBadges.length).toBeGreaterThan(0)
    })
  })

  describe('orange status', () => {
    it('displays LET OP label', () => {
      render(<ResultDisplay result={orangeResult} onReset={mockOnReset} />)
      expect(screen.getByRole('heading', { name: /let op/i })).toBeInTheDocument()
    })

    it('shows warning message', () => {
      render(<ResultDisplay result={orangeResult} onReset={mockOnReset} />)
      expect(screen.getByText(/enkele velden ontbreken/i)).toBeInTheDocument()
    })
  })

  describe('red status', () => {
    it('displays NIET COMPLIANT label', () => {
      render(<ResultDisplay result={redResult} onReset={mockOnReset} />)
      expect(screen.getByRole('heading', { name: /niet compliant/i })).toBeInTheDocument()
    })

    it('shows error message', () => {
      render(<ResultDisplay result={redResult} onReset={mockOnReset} />)
      const messages = screen.getAllByText(/belangrijke velden ontbreken/i)
      expect(messages.length).toBeGreaterThan(0)
    })
  })

  describe('field checklist', () => {
    it('displays all field labels', () => {
      render(<ResultDisplay result={greenResult} onReset={mockOnReset} />)
      // Original 6 fields
      expect(screen.getByText('Factuurnummer')).toBeInTheDocument()
      expect(screen.getByText('Factuurdatum')).toBeInTheDocument()
      expect(screen.getByText('Naam leverancier')).toBeInTheDocument()
      expect(screen.getByText('BTW-nummer')).toBeInTheDocument()
      expect(screen.getByText('Naam klant')).toBeInTheDocument()
      expect(screen.getByText('Totaalbedrag')).toBeInTheDocument()
      // New 8 fields
      expect(screen.getByText('KVK-nummer')).toBeInTheDocument()
      expect(screen.getByText('Adres leverancier')).toBeInTheDocument()
      expect(screen.getByText('Adres klant')).toBeInTheDocument()
      expect(screen.getByText('Omschrijving')).toBeInTheDocument()
      expect(screen.getByText('Leveringsdatum')).toBeInTheDocument()
      expect(screen.getByText('Bedrag excl. BTW')).toBeInTheDocument()
      expect(screen.getByText('BTW-tarief')).toBeInTheDocument()
      expect(screen.getByText('BTW-bedrag')).toBeInTheDocument()
    })

    it('displays field values when available', () => {
      render(<ResultDisplay result={greenResult} onReset={mockOnReset} />)
      expect(screen.getByText('INV-001')).toBeInTheDocument()
      expect(screen.getByText('NL123456789B01')).toBeInTheDocument()
    })

    it('has list semantics for fields', () => {
      render(<ResultDisplay result={greenResult} onReset={mockOnReset} />)
      const list = screen.getByRole('list', { name: /controlelijst/i })
      expect(list).toBeInTheDocument()
      const listItems = screen.getAllByRole('listitem')
      expect(listItems).toHaveLength(14)
    })

    it('shows correct count of found fields for green', () => {
      render(<ResultDisplay result={greenResult} onReset={mockOnReset} />)
      expect(screen.getByText('14')).toBeInTheDocument()
      expect(screen.getByText('/14')).toBeInTheDocument()
    })

    it('shows correct count of found fields for red', () => {
      render(<ResultDisplay result={redResult} onReset={mockOnReset} />)
      expect(screen.getByText('10')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has section with aria-labelledby', () => {
      render(<ResultDisplay result={greenResult} onReset={mockOnReset} />)
      const section = document.querySelector('section[aria-labelledby]')
      expect(section).toBeInTheDocument()
    })

    it('has section with aria-describedby', () => {
      render(<ResultDisplay result={greenResult} onReset={mockOnReset} />)
      const section = document.querySelector('section[aria-describedby]')
      expect(section).toBeInTheDocument()
    })

    it('has sr-only status for screen readers', () => {
      render(<ResultDisplay result={greenResult} onReset={mockOnReset} />)
      const srOnly = document.querySelector('p.sr-only[role="status"]')
      expect(srOnly).toBeInTheDocument()
    })

    it('has reset button', () => {
      render(<ResultDisplay result={greenResult} onReset={mockOnReset} />)
      const button = screen.getByRole('button', { name: /controleer een nieuwe factuur/i })
      expect(button).toBeInTheDocument()
    })

    it('has external link to official requirements', () => {
      render(<ResultDisplay result={greenResult} onReset={mockOnReset} />)
      const link = screen.getByRole('link', { name: /officiële factuureisen/i })
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  describe('reset functionality', () => {
    it('calls onReset when button is clicked', () => {
      render(<ResultDisplay result={greenResult} onReset={mockOnReset} />)
      const button = screen.getByRole('button', { name: /controleer een nieuwe factuur/i })
      fireEvent.click(button)
      expect(mockOnReset).toHaveBeenCalledTimes(1)
    })
  })

  describe('disclaimer', () => {
    it('displays disclaimer text', () => {
      render(<ResultDisplay result={greenResult} onReset={mockOnReset} />)
      expect(screen.getByText(/hulpmiddel/i)).toBeInTheDocument()
    })

    it('has aside landmark', () => {
      render(<ResultDisplay result={greenResult} onReset={mockOnReset} />)
      const aside = document.querySelector('aside[aria-label="Disclaimer"]')
      expect(aside).toBeInTheDocument()
    })
  })
})

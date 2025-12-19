import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UploadZone } from '@/components/upload-zone'

describe('UploadZone', () => {
  const mockOnFileSelect = vi.fn()

  beforeEach(() => {
    mockOnFileSelect.mockClear()
  })

  describe('rendering', () => {
    it('renders the heading', () => {
      render(<UploadZone onFileSelect={mockOnFileSelect} />)
      expect(screen.getByRole('heading', { name: /drop je factuur hier/i })).toBeInTheDocument()
    })

    it('renders the upload button', () => {
      render(<UploadZone onFileSelect={mockOnFileSelect} />)
      const buttons = screen.getAllByRole('button', { name: /selecteer.*pdf/i })
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('renders instructions text', () => {
      render(<UploadZone onFileSelect={mockOnFileSelect} />)
      expect(screen.getByText(/sleep een pdf hierheen/i)).toBeInTheDocument()
    })

    it('renders trust signals', () => {
      render(<UploadZone onFileSelect={mockOnFileSelect} />)
      expect(screen.getByText(/gdpr-compliant/i)).toBeInTheDocument()
      expect(screen.getByText(/geen opslag/i)).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has proper section landmark', () => {
      render(<UploadZone onFileSelect={mockOnFileSelect} />)
      const section = document.querySelector('section[aria-labelledby]')
      expect(section).toBeInTheDocument()
    })

    it('has accessible dropzone with role button', () => {
      render(<UploadZone onFileSelect={mockOnFileSelect} />)
      const dropzones = screen.getAllByRole('button')
      const dropzone = dropzones[0]
      expect(dropzone).toHaveAttribute('tabIndex', '0')
    })

    it('has hidden file input with proper label', () => {
      render(<UploadZone onFileSelect={mockOnFileSelect} />)
      const input = document.querySelector('input[type="file"]')
      expect(input).toHaveAttribute('aria-label')
      expect(input).toHaveClass('sr-only')
    })

    it('has aria-describedby for instructions', () => {
      render(<UploadZone onFileSelect={mockOnFileSelect} />)
      const dropzones = screen.getAllByRole('button')
      const dropzone = dropzones[0]
      expect(dropzone).toHaveAttribute('aria-describedby')
    })
  })

  describe('file validation', () => {
    it('rejects non-PDF files via change event', async () => {
      render(<UploadZone onFileSelect={mockOnFileSelect} />)

      const file = new File(['content'], 'test.txt', { type: 'text/plain' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
      expect(screen.getByText(/alleen pdf-bestanden zijn toegestaan/i)).toBeInTheDocument()
      expect(mockOnFileSelect).not.toHaveBeenCalled()
    })

    it('rejects files larger than 10MB', async () => {
      render(<UploadZone onFileSelect={mockOnFileSelect} />)

      const largeContent = new ArrayBuffer(11 * 1024 * 1024)
      const file = new File([largeContent], 'large.pdf', { type: 'application/pdf' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
      expect(screen.getByText(/te groot/i)).toBeInTheDocument()
      expect(mockOnFileSelect).not.toHaveBeenCalled()
    })

    it('accepts valid PDF files', () => {
      render(<UploadZone onFileSelect={mockOnFileSelect} />)

      const file = new File(['pdf content'], 'invoice.pdf', { type: 'application/pdf' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      fireEvent.change(input, { target: { files: [file] } })

      expect(mockOnFileSelect).toHaveBeenCalledWith(file)
    })
  })

  describe('drag and drop', () => {
    it('changes style when dragging over', () => {
      render(<UploadZone onFileSelect={mockOnFileSelect} />)

      const dropzones = screen.getAllByRole('button')
      const dropzone = dropzones[0]

      fireEvent.dragOver(dropzone)

      expect(dropzone).toHaveClass('border-neo-success')
    })

    it('resets style when drag leaves', () => {
      render(<UploadZone onFileSelect={mockOnFileSelect} />)

      const dropzones = screen.getAllByRole('button')
      const dropzone = dropzones[0]

      fireEvent.dragOver(dropzone)
      fireEvent.dragLeave(dropzone, { relatedTarget: null })

      expect(dropzone).not.toHaveClass('border-neo-success')
    })

    it('handles dropped PDF files', () => {
      render(<UploadZone onFileSelect={mockOnFileSelect} />)

      const file = new File(['pdf content'], 'dropped.pdf', { type: 'application/pdf' })
      const dropzones = screen.getAllByRole('button')
      const dropzone = dropzones[0]

      fireEvent.drop(dropzone, {
        dataTransfer: {
          files: [file],
        },
      })

      expect(mockOnFileSelect).toHaveBeenCalledWith(file)
    })
  })

  describe('keyboard navigation', () => {
    it('triggers file input on Enter key', () => {
      render(<UploadZone onFileSelect={mockOnFileSelect} />)

      const dropzones = screen.getAllByRole('button')
      const dropzone = dropzones[0]
      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const clickSpy = vi.spyOn(input, 'click')

      fireEvent.keyDown(dropzone, { key: 'Enter' })

      expect(clickSpy).toHaveBeenCalled()
    })

    it('triggers file input on Space key', () => {
      render(<UploadZone onFileSelect={mockOnFileSelect} />)

      const dropzones = screen.getAllByRole('button')
      const dropzone = dropzones[0]
      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const clickSpy = vi.spyOn(input, 'click')

      fireEvent.keyDown(dropzone, { key: ' ' })

      expect(clickSpy).toHaveBeenCalled()
    })
  })

  describe('loading state', () => {
    it('disables interaction when loading', () => {
      render(<UploadZone onFileSelect={mockOnFileSelect} isLoading />)

      const dropzones = screen.getAllByRole('button')
      const dropzone = dropzones[0]
      expect(dropzone).toHaveAttribute('aria-busy', 'true')
      expect(dropzone).toHaveAttribute('aria-disabled', 'true')
      expect(dropzone).toHaveAttribute('tabIndex', '-1')
    })

    it('disables file input when loading', () => {
      render(<UploadZone onFileSelect={mockOnFileSelect} isLoading />)

      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      expect(input).toBeDisabled()
    })

    it('disables button when loading', () => {
      render(<UploadZone onFileSelect={mockOnFileSelect} isLoading />)

      const buttons = screen.getAllByRole('button', { name: /selecteer.*pdf/i })
      // At least one button should be disabled
      const disabledButton = buttons.find(btn => btn.hasAttribute('disabled'))
      expect(disabledButton).toBeDefined()
    })
  })

  describe('error handling', () => {
    it('shows error with shake animation', async () => {
      render(<UploadZone onFileSelect={mockOnFileSelect} />)

      const file = new File(['content'], 'test.txt', { type: 'text/plain' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        const errorDiv = screen.getByRole('alert')
        expect(errorDiv).toHaveClass('animate-shake')
      })
    })
  })
})

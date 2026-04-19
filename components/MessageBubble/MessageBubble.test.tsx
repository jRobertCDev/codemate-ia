import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MessageBubble } from './MessageBubble'

describe('MessageBubble', () => {
  it('renderiza correctamente', () => {
    render(<MessageBubble>contenido de prueba</MessageBubble>)
    expect(screen.getByText('contenido de prueba')).toBeInTheDocument()
  })

  it('aplica className correctamente', () => {
    const { container } = render(<MessageBubble className="test-class" />)
    expect(container.firstChild).toHaveClass('test-class')
  })
})

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MessageBubble } from './MessageBubble'

describe('MessageBubble', () => {
  it('renderiza un mensaje del usuario', () => {
    render(<MessageBubble role="user" content="Hola CodeMate" />)
    expect(screen.getByText('Hola CodeMate')).toBeInTheDocument()
  })

  it('renderiza un mensaje del asistente', () => {
    render(<MessageBubble role="assistant" content="Hola, ¿en qué puedo ayudarte?" />)
    expect(screen.getByText('Hola, ¿en qué puedo ayudarte?')).toBeInTheDocument()
  })

  it('muestra el indicador de thinking cuando isThinking es true', () => {
    const { container } = render(<MessageBubble role="assistant" content="" isThinking />)
    const dots = container.querySelectorAll('.animate-bounce')
    expect(dots).toHaveLength(3)
  })

  it('no muestra el indicador de thinking por defecto', () => {
    const { container } = render(<MessageBubble role="assistant" content="respuesta" />)
    const dots = container.querySelectorAll('.animate-bounce')
    expect(dots).toHaveLength(0)
  })

  it('aplica justify-end para mensajes del usuario', () => {
    const { container } = render(<MessageBubble role="user" content="test" />)
    expect(container.firstChild).toHaveClass('justify-end')
  })

  it('aplica justify-start para mensajes del asistente', () => {
    const { container } = render(<MessageBubble role="assistant" content="test" />)
    expect(container.firstChild).toHaveClass('justify-start')
  })
})

export interface MessageBubbleProps {
  role: 'user' | 'assistant'
  content: string
  isThinking?: boolean
}

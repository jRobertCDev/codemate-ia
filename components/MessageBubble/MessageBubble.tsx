'use client'

import { MessageBubbleProps } from './MessageBubble.types'

export function MessageBubble({ className, children }: MessageBubbleProps) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

export default MessageBubble

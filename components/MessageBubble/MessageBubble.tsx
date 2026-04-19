'use client'

import ReactMarkdown from 'react-markdown'
import { MessageBubbleProps } from './MessageBubble.types'

export function MessageBubble({ role, content, isThinking }: MessageBubbleProps) {
  if (isThinking) {
    return (
      <div className="flex justify-start">
        <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center mr-2 mt-1 shrink-0">
          <span className="text-white text-xs font-bold">C</span>
        </div>
        <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm">
          <div className="flex gap-1 items-center h-4">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      {role === 'assistant' && (
        <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center mr-2 mt-1 shrink-0">
          <span className="text-white text-xs font-bold">C</span>
        </div>
      )}
      <div className={`max-w-xl px-4 py-3 rounded-2xl text-sm leading-relaxed ${
        role === 'user'
          ? 'bg-violet-600 text-white rounded-br-sm'
          : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100'
      }`}>
        {role === 'assistant' ? (
          <ReactMarkdown
            components={{
              code: ({ children, className }) => {
                const isBlock = className?.includes('language-')
                return isBlock ? (
                  <pre className="bg-gray-900 text-gray-100 rounded-lg p-3 my-2 overflow-x-auto text-xs">
                    <code>{children}</code>
                  </pre>
                ) : (
                  <code className="bg-gray-100 text-violet-600 px-1 rounded text-xs">{children}</code>
                )
              },
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
            }}
          >
            {content}
          </ReactMarkdown>
        ) : (
          content
        )}
      </div>
    </div>
  )
}

export default MessageBubble

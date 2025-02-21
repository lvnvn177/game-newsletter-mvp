'use client'

import { useState, useRef, useEffect } from 'react'
import type { EditorBlock } from '@/types/editor'

interface TextBlockProps {
  block: EditorBlock
  onUpdate: (block: EditorBlock) => void
}

export function TextBlock({ block, onUpdate }: TextBlockProps) {
  const [isEditing, setIsEditing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [isEditing])

  if (isEditing) {
    return (
      <textarea
        ref={textareaRef}
        className="w-full resize-none rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
        value={block.content.text}
        onChange={(e) => {
          onUpdate({
            ...block,
            content: { ...block.content, text: e.target.value }
          })
        }}
        onBlur={() => setIsEditing(false)}
        style={block.settings.style}
      />
    )
  }

  return (
    <div
      className="cursor-text rounded p-2 hover:bg-gray-50"
      onClick={() => setIsEditing(true)}
      style={block.settings.style}
    >
      {block.content.text || '텍스트를 입력하세요'}
    </div>
  )
} 
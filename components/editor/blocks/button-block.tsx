'use client'

import { useState } from 'react'
import type { EditorBlock } from '@/types/editor'

interface ButtonBlockProps {
  block: EditorBlock
  onUpdate: (block: EditorBlock) => void
}

export function ButtonBlock({ block, onUpdate }: ButtonBlockProps) {
  const [isEditing, setIsEditing] = useState(false)

  if (isEditing) {
    return (
      <div className="space-y-2 rounded border border-gray-200 p-4">
        <input
          type="text"
          className="w-full rounded border border-gray-300 p-2"
          value={block.content.buttonText || ''}
          onChange={(e) =>
            onUpdate({
              ...block,
              content: { ...block.content, buttonText: e.target.value }
            })
          }
          placeholder="버튼 텍스트"
        />
        <input
          type="url"
          className="w-full rounded border border-gray-300 p-2"
          value={block.content.buttonUrl || ''}
          onChange={(e) =>
            onUpdate({
              ...block,
              content: { ...block.content, buttonUrl: e.target.value }
            })
          }
          placeholder="https://example.com"
        />
        <button
          className="rounded bg-blue-500 px-4 py-2 text-white"
          onClick={() => setIsEditing(false)}
        >
          완료
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-2">
      <button
        className="rounded bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
        onClick={() => setIsEditing(true)}
        style={block.settings.style}
      >
        {block.content.buttonText || '버튼 텍스트'}
      </button>
    </div>
  )
} 
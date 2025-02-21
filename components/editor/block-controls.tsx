'use client'

import { useState } from 'react'
import type { BlockType, EditorBlock } from '@/types/editor'

interface BlockControlsProps {
  onAddBlock: (type: BlockType) => void
}

export function BlockControls({ onAddBlock }: BlockControlsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const blockTypes: Array<{ type: BlockType; label: string }> = [
    { type: 'text', label: '텍스트' },
    { type: 'image', label: '이미지' },
    { type: 'button', label: '버튼' }
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        aria-expanded={isOpen}
      >
        블록 추가 +
      </button>
      
      {isOpen && (
        <div className="absolute left-0 mt-2 w-40 rounded-md border border-gray-200 bg-white shadow-lg z-50">
          {blockTypes.map(({ type, label }) => (
            <button
              key={type}
              onClick={() => {
                onAddBlock(type)
                setIsOpen(false)
              }}
              className="block w-full px-4 py-2 text-left hover:bg-gray-100"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
} 
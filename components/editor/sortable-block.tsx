'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TextBlock } from './blocks/text-block'
import { ImageBlock } from './blocks/image-block'
import { ButtonBlock } from './blocks/button-block'
import { AudioBlock } from './blocks/audio-block'
import type { EditorBlock } from '@/types/editor'

interface SortableBlockProps {
  block: EditorBlock
  onUpdate: (block: EditorBlock) => void
}

export function SortableBlock({ block, onUpdate }: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  const renderBlock = () => {
    switch (block.type) {
      case 'text':
        return <TextBlock block={block} onUpdate={onUpdate} />
      case 'image':
        return <ImageBlock block={block} onUpdate={onUpdate} />
      case 'button':
        return <ButtonBlock block={block} onUpdate={onUpdate} />
      case 'audio':
        return <AudioBlock block={block} onUpdate={onUpdate} />
      default:
        return null
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border border-gray-200 bg-white p-4 relative group"
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-4 top-1/2 -translate-y-1/2 p-2 cursor-move opacity-50 hover:opacity-100"
      >
        ⋮⋮
      </div>
      <div className="relative">
        {renderBlock()}
      </div>
    </div>
  )
} 
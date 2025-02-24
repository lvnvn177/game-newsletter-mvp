'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { EditorBlock } from '@/types/editor'
import { TextBlock } from './blocks/text-block'
import { ImageBlock } from './blocks/image-block'
import { ButtonBlock } from './blocks/button-block'
import { AudioBlock } from './blocks/audio-block'
interface BlockRendererProps {
  block: EditorBlock
  onUpdate: (block: EditorBlock) => void
}

export function BlockRenderer({ block, onUpdate }: BlockRendererProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
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
      {...attributes}
      className="relative mb-4 rounded border border-transparent hover:border-gray-200"
    >
      <div
        {...listeners}
        className="absolute -left-4 top-1/2 hidden -translate-y-1/2 cursor-move group-hover:block"
      >
        ⋮
      </div>
      {renderBlock()}
    </div>
  )
} 
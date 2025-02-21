'use client'

import { useState } from 'react'
import { DndContext, closestCenter } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable'
import type { EditorBlock } from '@/types/editor'
import { BlockRenderer } from './block-renderer'

interface EditorCanvasProps {
  initialBlocks?: EditorBlock[]
  onChange?: (blocks: EditorBlock[]) => void
}

export default function EditorCanvas({ 
  initialBlocks = [], 
  onChange 
}: EditorCanvasProps) {
  const [blocks, setBlocks] = useState<EditorBlock[]>(initialBlocks)

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        const newBlocks = arrayMove(items, oldIndex, newIndex)
        onChange?.(newBlocks)
        return newBlocks
      })
    }
  }

  return (
    <div className="min-h-[600px] w-full rounded-lg border border-gray-200 bg-white p-4">
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks} strategy={verticalListSortingStrategy}>
          {blocks.map((block) => (
            <BlockRenderer
              key={block.id}
              block={block}
              onUpdate={(updatedBlock) => {
                const newBlocks = blocks.map((b) =>
                  b.id === updatedBlock.id ? updatedBlock : b
                )
                setBlocks(newBlocks)
                onChange?.(newBlocks)
              }}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
} 
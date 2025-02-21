'use client'

import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { SortableBlock } from './sortable-block'
import type { EditorBlock } from '@/types/editor'

interface EditorCanvasProps {
  blocks: EditorBlock[]
  onChange: (blocks: EditorBlock[]) => void
}

export default function EditorCanvas({ blocks, onChange }: EditorCanvasProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((block) => block.id === active.id)
      const newIndex = blocks.findIndex((block) => block.id === over.id)
      
      onChange(arrayMove(blocks, oldIndex, newIndex))
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={blocks}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {blocks.map(block => (
            <SortableBlock
              key={block.id}
              block={block}
              onUpdate={(updatedBlock) => {
                const newBlocks = blocks.map(b => 
                  b.id === updatedBlock.id ? updatedBlock : b
                )
                onChange(newBlocks)
              }}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
} 
'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import type { EditorBlock } from '@/types/editor'

// 클라이언트 사이드에서만 로드하기 위해 dynamic import 사용
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
)

// Markdown 컴포넌트도 별도로 dynamic import
const MDPreview = dynamic(
  () => import('@uiw/react-markdown-preview').then((mod) => mod.default),
  { ssr: false }
)

interface TextBlockProps {
  block: EditorBlock
  onUpdate: (block: EditorBlock) => void
}

export function TextBlock({ block, onUpdate }: TextBlockProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(block.content.text || '')
  const containerRef = useRef<HTMLDivElement>(null)

  // 외부 클릭 감지를 위한 이벤트 핸들러
  useEffect(() => {
    if (!isEditing) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsEditing(false)
        // 변경사항 저장
        onUpdate({
          ...block,
          content: { ...block.content, text: value }
        })
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isEditing, block, onUpdate, value])

  // 마크다운 변경 핸들러
  const handleChange = (newValue?: string) => {
    if (newValue !== undefined) {
      setValue(newValue)
    }
  }

  // 편집 완료 핸들러
  const handleBlur = () => {
    setIsEditing(false)
    onUpdate({
      ...block,
      content: { ...block.content, text: value }
    })
  }

  if (isEditing) {
    return (
      <div ref={containerRef} className="my-4">
        <MDEditor
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          preview="edit"
          height={300}
          style={{ ...block.settings.style }}
        />
      </div>
    )
  }

  return (
    <div
      className="cursor-text rounded p-2 hover:bg-gray-50"
      onClick={() => setIsEditing(true)}
      style={block.settings.style}
    >
      {block.content.text ? (
        <div className="prose max-w-none">
          <MDPreview source={block.content.text} />
        </div>
      ) : (
        <p className="text-gray-400">텍스트를 입력하세요</p>
      )}
    </div>
  )
} 
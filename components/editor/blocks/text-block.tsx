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
      // 에디터 메뉴 클릭 감지 - data-mode 속성이 있는 요소는 에디터 메뉴의 일부
      const target = event.target as HTMLElement;
      
      // 에디터 관련 요소인지 확인 (더 포괄적인 선택자 사용)
      if (
        target.closest('.w-md-editor') || 
        target.closest('[data-mode]') || 
        target.closest('.w-md-editor-toolbar') ||
        target.closest('.w-md-editor-toolbar-child') ||
        target.closest('.w-md-editor-toolbar-item') ||
        target.closest('.w-md-editor-content') ||
        target.closest('.wmde-markdown-color') ||
        target.closest('button[data-name]')
      ) {
        // 에디터 관련 요소 클릭 시 이벤트 무시
        return;
      }
      
      // 컨테이너 외부 클릭 시에만 편집 종료
      if (containerRef.current && !containerRef.current.contains(target)) {
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

  // 키보드 단축키 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Escape 키를 누르면 편집 종료
    if (e.key === 'Escape') {
      setIsEditing(false)
      onUpdate({
        ...block,
        content: { ...block.content, text: value }
      })
    }
  }

  // 수동으로 편집 종료 처리
  const handleSave = () => {
    setIsEditing(false)
    onUpdate({
      ...block,
      content: { ...block.content, text: value }
    })
  }

  if (isEditing) {
    return (
      <div 
        ref={containerRef} 
        className="my-4 relative"
        data-color-mode="light"
      >
        <MDEditor
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          preview="edit"
          height={300}
          style={{ ...block.settings.style }}
          // onBlur 이벤트 제거 - 이것이 문제를 일으킬 수 있음
        />
        <div className="mt-2 flex justify-end">
          <button
            onClick={handleSave}
            className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
          >
            완료
          </button>
        </div>
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
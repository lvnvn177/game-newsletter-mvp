'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase-browser'
import { nanoid } from 'nanoid'

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

interface NoticeTextBlockProps {
  value: string
  onChange: (value: string) => void
  label: string
  placeholder?: string
  height?: number
  preview?: 'edit' | 'preview' | 'live'
}

export function NoticeTextBlock({ 
  value, 
  onChange, 
  label, 
  placeholder = '내용을 입력하세요', 
  height = 300,
  preview = 'edit'
}: NoticeTextBlockProps) {
  const [isEditing, setIsEditing] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // 마크다운 변경 핸들러
  const handleChange = (newValue?: string) => {
    if (newValue !== undefined) {
      onChange(newValue)
    }
  }

  // 키보드 단축키 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Escape 키를 누르면 편집 종료
    if (e.key === 'Escape') {
      setIsEditing(false)
    }
  }

  // 이미지 업로드 핸들러 (마크다운 에디터에서 이미지 삽입 시 호출)
  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      setIsUploading(true)
      
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('파일 크기는 5MB 이하여야 합니다')
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase()
      if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt || '')) {
        throw new Error('지원하지 않는 파일 형식입니다')
      }

      // Supabase Storage에 이미지 업로드
      const filename = `notices/${Date.now()}-${nanoid()}.${fileExt}`
      
      const { data, error } = await supabase
        .storage
        .from('images')
        .upload(filename, file)

      if (error) throw error

      // 업로드된 이미지의 공개 URL 생성
      const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${filename}`
      return imageUrl
    } catch (error) {
      console.error('이미지 업로드 오류:', error)
      throw new Error('이미지 업로드에 실패했습니다')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="mb-6">
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div 
        ref={containerRef} 
        className="relative"
        data-color-mode="light"
      >
        <MDEditor
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          preview={preview}
          height={height}
          textareaProps={{
            placeholder
          }}
          visiableDragbar={false}
          className="w-full rounded-lg border border-gray-300"
        />
        {isUploading && (
          <div className="mt-2 text-sm text-blue-500">
            이미지 업로드 중...
          </div>
        )}
      </div>
    </div>
  )
} 
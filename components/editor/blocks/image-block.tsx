'use client'

import Image from 'next/image'
import { useCallback, useState } from 'react'
import type { EditorBlock } from '@/types/editor'
import { supabase } from '@/lib/supabase'
import { nanoid } from 'nanoid'

interface ImageBlockProps {
  block: EditorBlock
  onUpdate: (block: EditorBlock) => void
}

export function ImageBlock({ block, onUpdate }: ImageBlockProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      setIsLoading(true)
      setError(null)

      // 기존 이미지가 있다면 삭제
      if (block.content.imageUrl) {
        const oldPath = block.content.imageUrl.split('/newsletters/').pop()
        if (oldPath) {
          await supabase.storage
            .from('images')
            .remove([`newsletters/${oldPath}`])
        }
      }

      // 파일 크기 체크
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('파일 크기는 5MB 이하여야 합니다')
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase()
      // 파일 형식 체크
      if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt || '')) {
        throw new Error('지원하지 않는 파일 형식입니다')
      }

      const fileName = `${nanoid()}.${fileExt}`
      const filePath = `newsletters/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw new Error(uploadError.message)
      }

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      onUpdate({
        ...block,
        content: { ...block.content, imageUrl: publicUrl }
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '이미지 업로드 실패'
      setError(errorMessage)
      console.error('Error uploading image:', err)
    } finally {
      setIsLoading(false)
    }
  }, [block, onUpdate])

  return (
    <div className="relative min-h-[200px] w-full" role="region" aria-label="이미지 블록">
      {error && (
        <div className="mb-2 text-sm text-red-500" role="alert">
          {error}
        </div>
      )}
      
      {block.content.imageUrl ? (
        <div className="group relative">
          <Image
            src={block.content.imageUrl}
            alt="Newsletter image"
            width={800}
            height={400}
            className="w-full rounded object-cover"
            style={block.settings.style}
          />
          <button
            onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = 'image/*'
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0]
                if (file) handleImageUpload(file)
              }
              input.click()
            }}
            className="absolute right-2 top-2 hidden rounded bg-white/80 px-3 py-1 text-sm hover:bg-white group-hover:block"
            aria-label="이미지 변경"
            disabled={isLoading}
          >
            {isLoading ? '업로드 중...' : '변경'}
          </button>
        </div>
      ) : (
        <div
          className={`flex min-h-[200px] cursor-pointer items-center justify-center rounded border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 ${
            isLoading ? 'opacity-50' : ''
          }`}
          onClick={() => {
            if (isLoading) return
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = 'image/*'
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0]
              if (file) handleImageUpload(file)
            }
            input.click()
          }}
          role="button"
          aria-label="이미지 업로드"
          aria-disabled={isLoading}
        >
          {isLoading ? '업로드 중...' : '이미지 업로드'}
        </div>
      )}
    </div>
  )
} 
'use client'

import Image from 'next/image'
import { useCallback, useState, useEffect } from 'react'
import { ResizableBox } from 'react-resizable'
import type { EditorBlock } from '@/types/editor'
import 'react-resizable/css/styles.css'

interface ImageBlockProps {
  block: EditorBlock
  onUpdate: (block: EditorBlock) => void
}

export function ImageBlock({ block, onUpdate }: ImageBlockProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aspectRatio, setAspectRatio] = useState(1)
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null)
  const [dimensions, setDimensions] = useState({
    width: typeof block.settings.style?.width === 'string' 
      ? parseInt(block.settings.style.width, 10) 
      : (block.settings.style?.width as number) || 0,
    height: typeof block.settings.style?.height === 'string' 
      ? parseInt(block.settings.style.height, 10) 
      : (block.settings.style?.height as number) || 0
  })

  useEffect(() => {
    if (block.content.imageUrl) {
      const img = new window.Image()
      img.src = block.content.imageUrl
      img.onload = () => {
        const ratio = img.width / img.height
        setAspectRatio(ratio)
        const newDimensions = {
          width: img.width,
          height: img.height
        }
        setImageDimensions(newDimensions)
        if (!dimensions.width || !dimensions.height) {
          setDimensions(newDimensions)
          onUpdate({
            ...block,
            settings: {
              ...block.settings,
              style: {
                ...block.settings.style,
                width: img.width,
                height: img.height
              }
            }
          })
        }
      }
    }
  }, [block.content.imageUrl])

  const handleResize = (e: React.SyntheticEvent, { size }: { size: { width: number; height: number } }) => {
    const newWidth = Math.round(size.width)
    const newHeight = Math.round(newWidth / aspectRatio)
    
    const newDimensions = {
      width: newWidth,
      height: newHeight
    }
    
    setDimensions(newDimensions)
    onUpdate({
      ...block,
      settings: {
        ...block.settings,
        style: {
          ...block.settings.style,
          width: newDimensions.width,
          height: newDimensions.height
        }
      }
    })
  }

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      setIsLoading(true)
      setError(null)

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('파일 크기는 5MB 이하여야 합니다')
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase()
      if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt || '')) {
        throw new Error('지원하지 않는 파일 형식입니다')
      }

      const tempUrl = URL.createObjectURL(file)
      onUpdate({
        ...block,
        content: { 
          ...block.content, 
          imageUrl: tempUrl,
          tempFile: file
        }
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '이미지 업로드 실패'
      setError(errorMessage)
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
          <ResizableBox
            width={Math.round(dimensions.width)}
            height={Math.round(dimensions.height)}
            onResize={handleResize}
            draggableOpts={{ grid: [10, 10] }}
            minConstraints={[100, 50]}
            maxConstraints={[1200, 800]}
            lockAspectRatio
          >
            <div style={{ 
              width: `${Math.round(dimensions.width)}px`, 
              height: `${Math.round(dimensions.height)}px`, 
              position: 'relative' 
            }}>
              <Image
                src={block.content.imageUrl}
                alt="Newsletter image"
                className="rounded object-cover"
                sizes="(max-width: 1200px) 100vw, 1200px"
                fill
              />
            </div>
          </ResizableBox>
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
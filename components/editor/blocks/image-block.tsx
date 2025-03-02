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
  const [position, setPosition] = useState(() => {
    const objectPosition = block.settings.style?.objectPosition
    if (typeof objectPosition === 'string') {
      const [x] = objectPosition.split(' ')
      return { x: x || '50%' }
    }
    return { x: '50%' }
  })
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [startPosition, setStartPosition] = useState(0)
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null)
  const [dimensions, setDimensions] = useState({
    width: block.settings.style?.width 
      ? typeof block.settings.style.width === 'string'
        ? parseInt(block.settings.style.width)
        : block.settings.style.width
      : 0,
    height: block.settings.style?.height
      ? typeof block.settings.style.height === 'string'
        ? parseInt(block.settings.style.height)
        : block.settings.style.height
      : 0
  })
  const [blockPosition, setBlockPosition] = useState({ left: 0, top: 0 })

  useEffect(() => {
    if (block.content.imageUrl) {
      const img = new window.Image()
      img.src = block.content.imageUrl
      img.onload = () => {
        const ratio = img.width / img.height
        setAspectRatio(ratio)
        const newDimensions = {
          width: Math.min(img.width, 1200),
          height: Math.min(img.width, 1200) / ratio
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
                width: newDimensions.width,
                height: newDimensions.height
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
          width: newDimensions.width.toString(),
          height: newDimensions.height.toString()
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

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setStartX(e.clientX)
    setStartPosition(parseInt(position.x, 10) || 50)
  }

  const handleDrag = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - startX;
    const containerWidth = Math.round(dimensions.width);
    const maxOffset = (containerWidth / 2) - 50; // 최대 이동 범위를 컨테이너의 절반으로 제한
    const newPositionPercent = Math.max(
      0, // 최소값을 0으로 설정하여 왼쪽 끝으로 이동
      Math.min(100, startPosition + (deltaX / (containerWidth / 100))) // 최대값을 100으로 설정하여 오른쪽 끝으로 이동
    );

    setPosition({ x: `${newPositionPercent}%` });
    onUpdate({
      ...block,
      settings: {
        ...block.settings,
        style: {
          ...block.settings.style,
          objectPosition: `${newPositionPercent}% 50%`
        }
      }
    });
  }, [isDragging, startX, startPosition, block, onUpdate]);

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag)
      window.addEventListener('mouseup', handleDragEnd)
    }
    return () => {
      window.removeEventListener('mousemove', handleDrag)
      window.removeEventListener('mouseup', handleDragEnd)
    }
  }, [isDragging, handleDrag])

  return (
    <div 
      className="relative min-h-[200px] w-full bg-white text-black" 
      role="region" 
      aria-label="이미지 블록"
    >
      {error && (
        <div className="mb-2 text-sm text-red-500" role="alert">
          {error}
        </div>
      )}
      
      {block.content.imageUrl ? (
        <div className="group relative bg-white">
          <div 
            className="absolute left-0 top-1/2 z-10 h-12 w-2 -translate-y-1/2 cursor-ew-resize rounded bg-blue-500/20 opacity-0 transition-opacity group-hover:opacity-100"
            onMouseDown={handleDragStart}
          />
          <div 
            className="absolute right-0 top-1/2 z-10 h-12 w-2 -translate-y-1/2 cursor-ew-resize rounded bg-blue-500/20 opacity-0 transition-opacity group-hover:opacity-100"
            onMouseDown={handleDragStart}
          />
          <ResizableBox
            width={Math.round(dimensions.width)}
            height={Math.round(dimensions.height)}
            onResize={handleResize}
            draggableOpts={{ grid: [10, 10] }}
            minConstraints={[100, 50]}
            maxConstraints={[1200, 800]}
            lockAspectRatio
          >
            <div className="image-container relative overflow-hidden bg-white">
              <div style={{ 
                width: `${Math.round(dimensions.width)}px`, 
                height: `${Math.round(dimensions.height)}px`,
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: 'white'
              }}>
                <div style={{
                  position: 'absolute',
                  width: '200%',
                  height: '100%',
                  left: '50%',
                  transform: `translateX(calc(-50% + ${parseInt(position.x) - 50}%))`,
                  transition: isDragging ? 'none' : 'transform 0.2s'
                }}>
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden'
                  }}>
                    <Image
                      src={block.content.imageUrl}
                      alt="Newsletter image"
                      className="rounded object-contain"
                      style={{ 
                        objectPosition: '50% 50%' 
                      }}
                      sizes="(max-width: 1200px) 100vw, 1200px"
                      fill
                      priority
                    />
                  </div>
                </div>
              </div>
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
          className="flex h-[200px] w-full cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed border-gray-300 bg-white p-4 text-center hover:bg-gray-50"
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
        >
          <div className="text-gray-500">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <p className="mt-2">이미지 추가하기</p>
            <p className="mt-1 text-sm text-gray-400">JPG, PNG, GIF, WEBP (최대 5MB)</p>
          </div>
        </div>
      )}
    </div>
  )
} 
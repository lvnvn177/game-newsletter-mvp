'use client'

import { useState, useCallback } from 'react'
import type { EditorBlock } from '@/types/editor'

interface AudioBlockProps {
  block: EditorBlock
  onUpdate: (block: EditorBlock) => void
}

export function AudioBlock({ block, onUpdate }: AudioBlockProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAudioUpload = useCallback(async (file: File) => {
    try {
      setIsLoading(true)
      setError(null)

      if (file.size > 20 * 1024 * 1024) {
        throw new Error('파일 크기는 20MB 이하여야 합니다')
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase()
      if (!['mp3', 'wav', 'ogg', 'm4a'].includes(fileExt || '')) {
        throw new Error('지원하지 않는 파일 형식입니다')
      }

      const tempUrl = URL.createObjectURL(file)
      onUpdate({
        ...block,
        content: {
          ...block.content,
          audioUrl: tempUrl,
          tempFile: file,
          audioTitle: file.name
        }
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '오디오 업로드 실패'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [block, onUpdate])

  return (
    <div className="relative min-h-[100px] w-full" role="region" aria-label="오디오 블록">
      {error && (
        <div className="mb-2 text-sm text-red-500" role="alert">
          {error}
        </div>
      )}

      {block.content.audioUrl ? (
        <div className="group relative rounded-lg border border-gray-200 p-4">
          <div className="mb-2">
            <input
              type="text"
              value={block.content.audioTitle || ''}
              onChange={(e) => onUpdate({
                ...block,
                content: { ...block.content, audioTitle: e.target.value }
              })}
              placeholder="오디오 제목"
              className="w-full rounded border border-gray-300 p-2"
            />
          </div>
          <audio
            controls
            src={block.content.audioUrl}
            className="w-full"
          >
            브라우저가 오디오 재생을 지원하지 않습니다.
          </audio>
          <button
            onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = 'audio/*'
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0]
                if (file) handleAudioUpload(file)
              }
              input.click()
            }}
            className="absolute right-2 top-2 hidden rounded bg-white/80 px-3 py-1 text-sm hover:bg-white group-hover:block"
            disabled={isLoading}
          >
            {isLoading ? '업로드 중...' : '변경'}
          </button>
        </div>
      ) : (
        <div
          className={`flex min-h-[100px] cursor-pointer items-center justify-center rounded border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 ${
            isLoading ? 'opacity-50' : ''
          }`}
          onClick={() => {
            if (isLoading) return
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = 'audio/*'
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0]
              if (file) handleAudioUpload(file)
            }
            input.click()
          }}
          role="button"
          aria-label="오디오 업로드"
          aria-disabled={isLoading}
        >
          {isLoading ? '업로드 중...' : '오디오 업로드'}
        </div>
      )}
    </div>
  )
} 
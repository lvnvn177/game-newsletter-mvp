'use client'

import { useState, useCallback } from 'react'
import { nanoid } from 'nanoid'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import EditorCanvas from '@/components/editor/editor-canvas'
import { EditorHistory } from '@/lib/editor-history'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import type { EditorBlock, BlockType } from '@/types/editor'
import type { Newsletter } from '@/types/database'
import Image from 'next/image'

interface EditNewsletterFormProps {
  newsletter: Newsletter
}

export default function EditNewsletterForm({ newsletter }: EditNewsletterFormProps) {
  const router = useRouter()
  const supabase = getSupabaseBrowser()
  
  // 초기 블록 설정 - 오디오 블록과 텍스트 블록만 표시
  const initialBlocks = newsletter.content.blocks
    .filter(block => block.type === 'audio' || block.type === 'text')
    .map(block => ({
      ...block,
      id: nanoid()
    }))
  
  const [blocks, setBlocks] = useState<EditorBlock[]>(initialBlocks)
  const [title, setTitle] = useState(newsletter.title)
  const [summary, setSummary] = useState(newsletter.summary || '')
  const [thumbnailUrl, setThumbnailUrl] = useState(newsletter.thumbnail_url || '')
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [history] = useState(() => new EditorHistory())
  const [step, setStep] = useState<'thumbnail' | 'content'>('thumbnail')
  const [error, setError] = useState<string | null>(null)

  // 썸네일 이미지 업로드 처리
  const handleThumbnailUpload = async (file: File) => {
    try {
      setIsUploading(true)
      setError(null)

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('파일 크기는 5MB 이하여야 합니다')
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase()
      if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt || '')) {
        throw new Error('지원하지 않는 파일 형식입니다')
      }

      const tempUrl = URL.createObjectURL(file)
      setThumbnailUrl(tempUrl)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '이미지 업로드 실패'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  const handleBlocksChange = useCallback((newBlocks: EditorBlock[]) => {
    setBlocks(newBlocks)
    history.push(newBlocks)
  }, [history])

  // 다음 단계로 이동
  const handleNextStep = () => {
    if (!thumbnailUrl) {
      toast.error('썸네일 이미지를 업로드해주세요')
      return
    }
    
    if (!title.trim()) {
      toast.error('제목을 입력해주세요')
      return
    }
    
    if (!summary.trim()) {
      toast.error('요약을 입력해주세요')
      return
    }
    
    setStep('content')
  }
  
  // 이전 단계로 돌아가기
  const handlePrevStep = () => {
    setStep('thumbnail')
  }

  const handleUndo = useCallback(() => {
    const previousState = history.undo()
    if (previousState) setBlocks(previousState)
  }, [history])

  const handleRedo = useCallback(() => {
    const nextState = history.redo()
    if (nextState) setBlocks(nextState)
  }, [history])

  const handleSave = async () => {
    if (!title) {
      toast.error('제목을 입력해주세요')
      return
    }
    
    if (!summary.trim()) {
      toast.error('요약을 입력해주세요')
      return
    }

    if (!thumbnailUrl) {
      toast.error('썸네일 이미지를 업로드해주세요')
      return
    }

    try {
      setIsSaving(true)
      toast.loading('뉴스레터를 저장하는 중입니다...', { id: 'saving' })
      
      // 썸네일 이미지 처리
      let processedThumbnailUrl = thumbnailUrl
      
      // 임시 URL인 경우 Supabase에 업로드
      if (thumbnailUrl && !thumbnailUrl.includes(process.env.NEXT_PUBLIC_SUPABASE_URL!)) {
        try {
          const response = await fetch(thumbnailUrl)
          const blob = await response.blob()
          const fileExt = blob.type.split('/')[1]
          const filename = `newsletters/${Date.now()}-${nanoid()}.${fileExt}`
          
          const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('images')
            .upload(filename, blob)

          if (uploadError) throw uploadError

          processedThumbnailUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${filename}`
        } catch (error) {
          console.error('Error uploading thumbnail:', error)
          toast.error('썸네일 이미지 업로드 중 오류가 발생했습니다', { id: 'saving' })
          return
        }
      }
      
      // 이미지와 오디오 블록들의 파일을 Supabase Storage에 업로드
      const processedBlocks = await Promise.all(blocks.map(async block => {
        const { id, ...blockData } = block
        
        if (block.type === 'audio' && block.content.audioUrl) {
          // 기존 오디오 URL인 경우 그대로 사용
          if (block.content.audioUrl.includes(process.env.NEXT_PUBLIC_SUPABASE_URL!)) {
            return { ...blockData, id: nanoid() }
          }

          try {
            const response = await fetch(block.content.audioUrl)
            const blob = await response.blob()
            const filename = `newsletters/${Date.now()}-${nanoid()}.${blob.type.split('/')[1]}`
            
            const { error: uploadError } = await supabase
              .storage
              .from('audios')
              .upload(filename, blob)

            if (uploadError) throw uploadError

            const audioUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/audios/${filename}`

            return {
              ...blockData,
              id: nanoid(),
              content: {
                ...block.content,
                audioUrl
              }
            }
          } catch (error) {
            console.error('Error uploading audio:', error)
            throw new Error('오디오 업로드 중 오류가 발생했습니다')
          }
        }
        
        return {
          ...blockData,
          id: nanoid()
        }
      }))

      if (!processedThumbnailUrl) {
        toast.error('썸네일 이미지 처리 중 오류가 발생했습니다', { id: 'saving' })
        return
      }

      // 뉴스레터 업데이트
      const { error } = await supabase
        .from('newsletters')
        .update({
          title,
          content: { blocks: processedBlocks },
          summary,
          thumbnail_url: processedThumbnailUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', newsletter.id)

      if (error) {
        console.error('Error updating newsletter:', error)
        throw error
      }
      
      toast.success('뉴스레터가 성공적으로 저장되었습니다', {
        id: 'saving',
        duration: 5000,
        icon: '✅'
      })
      
      // 캐시를 무효화하고 페이지 새로고침
      router.refresh()
      
      // 뉴스레터 보기 페이지로 리다이렉트 (선택적)
      // router.push(`/newsletter/${newsletter.id}`)
    } catch (error) {
      console.error('Error saving newsletter:', error)
      toast.error('저장 중 오류가 발생했습니다. 다시 시도해주세요.', {
        id: 'saving',
        duration: 5000,
        icon: '❌'
      })
    } finally {
      setIsSaving(false)
    }
  }

  // 썸네일 단계 렌더링
  const renderThumbnailStep = () => {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8">
        <h2 className="mb-6 text-xl font-semibold">뉴스레터 기본 정보</h2>
        
        <div className="mb-6">
          <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-700">
            제목
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="뉴스레터 제목을 입력하세요"
            className="w-full rounded-lg border border-gray-300 p-3 text-lg"
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="summary" className="mb-2 block text-sm font-medium text-gray-700">
            요약 (최대 200자)
          </label>
          <textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="뉴스레터 카드에 표시될 요약을 작성하세요"
            className="w-full rounded-lg border border-gray-300 p-3 text-base"
            rows={3}
            maxLength={200}
          />
        </div>
        
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            썸네일 이미지
          </label>
          
          {error && (
            <div className="mb-2 text-sm text-red-500" role="alert">
              {error}
            </div>
          )}
          
          {thumbnailUrl ? (
            <div className="group relative rounded-lg border border-gray-200 p-2">
              <div className="relative h-[300px] w-full overflow-hidden rounded">
                <Image
                  src={thumbnailUrl}
                  alt="썸네일 이미지"
                  fill
                  className="object-cover"
                />
              </div>
              <button
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = 'image/*'
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (file) handleThumbnailUpload(file)
                  }
                  input.click()
                }}
                className="absolute right-4 top-4 rounded bg-white/80 px-3 py-1 text-sm hover:bg-white"
                disabled={isUploading}
              >
                {isUploading ? '업로드 중...' : '변경'}
              </button>
            </div>
          ) : (
            <div
              className={`flex h-[300px] cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 ${
                isUploading ? 'opacity-50' : ''
              }`}
              onClick={() => {
                if (isUploading) return
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = 'image/*'
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0]
                  if (file) handleThumbnailUpload(file)
                }
                input.click()
              }}
              role="button"
              aria-label="썸네일 이미지 업로드"
              aria-disabled={isUploading}
            >
              {isUploading ? '업로드 중...' : '썸네일 이미지 업로드'}
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={handleNextStep}
            disabled={!thumbnailUrl || !title.trim() || !summary.trim() || isUploading}
            className="rounded bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
          >
            다음
          </button>
        </div>
      </div>
    )
  }

  // 본문 작성 단계 렌더링
  const renderContentStep = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">뉴스레터 본문 작성</h2>
          <div className="space-x-2">
            <button
              onClick={handlePrevStep}
              className="rounded px-3 py-1 text-sm hover:bg-gray-100"
            >
              이전
            </button>
            <button
              onClick={handleUndo}
              className="rounded px-3 py-1 text-sm hover:bg-gray-100"
            >
              실행 취소
            </button>
            <button
              onClick={handleRedo}
              className="rounded px-3 py-1 text-sm hover:bg-gray-100"
            >
              다시 실행
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {isSaving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
        <EditorCanvas
          blocks={blocks}
          onChange={handleBlocksChange}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 space-y-4">
          {step === 'thumbnail' ? renderThumbnailStep() : renderContentStep()}
        </div>
      </div>
    </div>
  )
} 
'use client'

import { useState, useCallback, useEffect } from 'react'
import { nanoid } from 'nanoid'
import { useRouter } from 'next/navigation'
import EditorCanvas from '@/components/editor/editor-canvas'
import { BlockControls } from '@/components/editor/block-controls'
import { EditorHistory } from '@/lib/editor-history'
import { supabase } from '@/lib/supabase-browser'
import type { EditorBlock, BlockType } from '@/types/editor'
import { toast } from 'react-hot-toast'
import Image from 'next/image'

export default function EditorPage() {
  const router = useRouter()
  const [blocks, setBlocks] = useState<EditorBlock[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [history] = useState(() => new EditorHistory())
  const [savedNewsletterId, setSavedNewsletterId] = useState<string | null>(null)
  const [step, setStep] = useState<'thumbnail' | 'content'>('thumbnail')
  const [title, setTitle] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
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
      
      // 썸네일 이미지 블록 생성
      const thumbnailBlock: EditorBlock = {
        id: nanoid(),
        type: 'image',
        content: {
          imageUrl: tempUrl,
          tempFile: file
        },
        settings: {
          style: {
            width: '100%',
            marginBottom: '20px'
          }
        }
      }
      
      // 썸네일 블록을 blocks에 추가
      setBlocks([thumbnailBlock])
      history.push([thumbnailBlock])
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '이미지 업로드 실패'
      setError(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

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
    
    // 텍스트 블록 추가
    const textBlock: EditorBlock = {
      id: nanoid(),
      type: 'text',
      content: {
        text: `# ${title}\n\n여기에 본문을 작성하세요.`
      },
      settings: {
        style: {
          lineHeight: '1.6'
        }
      }
    }
    
    // 오디오 블록 추가
    const audioBlock: EditorBlock = {
      id: nanoid(),
      type: 'audio',
      content: {},
      settings: {}
    }
    
    // 기존 썸네일 블록과 함께 새 블록들 설정
    const thumbnailBlock = blocks[0]
    const newBlocks = [thumbnailBlock, textBlock, audioBlock]
    
    setBlocks(newBlocks)
    history.push(newBlocks)
    setStep('content')
  }

  const handleAddBlock = useCallback((type: BlockType) => {
    // 썸네일 단계에서는 블록 추가 불가
    if (step === 'thumbnail') return
    
    // 이미지 블록은 이미 썸네일로 추가되었으므로 추가 불가
    if (type === 'image') {
      toast.error('이미지 블록은 썸네일로 이미 추가되었습니다')
      return
    }
    
    const newBlock: EditorBlock = {
      id: nanoid(),
      type,
      content: {},
      settings: {}
    }
    
    setBlocks(prev => {
      const newBlocks = [...prev, newBlock]
      history.push(newBlocks)
      return newBlocks
    })
  }, [history, step])

  const handleBlocksChange = useCallback((newBlocks: EditorBlock[]) => {
    setBlocks(newBlocks)
    history.push(newBlocks)
  }, [history])

  const handleSave = async () => {
    if (!thumbnailUrl) {
      toast.error('썸네일 이미지를 업로드해주세요')
      return
    }
    
    if (!title.trim()) {
      toast.error('제목을 입력해주세요')
      return
    }
    
    // 본문 텍스트 블록 확인
    const textBlock = blocks.find(block => block.type === 'text')
    if (!textBlock || !textBlock.content.text) {
      toast.error('본문을 작성해주세요')
      return
    }

    try {
      setIsSaving(true)
      
      // 이미지와 오디오 블록들의 파일을 Supabase Storage에 업로드
      const processedBlocks = await Promise.all(blocks.map(async block => {
        const { id, ...blockData } = block
        
        if (block.type === 'image' && block.content.imageUrl) {
          try {
            const response = await fetch(block.content.imageUrl)
            const blob = await response.blob()
            const filename = `newsletters/${Date.now()}-${nanoid()}.${blob.type.split('/')[1]}`
            
            const { data: uploadData, error: uploadError } = await supabase
              .storage
              .from('images')
              .upload(filename, blob)

            if (uploadError) throw uploadError

            const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${filename}`

            return {
              ...blockData,
              id: nanoid(),
              content: {
                ...block.content,
                imageUrl
              },
              settings: block.settings
            }
          } catch (error) {
            console.error('Error uploading image:', error)
            throw new Error('이미지 업로드 중 오류가 발생했습니다')
          }
        }

        // 오디오 블록 처리 추가
        if (block.type === 'audio' && block.content.audioUrl) {
          try {
            const response = await fetch(block.content.audioUrl)
            const blob = await response.blob()
            const filename = `newsletters/${Date.now()}-${nanoid()}.${blob.type.split('/')[1]}`
            
            const { data: uploadData, error: uploadError } = await supabase
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
              },
              settings: block.settings
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

      // 텍스트 블록의 내용을 요약으로 사용
      const textBlockContent = textBlock?.content.text || ''
      const summary = textBlockContent.slice(0, 200) || title

      // 첫 번째 이미지 블록의 URL을 썸네일로 사용
      const firstImageBlock = processedBlocks.find(block => block.type === 'image')
      const processedThumbnailUrl = firstImageBlock?.content.imageUrl

      if (!processedThumbnailUrl) {
        toast.error('썸네일 이미지 처리 중 오류가 발생했습니다')
        return
      }

      const { data, error } = await supabase
        .from('newsletters')
        .insert({
          title,
          content: { blocks: processedBlocks },
          summary,
          thumbnail_url: processedThumbnailUrl
        })
        .select()
        .single()

      if (error) throw error
      
      if (data) {
        setSavedNewsletterId(data.id)
        toast.success('뉴스레터가 성공적으로 저장되었습니다. 이제 발송하거나 계속 편집할 수 있습니다.', {
          duration: 5000,
          icon: '✅'
        })
      }
    } catch (error) {
      console.error('Error saving newsletter:', error)
      toast.error('저장 중 오류가 발생했습니다. 다시 시도해주세요.', {
        duration: 5000,
        icon: '❌'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSend = async (newsletterId: string) => {
    try {
      setIsSending(true)
      
      const response = await fetch(`/api/newsletters/${newsletterId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '뉴스레터 발송에 실패했습니다')
      }
      
      toast.success('뉴스레터가 성공적으로 발송되었습니다')
      
      // 발송 성공 후 발송 이력 페이지로 리다이렉트
      router.push('/admin/sends')
    } catch (error) {
      console.error('뉴스레터 발송 오류:', error)
      toast.error(error instanceof Error ? error.message : '뉴스레터 발송에 실패했습니다')
    } finally {
      setIsSending(false)
    }
  }

  const handleUndo = useCallback(() => {
    const previousState = history.undo()
    if (previousState) setBlocks(previousState)
  }, [history])

  const handleRedo = useCallback(() => {
    const nextState = history.redo()
    if (nextState) setBlocks(nextState)
  }, [history])

  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'z') {
          e.preventDefault()
          if (e.shiftKey) {
            handleRedo()
          } else {
            handleUndo()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyboard)
    return () => document.removeEventListener('keydown', handleKeyboard)
  }, [handleUndo, handleRedo])

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
          <label className="mb-2 block text-sm font-medium text-gray-700">
            썸네일 이미지
          </label>
          
          {error && (
            <div className="mb-2 text-sm text-red-500" role="alert">
              {error}
            </div>
          )}
          
          {thumbnailUrl ? (
            <div className="group relative rounded-lg border border-gray-200 p-4">
              <div className="relative h-[300px] w-full">
                <Image
                  src={thumbnailUrl}
                  alt="썸네일 이미지"
                  fill
                  className="rounded-lg object-cover"
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
                className="absolute right-6 top-6 rounded bg-white/80 px-3 py-1 text-sm hover:bg-white"
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
            disabled={!thumbnailUrl || !title.trim() || isUploading}
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
          <BlockControls onAddBlock={handleAddBlock} />
          <div className="space-x-2">
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
            <button
              onClick={() => savedNewsletterId && handleSend(savedNewsletterId)}
              disabled={isSending || isSaving || !savedNewsletterId}
              className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:opacity-50"
            >
              {isSending ? '발송 중...' : '발송하기'}
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

export const dynamic = 'force-dynamic' 
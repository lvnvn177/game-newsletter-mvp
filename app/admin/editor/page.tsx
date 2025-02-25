'use client'

import { useState, useCallback, useEffect } from 'react'
import { nanoid } from 'nanoid'
import { useRouter } from 'next/navigation'
import EditorCanvas from '@/components/editor/editor-canvas'
import { TemplateSelector } from '@/components/editor/template-selector'
import { BlockControls } from '@/components/editor/block-controls'
import { EditorHistory } from '@/lib/editor-history'
import { supabase } from '@/lib/supabase-browser'
import type { EditorBlock, Template, BlockType } from '@/types/editor'
import { toast } from 'react-hot-toast'

export default function EditorPage() {
  const router = useRouter()
  const [blocks, setBlocks] = useState<EditorBlock[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [history] = useState(() => new EditorHistory())
  const [savedNewsletterId, setSavedNewsletterId] = useState<string | null>(null)

  const handleTemplateSelect = useCallback((template: Template) => {
    const newBlocks = template.blocks.map(block => ({
      ...block,
      id: nanoid() // 새로운 ID 생성
    }))
    setBlocks(newBlocks)
    history.push(newBlocks)
  }, [history])

  const handleAddBlock = useCallback((type: BlockType) => {
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
  }, [history])

  const handleBlocksChange = useCallback((newBlocks: EditorBlock[]) => {
    setBlocks(newBlocks)
    history.push(newBlocks)
  }, [history])

  // Extract title from the first heading in text blocks
  const extractTitle = (): string => {
    const firstTextBlock = blocks.find(block => block.type === 'text')
    if (!firstTextBlock || !firstTextBlock.content.text) {
      return ''
    }

    // Try to extract title from heading format (# Title)
    const headingMatch = firstTextBlock.content.text.match(/^#\s+(.+)$/m)
    if (headingMatch && headingMatch[1]) {
      return headingMatch[1].replace(/\[게임 제목\]/, '').trim()
    }

    // If no heading format, use the first line
    const firstLine = firstTextBlock.content.text.split('\n')[0]
    return firstLine || ''
  }

  const handleSave = async () => {
    const title = extractTitle()
    
    if (!title) {
      toast.success('첫 번째 텍스트 블록에 제목(# 형식)을 입력해주세요')
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

      // 첫 번째 텍스트 블록의 내용을 요약으로 사용
      const firstTextBlock = blocks.find(block => block.type === 'text')
      const summary = firstTextBlock?.content.text?.slice(0, 200) || title

      // 첫 번째 이미지 블록의 URL을 썸네일로 사용
      const firstImageBlock = processedBlocks.find(block => block.type === 'image')
      const thumbnailUrl = firstImageBlock?.content.imageUrl

      if (!thumbnailUrl) {
        toast.error('최소한 하나의 이미지가 필요합니다')
        return
      }

      const { data, error } = await supabase
        .from('newsletters')
        .insert({
          title,
          content: { blocks: processedBlocks },
          summary,
          thumbnail_url: thumbnailUrl
        })
        .select()
        .single()

      if (error) throw error
      
      if (data) {
        setSavedNewsletterId(data.id)
        toast.success('저장되었습니다')
        // router.push('/admin/newsletters') - 이 줄을 제거하거나 주석 처리
      }
    } catch (error) {
      console.error('Error saving newsletter:', error)
      toast.error('저장 중 오류가 발생했습니다')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSend = async (newsletterId: string) => {
    try {
      setIsSending(true)
      
      const response = await fetch(`/api/newsletters/${newsletterId}/send`, {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '발송에 실패했습니다')
      }

      const result = await response.json()
      
      if (result.success) {
        toast.success(
          `발송 완료: ${result.sentCount}명의 구독자에게 발송되었습니다`
        )
      } else {
        toast.error(
          `발송 실패: ${result.failCount}명 발송 실패. ${result.error || ''}`
        )
      }
    } catch (err) {
      console.error('Error sending newsletter:', err)
      toast.error(err instanceof Error ? err.message : '발송에 실패했습니다')
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 space-y-4">
          {blocks.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-8">
              <h2 className="mb-4 text-xl font-semibold">템플릿 선택</h2>
              <TemplateSelector onSelect={handleTemplateSelect} />
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic' 
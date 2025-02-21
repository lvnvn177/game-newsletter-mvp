'use client'

import { useState, useCallback, useEffect } from 'react'
import { nanoid } from 'nanoid'
import { useRouter } from 'next/navigation'
import EditorCanvas from '@/components/editor/editor-canvas'
import { TemplateSelector } from '@/components/editor/template-selector'
import { BlockControls } from '@/components/editor/block-controls'
import { EditorHistory } from '@/lib/editor-history'
import { supabase } from '@/lib/supabase'
import type { EditorBlock, Template, BlockType } from '@/types/editor'
import { toast } from 'react-hot-toast'

export default function EditorPage() {
  const router = useRouter()
  const [blocks, setBlocks] = useState<EditorBlock[]>([])
  const [title, setTitle] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [history] = useState(() => new EditorHistory())

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

  const handleSave = async () => {
    if (!title) {
      toast.error('제목을 입력해주세요')
      return
    }

    try {
      setIsSaving(true)

      // 이미지 블록에서 임시 파일이 있는 것들만 필터링
      const imageBlocks = blocks.filter(
        block => block.type === 'image' && block.content.tempFile
      )

      // 모든 이미지 업로드 진행
      const updatedBlocks = [...blocks]
      for (const [index, block] of imageBlocks.entries()) {
        const file = block.content.tempFile as File
        const fileExt = file.name.split('.').pop()?.toLowerCase()
        const fileName = `${nanoid()}.${fileExt}`
        const filePath = `newsletters/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath)

        // 블록 업데이트
        updatedBlocks[index] = {
          ...block,
          content: {
            imageUrl: publicUrl,
            tempFile: undefined // 임시 파일 정보 제거
          }
        }
      }

      // newsletter 저장
      const { error: insertError } = await supabase
        .from('newsletters')
        .insert({
          title,
          content: { blocks: updatedBlocks },
          summary: updatedBlocks.find(b => b.type === 'text')?.content.text?.slice(0, 200) || title,
          thumbnail_url: updatedBlocks.find(b => b.type === 'image')?.content.imageUrl || '/default-thumbnail.jpg',
          owner_id: '00000000-0000-0000-0000-000000000000'
        })

      if (insertError) throw insertError

      toast.success('저장되었습니다')
      router.push('/newsletters')
    } catch (error) {
      console.error('Error saving newsletter:', error)
      toast.error('저장 중 오류가 발생했습니다')
    } finally {
      setIsSaving(false)
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
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="뉴스레터 제목"
            className="w-full rounded-lg border border-gray-200 p-4 text-2xl"
          />
          
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
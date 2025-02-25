'use client'

import { useState, useCallback } from 'react'
import { nanoid } from 'nanoid'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import EditorCanvas from '@/components/editor/editor-canvas'
import { BlockControls } from '@/components/editor/block-controls'
import { EditorHistory } from '@/lib/editor-history'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import type { EditorBlock, BlockType } from '@/types/editor'
import type { Newsletter } from '@/types/database'

interface EditNewsletterFormProps {
  newsletter: Newsletter
}

export default function EditNewsletterForm({ newsletter }: EditNewsletterFormProps) {
  const router = useRouter()
  const supabase = getSupabaseBrowser()
  const [blocks, setBlocks] = useState<EditorBlock[]>(
    newsletter.content.blocks.map(block => ({
      ...block,
      id: nanoid()
    }))
  )
  const [title, setTitle] = useState(newsletter.title)
  const [isSaving, setIsSaving] = useState(false)
  const [history] = useState(() => new EditorHistory())

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
      
      // 이미지와 오디오 블록들의 파일을 Supabase Storage에 업로드
      const processedBlocks = await Promise.all(blocks.map(async block => {
        const { id, ...blockData } = block
        
        if (block.type === 'image' && block.content.imageUrl) {
          // 기존 이미지 URL인 경우 그대로 사용
          if (block.content.imageUrl.includes(process.env.NEXT_PUBLIC_SUPABASE_URL!)) {
            return { ...blockData, id: nanoid() }
          }

          try {
            const response = await fetch(block.content.imageUrl)
            const blob = await response.blob()
            const filename = `newsletters/${Date.now()}-${nanoid()}.${blob.type.split('/')[1]}`
            
            const { error: uploadError } = await supabase
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
              }
            }
          } catch (error) {
            console.error('Error uploading image:', error)
            throw new Error('이미지 업로드 중 오류가 발생했습니다')
          }
        }

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

      const firstTextBlock = blocks.find(block => block.type === 'text')
      const summary = firstTextBlock?.content.text?.slice(0, 200) || title

      const firstImageBlock = processedBlocks.find(block => block.type === 'image')
      const thumbnailUrl = firstImageBlock?.content.imageUrl

      if (!thumbnailUrl) {
        toast.error('최소한 하나의 이미지가 필요합니다')
        return
      }

      const { error } = await supabase
        .from('newsletters')
        .update({
          title,
          content: { blocks: processedBlocks },
          summary,
          thumbnail_url: thumbnailUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', newsletter.id)

      if (error) throw error

      toast.success('저장되었습니다')
      router.push('/admin/newsletters')
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
        </div>
      </div>
    </div>
  )
} 
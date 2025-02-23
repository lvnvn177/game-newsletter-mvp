'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { EditorHistory } from '@/lib/editor-history'
import { BlockControls } from '@/components/editor/block-controls'
import EditorCanvas from '@/components/editor/editor-canvas'
import type { Newsletter, NewsletterBlock } from '@/types/database'
import type { EditorBlock } from '@/types/editor'
import { nanoid } from 'nanoid'

interface EditorPageProps {
  initialData?: Newsletter
}

export default function EditorPage({ initialData }: EditorPageProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialData?.title || '')
  const [blocks, setBlocks] = useState<EditorBlock[]>(() => 
    initialData?.content?.blocks.map(block => ({
      ...block,
      id: nanoid()
    })) || []
  )
  const [isSaving, setIsSaving] = useState(false)
  const [history] = useState(() => new EditorHistory())

  const handleSave = async () => {
    if (!title) {
      toast.error('제목을 입력해주세요')
      return
    }

    try {
      setIsSaving(true)
      const { data, error } = initialData 
        ? await supabase
            .from('newsletters')
            .update({
              title,
              content: { 
                blocks: blocks.map(({ id, ...block }) => ({
                  ...block,
                  id: nanoid()
                }))
              },
              updated_at: new Date().toISOString(),
            })
            .eq('id', initialData.id)
            .select()
            .single()
        : await supabase
            .from('newsletters')
            .insert({
              title,
              content: { 
                blocks: blocks.map(({ id, ...block }) => ({
                  ...block,
                  id: nanoid()
                }))
              },
              summary: '',
              thumbnail_url: '',
            })
            .select()
            .single()

      if (error) throw error
      
      toast.success('저장되었습니다')
      if (!initialData) {
        router.push('/admin/newsletters')
      }
    } catch (error) {
      console.error('Error saving newsletter:', error)
      toast.error('저장 중 오류가 발생했습니다')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="mb-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="뉴스레터 제목"
          className="w-full rounded-lg border p-2 text-xl"
        />
      </div>
      
      <div className="mb-6 flex justify-end gap-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {isSaving ? '저장 중...' : '저장'}
        </button>
      </div>

      <EditorCanvas
        blocks={blocks}
        onChange={setBlocks}
      />
    </div>
  )
} 
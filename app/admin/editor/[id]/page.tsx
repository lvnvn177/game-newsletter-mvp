'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-browser'
import type { Newsletter } from '@/types/database'
import { toast } from 'react-hot-toast'
import EditorCanvas from '@/components/editor/editor-canvas'
import { BlockControls } from '@/components/editor/block-controls'
import { EditorHistory } from '@/lib/editor-history'
import { Block, BlockType } from '@/types/editor'

interface EditorPageProps {
  params: { id: string }
}

export default function EditNewsletterPage({ params }: EditorPageProps) {
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchNewsletter()
  }, [params.id])

  const fetchNewsletter = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('newsletters')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      setNewsletter(data)
    } catch (err) {
      console.error('Error fetching newsletter:', err)
      setError('뉴스레터를 불러오는데 실패했습니다')
      toast.error('뉴스레터를 불러오는데 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!newsletter) return

    try {
      setIsSaving(true)
      const { error } = await supabase
        .from('newsletters')
        .update({
          title: newsletter.title,
          content: newsletter.content,
          summary: newsletter.summary,
          thumbnail_url: newsletter.thumbnail_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)

      if (error) throw error
      toast.success('저장되었습니다')
    } catch (err) {
      console.error('Error saving newsletter:', err)
      toast.error('저장에 실패했습니다')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">로딩중...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-red-500">{error}</div>
      </div>
    )
  }

  if (!newsletter) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">뉴스레터를 찾을 수 없습니다</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">뉴스레터 수정</h1>
          <div className="space-x-2">
            <button
              onClick={() => router.back()}
              className="rounded px-4 py-2 text-gray-600 hover:bg-gray-100"
            >
              취소
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

        <div className="rounded-lg bg-white p-6 shadow">
          <input
            type="text"
            value={newsletter.title}
            onChange={(e) => setNewsletter({ ...newsletter, title: e.target.value })}
            placeholder="뉴스레터 제목"
            className="mb-4 w-full rounded-lg border p-2 text-xl"
          />
          <EditorCanvas
            blocks={newsletter.content.blocks as Block[]}
            onChange={(blocks) => setNewsletter({
              ...newsletter,
              content: { ...newsletter.content, blocks: blocks as Newsletter['content']['blocks'] }
            })}
          />
          <div className="mt-4">
            <BlockControls
              onAddBlock={(type: BlockType) => {
                const newBlock: Block = {
                  id: crypto.randomUUID(),
                  type,
                  content: {},
                  settings: {}
                }
                setNewsletter({
                  ...newsletter,
                  content: {
                    ...newsletter.content,
                    blocks: [...newsletter.content.blocks, newBlock]
                  }
                })
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 
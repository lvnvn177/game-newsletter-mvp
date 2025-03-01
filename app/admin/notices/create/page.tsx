'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-browser'
import { toast } from 'react-hot-toast'
import { NoticeTextBlock } from '@/components/notice/notice-text-block'

export default function CreateNoticePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [published, setPublished] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('제목을 입력해주세요')
      return
    }
    
    if (!content.trim()) {
      toast.error('내용을 작성해주세요')
      return
    }

    try {
      setIsSaving(true)
      toast.loading('공지사항을 저장하는 중입니다...', { id: 'saving' })

      const { data, error } = await supabase
        .from('notices')
        .insert({
          title,
          content,
          published
        })
        .select()
        .single()

      if (error) throw error
      
      toast.success('공지사항이 성공적으로 저장되었습니다', {
        id: 'saving',
        duration: 5000,
        icon: '✅'
      })
      
      // 공지사항 관리 페이지로 리다이렉트
      router.push('/admin/notices')
    } catch (error) {
      console.error('Error saving notice:', error)
      toast.error('저장 중 오류가 발생했습니다. 다시 시도해주세요.', {
        id: 'saving',
        duration: 5000,
        icon: '❌'
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-8">
            <h2 className="mb-6 text-xl font-semibold">공지사항 작성</h2>
            
            <NoticeTextBlock
              label="제목"
              value={title}
              onChange={setTitle}
              placeholder="공지사항 제목을 입력하세요"
              height={100}
              preview="edit"
            />
            
            <NoticeTextBlock
              label="내용 (마크다운 형식 지원)"
              value={content}
              onChange={setContent}
              placeholder="공지사항 내용을 작성하세요. 마크다운 형식을 지원합니다."
              height={400}
              preview="live"
            />
            
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                <span className="text-sm text-gray-700">바로 게시하기</span>
              </label>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => router.push('/admin/notices')}
                className="rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
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
        </div>
      </div>
    </div>
  )
} 
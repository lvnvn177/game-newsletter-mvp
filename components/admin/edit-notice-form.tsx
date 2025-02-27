'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import type { Notice } from '@/types/database'

interface EditNoticeFormProps {
  notice: Notice
}

export default function EditNoticeForm({ notice }: EditNoticeFormProps) {
  const router = useRouter()
  const supabase = getSupabaseBrowser()
  
  const [title, setTitle] = useState(notice.title)
  const [content, setContent] = useState(notice.content)
  const [published, setPublished] = useState(notice.published)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!title) {
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

      // 공지사항 업데이트
      const { error } = await supabase
        .from('notices')
        .update({
          title,
          content,
          published,
          updated_at: new Date().toISOString()
        })
        .eq('id', notice.id)

      if (error) {
        console.error('Error updating notice:', error)
        throw error
      }
      
      toast.success('공지사항이 성공적으로 저장되었습니다', {
        id: 'saving',
        duration: 5000,
        icon: '✅'
      })
      
      // 캐시를 무효화하고 페이지 새로고침
      router.refresh()
      
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
            <h2 className="mb-6 text-xl font-semibold">공지사항 수정</h2>
            
            <div className="mb-6">
              <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-700">
                제목
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="공지사항 제목을 입력하세요"
                className="w-full rounded-lg border border-gray-300 p-3 text-lg"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="content" className="mb-2 block text-sm font-medium text-gray-700">
                내용 (마크다운 형식 지원)
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="공지사항 내용을 작성하세요. 마크다운 형식을 지원합니다."
                className="w-full rounded-lg border border-gray-300 p-3 text-base font-mono"
                rows={15}
              />
            </div>
            
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                <span className="text-sm text-gray-700">게시하기</span>
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
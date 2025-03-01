'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { deleteNotice, publishNotice } from '@/lib/notice'
import type { Notice } from '@/types/database'

interface AdminNoticeActionsProps {
  notice: Notice
}

export function AdminNoticeActions({ notice }: AdminNoticeActionsProps) {
  const router = useRouter()
  const [isPublished, setIsPublished] = useState(notice.published)
  const [isLoading, setIsLoading] = useState(false)

  const handleEdit = () => {
    router.push(`/admin/notices/${notice.id}`)
  }

  const handleDelete = async () => {
    if (!window.confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
      return
    }

    setIsLoading(true)
    try {
      const success = await deleteNotice(notice.id)
      if (success) {
        toast.success('공지사항이 삭제되었습니다')
        router.push('/admin/notices')
      }
    } catch (err) {
      console.error('Error deleting notice:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePublishToggle = async () => {
    setIsLoading(true)
    try {
      const success = await publishNotice(notice.id, !isPublished)
      if (success) {
        setIsPublished(!isPublished)
      }
    } catch (err) {
      console.error('Error toggling publish status:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mb-8 flex items-center justify-end space-x-2">
      <button
        onClick={handlePublishToggle}
        disabled={isLoading}
        className={`rounded px-4 py-2 text-sm font-medium ${
          isPublished 
            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
            : 'bg-green-100 text-green-700 hover:bg-green-200'
        }`}
      >
        {isPublished ? '비공개로 전환' : '게시하기'}
      </button>
      
      <button
        onClick={handleEdit}
        disabled={isLoading}
        className="rounded bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200"
      >
        수정
      </button>
      
      <button
        onClick={handleDelete}
        disabled={isLoading}
        className="rounded bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
      >
        삭제
      </button>
    </div>
  )
} 
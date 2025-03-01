'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { deleteNewsletterClient } from '@/lib/newsletter'
import type { Newsletter } from '@/types/database'

interface AdminNewsletterActionsProps {
  newsletter: Newsletter
}

export function AdminNewsletterActions({ newsletter }: AdminNewsletterActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleEdit = () => {
    router.push(`/admin/editor/${newsletter.id}`)
  }

  const handleDelete = async () => {
    if (!window.confirm('정말로 이 뉴스레터를 삭제하시겠습니까?')) {
      return
    }

    setIsLoading(true)
    try {
      const success = await deleteNewsletterClient(newsletter.id)
      if (success) {
        toast.success('뉴스레터가 삭제되었습니다')
        router.push('/admin/newsletters')
      }
    } catch (err) {
      console.error('Error deleting newsletter:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = async () => {
    if (!window.confirm('이 뉴스레터를 모든 구독자에게 발송하시겠습니까?')) {
      return
    }

    setIsLoading(true)
    try {
      toast.loading('뉴스레터를 발송하는 중입니다...', { id: 'sending' })
      
      const response = await fetch(`/api/newsletters/${newsletter.id}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '뉴스레터 발송에 실패했습니다')
      }
      
      toast.success('뉴스레터가 성공적으로 발송되었습니다', {
        id: 'sending',
        duration: 5000,
        icon: '✅'
      })
    } catch (error) {
      console.error('뉴스레터 발송 오류:', error)
      toast.error(error instanceof Error ? error.message : '뉴스레터 발송에 실패했습니다', {
        id: 'sending',
        duration: 5000,
        icon: '❌'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mb-8 flex items-center justify-end space-x-2">
      <button
        onClick={handleSend}
        disabled={isLoading}
        className="rounded bg-green-100 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-200"
      >
        발송하기
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
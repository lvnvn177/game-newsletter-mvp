'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-browser'
import { toast } from 'react-hot-toast'
import type { Newsletter } from '@/types/database'
import { deleteNewsletter } from '@/lib/newsletter'

export default function AdminNewslettersPage() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchNewsletters()
  }, [])

  const fetchNewsletters = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletters')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setNewsletters(data || [])
    } catch (err) {
      console.error('Error fetching newsletters:', err)
      setError('뉴스레터를 불러오는데 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      await deleteNewsletter(id)
      setNewsletters(newsletters.filter(n => n.id !== id))
      toast.success('뉴스레터가 삭제되었습니다')
    } catch (err) {
      console.error('Error deleting newsletter:', err)
      toast.error('삭제에 실패했습니다')
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">뉴스레터 관리</h1>
        <Link 
          href="/admin/editor"
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          새 뉴스레터
        </Link>
      </div>

      {isLoading && <div>로딩중...</div>}
      {error && <div className="text-red-500">{error}</div>}
      
      <div className="grid gap-4">
        {newsletters.map(newsletter => (
          <div 
            key={newsletter.id}
            className="flex items-center justify-between rounded-lg border bg-white p-4"
          >
            <div>
              <h3 className="font-medium">{newsletter.title}</h3>
              <p className="text-sm text-gray-500">
                {new Date(newsletter.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/admin/editor/${newsletter.id}`}
                className="rounded bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200"
              >
                수정
              </Link>
              <button
                onClick={() => handleDelete(newsletter.id)}
                className="rounded bg-red-100 px-3 py-1 text-sm text-red-600 hover:bg-red-200"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 
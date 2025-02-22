'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { NewsletterSend } from '@/types/database'
import Link from 'next/link'

export function SendHistory() {
  const [sends, setSends] = useState<NewsletterSend[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSendHistory()
  }, [])

  const fetchSendHistory = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('newsletter_sends')
        .select(`
          *,
          newsletter:newsletters (
            title
          )
        `)
        .order('sent_at', { ascending: false })

      if (error) throw error
      setSends(data || [])
    } catch (err) {
      console.error('Error fetching send history:', err)
      setError('발송 이력을 불러오는데 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <div>발송 이력을 불러오는 중...</div>
  if (error) return <div className="text-red-500">{error}</div>
  if (sends.length === 0) return <div>발송 이력이 없습니다</div>

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">뉴스레터</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">발송일시</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">상태</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">발송수</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">결과</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {sends.map((send) => (
            <tr key={send.id}>
              <td className="px-6 py-4">
                <Link 
                  href={`/newsletter/${send.newsletter_id}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {(send.newsletter as any)?.title || '삭제된 뉴스레터'}
                </Link>
              </td>
              <td className="px-6 py-4">
                {new Date(send.sent_at).toLocaleString()}
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                  send.status === 'success' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {send.status === 'success' ? '성공' : '실패'}
                </span>
              </td>
              <td className="px-6 py-4">
                {send.total_recipients}명
              </td>
              <td className="px-6 py-4">
                {send.status === 'success' ? (
                  <span className="text-green-600">
                    성공: {send.metadata?.success_count || 0}명
                  </span>
                ) : (
                  <span className="text-red-600">
                    실패: {send.metadata?.fail_count || 0}명
                    {send.error_message && (
                      <span className="ml-2 text-sm text-gray-500">
                        ({send.error_message})
                      </span>
                    )}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 
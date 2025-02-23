'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Subscriber } from '@/types/database'
import { toast } from 'react-hot-toast'
import { CSVUpload } from '@/components/subscribers/csv-upload'
import { AddSubscriberModal } from '@/components/subscribers/add-subscriber-modal'

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    fetchSubscribers()
  }, [])

  const fetchSubscribers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .order('added_at', { ascending: false })

      if (error) throw error
      setSubscribers(data || [])
    } catch (err) {
      console.error('Error fetching subscribers:', err)
      setError('구독자 목록을 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('subscribers')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setSubscribers(prev => prev.filter(sub => sub.id !== id))
      toast.success('구독자가 삭제되었습니다')
    } catch (err) {
      console.error('Error deleting subscriber:', err)
      toast.error('구독자 삭제에 실패했습니다')
    }
  }

  if (isLoading) return <div>로딩중...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">구독자 관리</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setShowAddModal(true)}
              className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              구독자 추가
            </button>
            <CSVUpload onUploadSuccess={fetchSubscribers} />
          </div>
        </div>

        <div className="rounded-lg bg-white shadow">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="px-6 py-3 text-left">이메일</th>
                <th className="px-6 py-3 text-left">구독일</th>
                <th className="px-6 py-3 text-right">작업</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id} className="border-b">
                  <td className="px-6 py-4">{subscriber.email}</td>
                  <td className="px-6 py-4">
                    {new Date(subscriber.added_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(subscriber.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <AddSubscriberModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchSubscribers}
      />
    </div>
  )
} 
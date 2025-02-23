'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { AddSubscriberModal } from '@/components/subscribers/add-subscriber-modal'
import { CSVUpload } from '@/components/subscribers/csv-upload'
import { toast } from 'react-hot-toast'

interface Subscriber {
  id: string
  email: string
  added_at: string
  confirmed: boolean
  confirmed_at: string | null
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [showAddModal, setShowAddModal] = useState(false)

  const fetchSubscribers = async () => {
    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('id, email, added_at, confirmed, confirmed_at')
        .order('added_at', { ascending: false })

      if (error) throw error
      if (data) setSubscribers(data)
    } catch (err) {
      console.error('Error fetching subscribers:', err)
      toast.error('구독자 목록을 불러오는데 실패했습니다')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('subscribers')
        .delete()
        .eq('id', id)

      if (error) throw error

      setSubscribers(subscribers.filter(sub => sub.id !== id))
      toast.success('구독자가 삭제되었습니다')
    } catch (err) {
      console.error('Error deleting subscriber:', err)
      toast.error('구독자 삭제에 실패했습니다')
    }
  }

  useEffect(() => {
    fetchSubscribers()
  }, [])

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
                <th className="px-6 py-3 text-left">상태</th>
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
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        subscriber.confirmed
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {subscriber.confirmed ? '확인됨' : '대기중'}
                    </span>
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
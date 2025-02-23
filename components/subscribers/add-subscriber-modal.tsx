'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'

interface AddSubscriberModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddSubscriberModal({ isOpen, onClose, onSuccess }: AddSubscriberModalProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }

      toast.success('구독자가 추가되었습니다')
      onSuccess()
      onClose()
      setEmail('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '구독자 추가에 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <h2 className="mb-4 text-xl font-bold">구독자 추가</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일 주소"
            className="mb-4 w-full rounded-lg border p-2"
            required
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? '처리중...' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 
'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'

export function SubscribeForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

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

      toast.success('축하합니다! 앞으로 최신 게임 뉴스레터를 받아보실 수 있습니다!', {
        duration: 5000,
        icon: '🎮',
      })
      setEmail('')
    } catch (err) {
      console.error('Error subscribing:', err)
      const errorMessage = err instanceof Error 
        ? err.message 
        : '구독 신청에 실패했습니다. 잠시 후 다시 시도해주세요.';
      
      toast.error(errorMessage, {
        duration: 4000,
        icon: '❌',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="이메일을 입력해주세요"
        className="flex-1 rounded border p-2"
        required
      />
      <button
        type="submit"
        disabled={isLoading}
        className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {isLoading ? '처리중...' : '구독하기'}
      </button>
    </form>
  )
} 
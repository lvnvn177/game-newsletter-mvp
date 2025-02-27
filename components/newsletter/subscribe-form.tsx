'use client'

import { useState } from 'react'
import { toast, Toaster } from 'react-hot-toast'

export function SubscribeForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    try {
      setIsLoading(true)
      setMessage(null)
      
      const response = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || '구독 신청에 실패했습니다.')
      }

      // 토스트 메시지와 함께 상태 메시지도 설정
      const successMsg = '축하합니다! 앞으로 최신 게임 뉴스레터를 받아보실 수 있습니다!'
      toast.success(successMsg, {
        duration: 5000,
        icon: '🎮',
      })
      setMessage({type: 'success', text: successMsg})
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
      setMessage({type: 'error', text: errorMessage})
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
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
      
      {/* 메시지 표시 영역 추가 */}
      {message && (
        <div className={`mt-3 p-3 rounded ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <p>{message.type === 'success' ? '🎮 ' : '❌ '}{message.text}</p>
        </div>
      )}
      
      {/* Toaster 컴포넌트 추가 */}
      <Toaster position="bottom-center" />
    </div>
  )
} 
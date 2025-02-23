'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ConfirmSubscriptionPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'confirming' | 'success' | 'error'>('confirming')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const confirmSubscription = async () => {
      try {
        const token = searchParams.get('token')
        if (!token) throw new Error('유효하지 않은 토큰입니다')

        const { error } = await supabase
          .from('subscribers')
          .update({
            confirmed: true,
            confirmed_at: new Date().toISOString(),
            confirm_token: null
          })
          .eq('confirm_token', token)

        if (error) throw error
        setStatus('success')
      } catch (err) {
        console.error('Confirmation error:', err)
        setStatus('error')
        setError('구독 확인에 실패했습니다')
      }
    }

    confirmSubscription()
  }, [searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
        {status === 'confirming' && (
          <div>구독을 확인하는 중입니다...</div>
        )}
        {status === 'success' && (
          <div>
            <h1 className="mb-4 text-2xl font-bold text-green-600">구독이 확인되었습니다!</h1>
            <p>이제부터 뉴스레터를 받아보실 수 있습니다.</p>
          </div>
        )}
        {status === 'error' && (
          <div>
            <h1 className="mb-4 text-2xl font-bold text-red-600">오류가 발생했습니다</h1>
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  )
} 
'use client'

import { Suspense } from 'react'
import { ConfirmSubscriptionContent } from '@/components/subscribers/confirm-subscription-content'

export default function ConfirmSubscriptionPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
        <Suspense fallback={<div>구독을 확인하는 중입니다...</div>}>
          <ConfirmSubscriptionContent />
        </Suspense>
      </div>
    </div>
  )
} 
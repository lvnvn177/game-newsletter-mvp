import { Suspense } from 'react'
import { SendHistory } from '@/components/sends/send-history'

export default function SendsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-2xl font-bold">발송 이력</h1>
        <Suspense fallback={<div>로딩중...</div>}>
          <SendHistory />
        </Suspense>
      </div>
    </div>
  )
} 
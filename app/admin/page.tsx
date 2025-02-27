import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Subscriber, NewsletterSend } from '@/types/database'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

export default async function AdminDashboardPage() {
  const supabase = createServerComponentClient({ cookies })
  
  // 구독자 수 조회
  const { count: subscriberCount, error: subscriberError } = await supabase
    .from('subscribers')
    .select('*', { count: 'exact', head: true })
  
  // 발송된 뉴스레터 수 조회
  const { count: newsletterSendCount, error: newsletterSendError } = await supabase
    .from('newsletter_sends')
    .select('*', { count: 'exact', head: true })
  
  if (subscriberError || newsletterSendError) {
    console.error('대시보드 데이터 조회 오류:', subscriberError || newsletterSendError)
  }

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-8 text-2xl font-bold">관리자 대시보드</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-2 font-semibold">총 구독자</h2>
          {subscriberError ? (
            <p className="text-red-500">데이터를 불러오는 중 오류가 발생했습니다</p>
          ) : (
            <p className="text-3xl font-bold">{subscriberCount?.toLocaleString() || 0}</p>
          )}
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-2 font-semibold">발송된 뉴스레터</h2>
          {newsletterSendError ? (
            <p className="text-red-500">데이터를 불러오는 중 오류가 발생했습니다</p>
          ) : (
            <p className="text-3xl font-bold">{newsletterSendCount?.toLocaleString() || 0}</p>
          )}
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-2 font-semibold">최근 활동</h2>
          {/* 활동 로그 추가 예정 */}
        </div>
      </div>
    </div>
  )
} 
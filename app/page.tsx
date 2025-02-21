import { Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import NewsletterCard from '@/components/newsletter-card'

async function getLatestNewsletters() {
  const { data, error } = await supabase
    .from('newsletters')
    .select('id, title, summary, thumbnail_url, created_at')
    .order('created_at', { ascending: false })
    .limit(3)

  if (error) throw error
  return data
}

export default async function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-12">
        {/* Hero 섹션 */}
        <section className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            게임 뉴스레터 빌더
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            게임 관련 뉴스와 업데이트를 쉽게 제작하고 공유하세요
          </p>
        </section>

        {/* 최신 뉴스레터 섹션 */}
        <section>
          <h2 className="mb-6 text-2xl font-semibold text-gray-900">
            최신 뉴스레터
          </h2>
          <Suspense fallback={<div>로딩중...</div>}>
            <LatestNewsletters />
          </Suspense>
        </section>
      </main>
    </div>
  )
}

async function LatestNewsletters() {
  const newsletters = await getLatestNewsletters()
  
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {newsletters.map((newsletter) => (
        <NewsletterCard key={newsletter.id} newsletter={newsletter} />
      ))}
    </div>
  )
}

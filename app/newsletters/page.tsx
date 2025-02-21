import { Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import NewsletterCard from '@/components/newsletter-card'

async function getAllNewsletters() {
  const { data, error } = await supabase
    .from('newsletters')
    .select('id, title, summary, thumbnail_url, created_at')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export default async function NewslettersPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          모든 뉴스레터
        </h1>
        <Suspense fallback={<div>로딩중...</div>}>
          <NewsletterGrid />
        </Suspense>
      </div>
    </div>
  )
}

async function NewsletterGrid() {
  const newsletters = await getAllNewsletters()
  
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {newsletters.map((newsletter) => (
        <NewsletterCard key={newsletter.id} newsletter={newsletter} />
      ))}
    </div>
  )
} 
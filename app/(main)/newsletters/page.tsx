import { Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import NewsletterGrid from '@/components/newsletter/newsletter-grid'

async function getAllNewsletters() {
  const { data, error } = await supabase
    .from('newsletters')
    .select('id, title, summary, thumbnail_url, created_at')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export default async function NewslettersPage() {
  const newsletters = await getAllNewsletters()
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          모든 뉴스레터
        </h1>
        <Suspense fallback={<div>로딩중...</div>}>
          <NewsletterGrid initialNewsletters={newsletters} />
        </Suspense>
      </div>
    </div>
  )
} 
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import NewsletterGrid from '@/components/newsletter/newsletter-grid'
import type { Newsletter } from '@/types/database'

async function getNewsletters(): Promise<Newsletter[]> {
  const { data, error } = await supabase
    .from('newsletters')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching newsletters:', error)
    return []
  }
  
  return data || []
}

export default async function AdminNewslettersPage() {
  const newsletters = await getNewsletters()
  
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">뉴스레터 관리</h1>
        <Link 
          href="/admin/editor" 
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          새 뉴스레터 작성
        </Link>
      </div>
      
      {newsletters.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">등록된 뉴스레터가 없습니다.</p>
          <Link 
            href="/admin/editor" 
            className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            첫 뉴스레터 작성하기
          </Link>
        </div>
      ) : (
        <NewsletterGrid initialNewsletters={newsletters} isAdmin={true} />
      )}
    </div>
  )
}

export const dynamic = 'force-dynamic' 
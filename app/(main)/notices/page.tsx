import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import NoticeGrid from '@/components/notice/notice-grid'
import type { NoticeListItem } from '@/types/database'

export const metadata: Metadata = {
  title: '공지사항',
  description: '중요한 공지사항을 확인하세요',
}

async function getNotices(): Promise<NoticeListItem[]> {
  const { data, error } = await supabase
    .from('notices')
    .select('id, title, created_at, updated_at, published')
    .eq('published', true)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching notices:', error)
    return []
  }
  
  return data || []
}

export default async function NoticesPage() {
  const notices = await getNotices()
  
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">공지사항</h1>
      
      {notices.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">등록된 공지사항이 없습니다.</p>
        </div>
      ) : (
        <NoticeGrid initialNotices={notices} />
      )}
    </div>
  )
}

export const dynamic = 'force-dynamic' 
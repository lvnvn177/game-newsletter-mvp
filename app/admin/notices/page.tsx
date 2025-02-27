import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import NoticeGrid from '@/components/notice/notice-grid'
import type { NoticeListItem } from '@/types/database'

async function getNotices(): Promise<NoticeListItem[]> {
  const { data, error } = await supabase
    .from('notices')
    .select('id, title, created_at, updated_at, published')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching notices:', error)
    return []
  }
  
  return data || []
}

export default async function AdminNoticesPage() {
  const notices = await getNotices()
  
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">공지사항 관리</h1>
        <Link 
          href="/admin/notices/create" 
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          새 공지사항 작성
        </Link>
      </div>
      
      {notices.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">등록된 공지사항이 없습니다.</p>
          <Link 
            href="/admin/notices/create" 
            className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            첫 공지사항 작성하기
          </Link>
        </div>
      ) : (
        <NoticeGrid initialNotices={notices} isAdmin={true} />
      )}
    </div>
  )
}

export const dynamic = 'force-dynamic' 
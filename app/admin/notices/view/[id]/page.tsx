import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { NoticeContent } from '@/components/notice/notice-content'
import { AdminNoticeActions } from '@/components/notice/admin-notice-actions'
import type { Notice } from '@/types/database'

type Params = Promise<{ id: string }>;

interface PageProps {
  params: Params
}

async function getNotice(id: string) {
  const { data, error } = await supabase
    .from('notices')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data as Notice
}

export default async function AdminNoticePage({ params }: PageProps) {
  const { id } = await params;
  const notice = await getNotice(id);

  if (!notice) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">공지사항 상세</h1>
        </div>
        
        <AdminNoticeActions notice={notice} />
        
        <div className="rounded-lg border border-gray-200 bg-white p-8">
          {/* 헤더 */}
          <header className="mb-8">
            <h2 className="mb-4 text-3xl font-bold">{notice.title}</h2>
            <div className="mb-6 flex items-center justify-between text-gray-600">
              <time dateTime={notice.created_at}>
                작성일: {formatDate(notice.created_at)}
              </time>
              {notice.updated_at && notice.updated_at !== notice.created_at && (
                <time dateTime={notice.updated_at}>
                  수정일: {formatDate(notice.updated_at)}
                </time>
              )}
              <span className={notice.published ? 'text-green-600' : 'text-gray-500'}>
                {notice.published ? '게시됨' : '비공개'}
              </span>
            </div>
          </header>

          {/* 콘텐츠 */}
          <NoticeContent content={notice.content} />
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic' 
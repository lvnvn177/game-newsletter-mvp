import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { NoticeContent } from '@/components/notice/notice-content'

type Params = Promise<{ id: string }>;

interface PageProps {
  params: Params
}

async function getNotice(id: string) {
  const { data, error } = await supabase
    .from('notices')
    .select('*')
    .eq('id', id)
    .eq('published', true)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const notice = await getNotice(id);
  
  if (!notice) {
    return {
      title: '공지사항을 찾을 수 없습니다'
    };
  }

  return {
    title: notice.title,
    description: notice.title,
  };
}

export default async function NoticePage({ params }: PageProps) {
  const { id } = await params;
  const notice = await getNotice(id);

if (!notice) {
    notFound();
  }

  return (
    <article className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-12">
        {/* 헤더 */}
        <header className="mb-8">
          <h1 className="mb-4 text-4xl font-bold">{notice.title}</h1>
          <div className="mb-6 text-gray-600">
            <time dateTime={notice.created_at}>
              {formatDate(notice.created_at)}
            </time>
          </div>
        </header>

        {/* 콘텐츠 */}
        <NoticeContent content={notice.content} />
      </div>
    </article>
  );
} 
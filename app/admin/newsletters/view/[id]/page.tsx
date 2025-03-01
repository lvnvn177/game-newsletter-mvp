import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { format } from 'date-fns'

import { getNewsletterById } from '@/lib/newsletter'
import { AdminNewsletterActions } from '@/components/newsletter/admin-newsletter-actions'
import { NewsletterContent } from '@/components/newsletter/newsletter-content'
import { Badge } from '@/components/ui/badge'

type Params = Promise<{ id: string }>;

export const metadata: Metadata = {
  title: '뉴스레터 상세 보기',
  description: '뉴스레터 상세 내용을 확인합니다.',
}

export default async function AdminNewsletterViewPage({ params }: { params: Params }) {
  const { id } = await params
  const newsletter = await getNewsletterById(id)

  if (!newsletter) {
    notFound()
  }

  return (
    <div className="container mx-auto max-w-4xl py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{newsletter.title}</h1>
        <AdminNewsletterActions newsletter={newsletter} />
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">작성일:</span>
          <span className="text-sm font-medium">
            {format(new Date(newsletter.created_at), 'yyyy년 MM월 dd일')}
          </span>
        </div>
        <Badge variant={newsletter.is_sent ? 'default' : 'outline'}>
          {newsletter.is_sent ? '발송됨' : '미발송'}
        </Badge>
      </div>

      {newsletter.thumbnail_url && (
        <div className="mb-8 overflow-hidden rounded-lg">
          <Image
            src={newsletter.thumbnail_url}
            alt={newsletter.title}
            width={800}
            height={400}
            className="w-full object-cover"
          />
        </div>
      )}

      <div className="mb-6">
        <h2 className="mb-2 text-xl font-semibold">요약</h2>
        <p className="text-muted-foreground">{newsletter.summary}</p>
      </div>

      <div className="border-t pt-6">
        <h2 className="mb-6 text-xl font-semibold">뉴스레터 내용</h2>
        <NewsletterContent blocks={newsletter.content} />
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic' 
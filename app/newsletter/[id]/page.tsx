import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { NewsletterBlockRenderer } from '@/components/newsletter/block-renderer'
import { ShareButtons } from '@/components/newsletter/share-buttons'
import { SubscribeForm } from '@/components/newsletter/subscribe-form'

type Params = Promise<{ id: string }>;

// 타입
interface PageProps {
  params: Params
}

async function getNewsletter(id: string) {
  const { data, error } = await supabase
    .from('newsletters')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const newsletter = await getNewsletter(id);
  
  if (!newsletter) {
    return {
      title: '뉴스레터를 찾을 수 없습니다'
    };
  }

  return {
    title: newsletter.title,
    description: newsletter.summary,
    openGraph: {
      title: newsletter.title,
      description: newsletter.summary,
      images: [newsletter.thumbnail_url],
    },
    twitter: {
      card: 'summary_large_image',
      title: newsletter.title,
      description: newsletter.summary,
      images: [newsletter.thumbnail_url],
    }
  };
}

export default async function NewsletterPage({ params }: PageProps) {
  const { id } = await params;
  const newsletter = await getNewsletter(id);

  if (!newsletter) {
    notFound();
  }

  // 첫 번째 텍스트 블록이 제목과 동일한 경우 필터링
  const contentBlocks = newsletter.content.blocks.filter((block: any, index: number) => {
    // 첫 번째 텍스트 블록이고 내용이 제목과 동일한 경우 제외
    if (index === 0 && block.type === 'text' && block.content.text) {
      const cleanText = block.content.text.replace(/^#\s+/, '').trim(); // # 기호와 공백 제거
      return cleanText !== newsletter.title; // 제목과 일치하면 false 반환(필터링)
    }
    return true;
  });

  const currentUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/newsletter/${id}`;

  return (
    <article className="min-h-screen bg-white">
      {/* 헤더 이미지 */}
      {newsletter.thumbnail_url && (
        <div className="relative h-[40vh] w-full">
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent" />
          <img
            src={newsletter.thumbnail_url}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="mx-auto max-w-3xl px-4 py-12">
        {/* 헤더 */}
        <header className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold">{newsletter.title}</h1>
          {/* <div className="mb-6 text-gray-600">{newsletter.summary}</div> */}
          <ShareButtons url={currentUrl} title={newsletter.title} />
        </header>

        {/* 콘텐츠 */}
        <div className="space-y-8">
          {contentBlocks.map((block: any, index: number) => (
            <NewsletterBlockRenderer key={`${block.id}-${index}`} block={block} />
          ))}
        </div>

        {/* 구독 섹션 */}
        <div className="mt-12 rounded-lg bg-gray-50 p-8 text-center">
          <h2 className="mb-4 text-2xl font-semibold">뉴스레터 구독하기</h2>
          <p className="mb-6 text-gray-600">
            매주 새로운 게임 소식을 이메일로 받아보세요.
          </p>
          <div className="mx-auto max-w-md">
            <SubscribeForm />
          </div>
        </div>
      </div>
    </article>
  );
} 
'use client'

import dynamic from 'next/dynamic'

// Markdown 컴포넌트를 dynamic import로 로드
const MDPreview = dynamic(
  () => import('@uiw/react-markdown-preview').then((mod) => mod.default),
  { ssr: false }
)

interface NoticeContentProps {
  content: string
}

export function NoticeContent({ content }: NoticeContentProps) {
  return (
    <div className="prose prose-lg max-w-none" data-color-mode="light">
      <MDPreview source={content} />
    </div>
  )
} 
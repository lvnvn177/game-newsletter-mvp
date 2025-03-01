'use client'

import Image from 'next/image'
import dynamic from 'next/dynamic'
import type { EditorBlock } from '@/types/editor'

// Markdown 컴포넌트를 dynamic import로 로드
const MDPreview = dynamic(
  () => import('@uiw/react-markdown-preview').then((mod) => mod.default),
  { ssr: false }
)

interface NewsletterContentProps {
  blocks: EditorBlock[]
}

export function NewsletterContent({ blocks }: NewsletterContentProps) {
  return (
    <div className="space-y-6">
      {blocks.map((block, index) => (
        <div key={index} className="newsletter-block">
          {block.type === 'text' && block.content.text && (
            <div className="prose prose-lg max-w-none" data-color-mode="light">
              <MDPreview source={block.content.text} />
            </div>
          )}
          
          {block.type === 'image' && block.content.imageUrl && (
            <div className="relative my-4 overflow-hidden rounded-lg">
              <Image
                src={block.content.imageUrl}
                alt="뉴스레터 이미지"
                width={800}
                height={400}
                className="w-full object-cover"
              />
            </div>
          )}
          
          {block.type === 'audio' && block.content.audioUrl && (
            <div className="my-4">
              <audio
                controls
                className="w-full"
                src={block.content.audioUrl}
              />
            </div>
          )}
          
          {block.type === 'button' && block.content.buttonText && block.content.buttonUrl && (
            <div className="my-4 text-center">
              <a
                href={block.content.buttonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
              >
                {block.content.buttonText}
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  )
} 
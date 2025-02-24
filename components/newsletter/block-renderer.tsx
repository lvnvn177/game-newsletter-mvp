'use client'

import Image from 'next/image'
import type { EditorBlock } from '@/types/editor'

interface BlockRendererProps {
  block: EditorBlock
}

export function NewsletterBlockRenderer({ block }: BlockRendererProps) {
  switch (block.type) {
    case 'text':
      return (
        <div 
          className="prose prose-lg max-w-none"
          style={block.settings.style}
          dangerouslySetInnerHTML={{ __html: block.content.text || '' }}
        />
      )

    case 'image':
      return block.content.imageUrl ? (
        <div className="my-4" style={block.settings.style}>
          <Image
            src={block.content.imageUrl}
            alt="Newsletter image"
            width={800}
            height={400}
            className="rounded-lg"
          />
        </div>
      ) : null

    case 'button':
      return block.content.buttonUrl ? (
        <div className="my-4 text-center" style={block.settings.style}>
          <a
            href={block.content.buttonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600"
          >
            {block.content.buttonText || '자세히 보기'}
          </a>
        </div>
      ) : null

    case 'audio':
      return (
        <div className="rounded-lg bg-gray-50 p-4">
          <audio
            controls
            className="w-full"
            src={block.content.audioUrl}
          >
            <a href={block.content.audioUrl}>오디오 다운로드</a>
          </audio>
        </div>
      )

    default:
      return null
  }
} 
'use client'

import Image from 'next/image'
import dynamic from 'next/dynamic'
import type { EditorBlock } from '@/types/editor'

// 클라이언트 사이드에서만 로드
const MDPreview = dynamic(
  () => import('@uiw/react-markdown-preview').then((mod) => mod.default),
  { ssr: false }
)

interface BlockRendererProps {
  block: EditorBlock
}

// 타입 안전성을 위한 타입 가드 함수들
const hasAlignment = (settings: any): settings is { alignment: string } => 
  settings && 'alignment' in settings

const hasWidth = (settings: any): settings is { width: string } => 
  settings && 'width' in settings

const hasCaption = (content: any): content is { caption: string } => 
  content && 'caption' in content

export function NewsletterBlockRenderer({ block }: BlockRendererProps) {
  switch (block.type) {
    case 'text':
      return (
        <div 
          className="prose prose-lg max-w-none"
          style={block.settings?.style || {}}
        >
          {block.content.text ? (
            <MDPreview source={block.content.text} />
          ) : null}
        </div>
      )

    case 'image':
      return block.content.imageUrl ? (
        <div className="my-4" style={{
          textAlign: hasAlignment(block.settings) ? 
            (block.settings.alignment as 'left' | 'center' | 'right') : 'center',
          ...(block.settings?.style || {})
        }}>
          <Image
            src={block.content.imageUrl}
            alt={hasCaption(block.content) ? block.content.caption : "Newsletter image"}
            width={800}
            height={400}
            className="rounded-lg"
            style={{
              width: hasWidth(block.settings) ? block.settings.width : '100%',
              maxWidth: '100%',
              height: 'auto',
              display: 'block',
              margin: hasAlignment(block.settings) && block.settings.alignment === 'left' ? '0 auto 0 0' : 
                     hasAlignment(block.settings) && block.settings.alignment === 'right' ? '0 0 0 auto' : '0 auto'
            }}
          />
          {hasCaption(block.content) && block.content.caption && (
            <div className="mt-2 text-center text-sm text-gray-500">
              {block.content.caption}
            </div>
          )}
        </div>
      ) : null

    case 'button':
      return block.content.buttonUrl ? (
        <div className="my-4 text-center" style={block.settings?.style || {}}>
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
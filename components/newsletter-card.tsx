'use client'

import Image from 'next/image'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { Newsletter } from '@/types/database'

interface NewsletterCardProps {
  newsletter: Pick<Newsletter, 'id' | 'title' | 'summary' | 'thumbnail_url' | 'created_at'>
  onDelete: (id: string) => Promise<void>
}

export default function NewsletterCard({ newsletter, onDelete }: NewsletterCardProps) {
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault() // Link 컴포넌트의 기본 동작 방지
    try {
      await onDelete(newsletter.id)
    } catch (err) {
      console.error('Error deleting newsletter:', err)
    }
  }

  return (
    <Link 
      href={`/newsletter/${newsletter.id}`}
      className="group block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
    >
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={newsletter.thumbnail_url}
          alt={newsletter.title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="p-4">
        <h3 className="mb-2 text-lg font-semibold text-gray-900 line-clamp-1">
          {newsletter.title}
        </h3>
        <p className="mb-3 text-sm text-gray-600 line-clamp-2">
          {newsletter.summary}
        </p>
        <time className="text-xs text-gray-500">
          {formatDistanceToNow(new Date(newsletter.created_at), { 
            addSuffix: true,
            locale: ko 
          })}
        </time>
      </div>
      <button
        onClick={handleDelete}
        className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100"
      >
        삭제
      </button>
    </Link>
  )
} 
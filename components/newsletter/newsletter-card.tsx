'use client'

import Image from 'next/image'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { NewsletterListItem } from '@/types/database'

interface NewsletterCardProps {
  newsletter: NewsletterListItem
}

export default function NewsletterCard({ newsletter }: NewsletterCardProps) {
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
    </Link>
  )
}
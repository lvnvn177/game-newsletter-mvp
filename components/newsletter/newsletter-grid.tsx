'use client'

import { useState } from 'react'
import NewsletterCard from '@/components/newsletter/newsletter-card'
import { deleteNewsletter } from '@/lib/newsletter'
import type { NewsletterListItem } from '@/types/database'

interface NewsletterGridProps {
  initialNewsletters: NewsletterListItem[]
}

export default function NewsletterGrid({ initialNewsletters }: NewsletterGridProps) {
  const [newsletters, setNewsletters] = useState(initialNewsletters)

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {newsletters.map((newsletter) => (
        <NewsletterCard 
          key={newsletter.id} 
          newsletter={newsletter} 
        />
      ))}
    </div>
  )
} 
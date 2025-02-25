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

  const handleDeleteNewsletter = async (id: string) => {
    try {
      await deleteNewsletter(id)
      setNewsletters(newsletters.filter(n => n.id !== id))
    } catch (err) {
      // 에러 처리는 deleteNewsletter 함수 내에서 처리됨
      console.error('Error in component:', err)
    }
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {newsletters.map((newsletter) => (
        <NewsletterCard 
          key={newsletter.id} 
          newsletter={newsletter} 
          // onDelete={handleDeleteNewsletter}
        />
      ))}
    </div>
  )
} 
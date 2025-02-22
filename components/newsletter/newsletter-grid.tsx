'use client'

import { useState } from 'react'
import NewsletterCard from '@/components/newsletter-card'
import { handleDelete } from '@/app/utils/deleteNewsletter'
import type { Newsletter } from '@/types/database'

type NewsletterListItem = Pick<Newsletter, 'id' | 'title' | 'summary' | 'thumbnail_url' | 'created_at'>

interface NewsletterGridProps {
  initialNewsletters: NewsletterListItem[]
}

export default function NewsletterGrid({ initialNewsletters }: NewsletterGridProps) {
  const [newsletters, setNewsletters] = useState(initialNewsletters)

  const handleDeleteNewsletter = async (id: string) => {
    try {
      await handleDelete(id)
      setNewsletters(newsletters.filter(n => n.id !== id))
    } catch (err) {
      console.error('Error deleting newsletter:', err)
      throw err
    }
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {newsletters.map((newsletter) => (
        <NewsletterCard 
          key={newsletter.id} 
          newsletter={newsletter} 
          onDelete={handleDeleteNewsletter}
        />
      ))}
    </div>
  )
} 
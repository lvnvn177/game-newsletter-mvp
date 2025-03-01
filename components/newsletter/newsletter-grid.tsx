'use client'

import { useState } from 'react'
import NewsletterCard from '@/components/newsletter/newsletter-card'
import { deleteNewsletterClient } from '@/lib/newsletter'
import type { Newsletter } from '@/types/database'

interface NewsletterGridProps {
  initialNewsletters: Newsletter[]
  isAdmin?: boolean
}

export default function NewsletterGrid({ initialNewsletters, isAdmin = false }: NewsletterGridProps) {
  const [newsletters, setNewsletters] = useState(initialNewsletters)

  const handleDeleteNewsletter = async (id: string) => {
    if (!isAdmin) return
    
    try {
      const success = await deleteNewsletterClient(id)
      if (success) {
        setNewsletters(newsletters.filter(n => n.id !== id))
      }
    } catch (err) {
      console.error('Error in component:', err)
    }
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {newsletters.map((newsletter) => (
        <NewsletterCard 
          key={newsletter.id} 
          newsletter={newsletter}
          isAdmin={isAdmin}
          onDelete={handleDeleteNewsletter}
        />
      ))}
    </div>
  )
} 
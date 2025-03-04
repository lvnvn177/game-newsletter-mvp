'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import NewsletterCard from '@/components/newsletter/newsletter-card'
import { deleteNewsletter } from '@/lib/newsletter'
import type { NewsletterListItem } from '@/types/database'

export default function LatestNewslettersGrid() {
  const [newsletters, setNewsletters] = useState<NewsletterListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLatestNewsletters()
  }, [])

  const fetchLatestNewsletters = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletters')
        .select('id, title, summary, thumbnail_url, created_at')
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) setNewsletters(data as NewsletterListItem[])
    } catch (err) {
      console.error('Error fetching newsletters:', err)
      setError('최신 뉴스레터를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteNewsletter = async (id: string) => {
    try {
      await deleteNewsletter(id)
      setNewsletters(newsletters.filter(n => n.id !== id))
    } catch (err) {
      console.error('Error in component:', err)
    }
  }

  if (isLoading) return <div>로딩중...</div>
  if (error) return <div className="text-red-500">{error}</div>
  if (newsletters.length === 0) return <div>등록된 뉴스레터가 없습니다.</div>

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {newsletters.map((newsletter, index) => (
        <NewsletterCard 
          key={newsletter.id} 
          newsletter={newsletter}
          isPriority={index === 0}
        />
      ))}
    </div>
  )
} 
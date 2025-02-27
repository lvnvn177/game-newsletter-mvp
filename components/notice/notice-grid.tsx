'use client'

import { useState } from 'react'
import NoticeCard from '@/components/notice/notice-card'
import { deleteNotice, publishNotice } from '@/lib/notice'
import type { NoticeListItem } from '@/types/database'

interface NoticeGridProps {
  initialNotices: NoticeListItem[]
  isAdmin?: boolean
}

export default function NoticeGrid({ initialNotices, isAdmin = false }: NoticeGridProps) {
  const [notices, setNotices] = useState(initialNotices)

  const handleDeleteNotice = async (id: string) => {
    if (!isAdmin) return
    
    try {
      const success = await deleteNotice(id)
      if (success) {
        setNotices(notices.filter(n => n.id !== id))
      }
    } catch (err) {
      console.error('Error in component:', err)
    }
  }
  
  const handlePublishToggle = async (id: string, publish: boolean) => {
    if (!isAdmin) return
    
    try {
      const success = await publishNotice(id, publish)
      if (success) {
        setNotices(notices.map(notice => 
          notice.id === id ? { ...notice, published: publish } : notice
        ))
      }
    } catch (err) {
      console.error('Error toggling publish status:', err)
    }
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {notices.map((notice) => (
        <NoticeCard 
          key={notice.id} 
          notice={notice}
          isAdmin={isAdmin}
          onPublishToggle={handlePublishToggle}
        />
      ))}
    </div>
  )
} 
'use client'

import { useState, useEffect } from 'react'
import NoticeCard from '@/components/notice/notice-card'
import { deleteNotice, publishNotice } from '@/lib/notice'
import type { NoticeListItem } from '@/types/database'

interface NoticeGridProps {
  initialNotices: NoticeListItem[]
  isAdmin?: boolean
}

export default function NoticeGrid({ initialNotices, isAdmin = false }: NoticeGridProps) {
  const [notices, setNotices] = useState<NoticeListItem[]>(initialNotices)

  // initialNotices가 변경되면 상태 업데이트
  useEffect(() => {
    setNotices(initialNotices)
  }, [initialNotices])

  const handleDeleteNotice = async (id: string) => {
    if (!isAdmin) return
    
    try {
      const success = await deleteNotice(id)
      if (success) {
        setNotices(prevNotices => prevNotices.filter(n => n.id !== id))
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
        // 상태 업데이트 - 항목을 제거하지 않고 published 상태만 변경
        setNotices(prevNotices => 
          prevNotices.map(notice => 
            notice.id === id ? { ...notice, published: publish } : notice
          )
        )
      }
    } catch (err) {
      console.error('Error toggling publish status:', err)
    }
  }

  // 관리자 페이지에서는 published 값에 관계없이 모든 공지사항을 표시
  // 일반 페이지에서는 published가 true인 공지사항만 표시
  const displayNotices = isAdmin 
    ? notices 
    : notices.filter(notice => notice.published)

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {displayNotices.map((notice) => (
        <NoticeCard 
          key={notice.id} 
          notice={notice}
          isAdmin={isAdmin}
          onPublishToggle={handlePublishToggle}
          onDelete={handleDeleteNotice}
        />
      ))}
    </div>
  )
} 
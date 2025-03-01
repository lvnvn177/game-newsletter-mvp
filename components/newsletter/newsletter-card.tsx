'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { Newsletter, NewsletterListItem } from '@/types/database'
import { useState } from 'react'

interface NewsletterCardProps {
  newsletter: Newsletter | NewsletterListItem
  isAdmin?: boolean
  onDelete?: (id: string) => Promise<void>
  isPriority?: boolean
}

export default function NewsletterCard({ 
  newsletter, 
  isAdmin = false, 
  onDelete,
  isPriority = false
}: NewsletterCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleView = () => {
    if (isAdmin) {
      router.push(`/admin/newsletters/view/${newsletter.id}`)
    } else {
      router.push(`/newsletter/${newsletter.id}`)
    }
  }

  const handleEdit = () => {
    router.push(`/admin/editor/${newsletter.id}`)
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // 버튼 클릭 시 이벤트 전파 방지
    if ((e.target as HTMLElement).tagName === 'BUTTON' || 
        (e.target as HTMLElement).closest('button')) {
      return;
    }
    
    handleView();
  }

  return (
    <div 
      className="group block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative h-40 w-full overflow-hidden">
        {newsletter.thumbnail_url ? (
          <Image
            src={newsletter.thumbnail_url}
            alt={newsletter.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={isPriority}
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100">
            <span className="text-gray-400">이미지 없음</span>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="mb-2 text-lg font-semibold text-gray-900 line-clamp-1">
          {newsletter.title}
        </h3>
        
        <p className="mb-3 text-sm text-gray-600 line-clamp-2">
          {newsletter.summary}
        </p>
        
        <div className="mb-3 flex items-center justify-between">
          <time className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(newsletter.created_at), { 
              addSuffix: true,
              locale: ko 
            })}
          </time>
        </div>
        
        {isAdmin && (
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleView();
              }}
              className="rounded bg-gray-100 px-3 py-1 text-xs text-gray-700 hover:bg-gray-200"
            >
              보기
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit();
              }}
              className="rounded bg-blue-100 px-3 py-1 text-xs text-blue-700 hover:bg-blue-200"
            >
              수정
            </button>
            
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('정말로 이 뉴스레터를 삭제하시겠습니까?')) {
                    onDelete(newsletter.id)
                  }
                }}
                className="rounded bg-red-100 px-3 py-1 text-xs text-red-700 hover:bg-red-200"
              >
                삭제
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { NoticeListItem } from '@/types/database'

interface NoticeCardProps {
  notice: NoticeListItem
  isAdmin?: boolean
  onPublishToggle?: (id: string, publish: boolean) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

export default function NoticeCard({ 
  notice, 
  isAdmin = false, 
  onPublishToggle,
  onDelete
}: NoticeCardProps) {
  return (
    <div className="group block overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <Link href={isAdmin ? `/admin/notices/${notice.id}` : `/notices/${notice.id}`}>
        <h3 className="mb-2 text-lg font-semibold text-gray-900 line-clamp-1">
          {notice.title}
        </h3>
      </Link>
      
      <div className="mb-3 flex items-center justify-between">
        <time className="text-xs text-gray-500">
          {formatDistanceToNow(new Date(notice.created_at), { 
            addSuffix: true,
            locale: ko 
          })}
        </time>
        
        {isAdmin && (
          <span className={`text-xs ${notice.published ? 'text-green-600' : 'text-gray-500'}`}>
            {notice.published ? '게시됨' : '비공개'}
          </span>
        )}
      </div>
      
      {isAdmin && (
        <div className="mt-4 flex justify-end space-x-2">
          {onPublishToggle && (
            <button
              onClick={() => onPublishToggle(notice.id, !notice.published)}
              className={`rounded px-3 py-1 text-xs ${
                notice.published 
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {notice.published ? '비공개로 전환' : '게시하기'}
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={() => {
                if (window.confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
                  onDelete(notice.id)
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
  )
} 
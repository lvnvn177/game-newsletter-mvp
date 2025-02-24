'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import type { Newsletter } from '@/types/database'

export default function AdminNewslettersPage() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchNewsletters()
  }, [])

  const fetchNewsletters = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletters')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setNewsletters(data || [])
    } catch (err) {
      console.error('Error fetching newsletters:', err)
      setError('뉴스레터를 불러오는데 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      // 뉴스레터 데이터 조회
      const { data: newsletter, error: fetchError } = await supabase
        .from('newsletters')
        .select('content, thumbnail_url')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      // 삭제할 미디어 파일 경로들 수집
      const imagesToDelete = new Set<string>()
      const audiosToDelete = new Set<string>()

      // 썸네일 이미지 경로 추가
      if (newsletter.thumbnail_url) {
        const thumbnailUrl = new URL(newsletter.thumbnail_url)
        const pathParts = thumbnailUrl.pathname.split('/')
        const filename = pathParts[pathParts.length - 1]
        imagesToDelete.add(`newsletters/${filename}`)
      }

      // 콘텐츠 내 이미지와 오디오 블록의 파일 경로들 추가
      const blocks = newsletter.content.blocks || []
      blocks.forEach((block: any) => {
        if (block.type === 'image' && block.content.imageUrl) {
          const imageUrl = new URL(block.content.imageUrl)
          const pathParts = imageUrl.pathname.split('/')
          const filename = pathParts[pathParts.length - 1]
          imagesToDelete.add(`newsletters/${filename}`)
        }
        if (block.type === 'audio' && block.content.audioUrl) {
          const audioUrl = new URL(block.content.audioUrl)
          const pathParts = audioUrl.pathname.split('/')
          const filename = pathParts[pathParts.length - 1]
          audiosToDelete.add(`newsletters/${filename}`)
        }
      })

      // Storage에서 이미지 파일들 삭제
      if (imagesToDelete.size > 0) {
        const { error: imageDeleteError } = await supabase.storage
          .from('images')
          .remove(Array.from(imagesToDelete))

        if (imageDeleteError) {
          console.error('Image deletion error:', imageDeleteError)
          throw imageDeleteError
        }
      }

      // Storage에서 오디오 파일들 삭제
      if (audiosToDelete.size > 0) {
        const { error: audioDeleteError } = await supabase.storage
          .from('audios')
          .remove(Array.from(audiosToDelete))

        if (audioDeleteError) {
          console.error('Audio deletion error:', audioDeleteError)
          throw audioDeleteError
        }
      }

      // 뉴스레터 데이터 삭제
      const { error: deleteError } = await supabase
        .from('newsletters')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      setNewsletters(newsletters.filter(n => n.id !== id))
      toast.success('뉴스레터가 삭제되었습니다')
    } catch (err) {
      console.error('Error deleting newsletter:', err)
      toast.error('삭제에 실패했습니다')
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">뉴스레터 관리</h1>
        <Link 
          href="/admin/editor"
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          새 뉴스레터
        </Link>
      </div>

      {isLoading && <div>로딩중...</div>}
      {error && <div className="text-red-500">{error}</div>}
      
      <div className="grid gap-4">
        {newsletters.map(newsletter => (
          <div 
            key={newsletter.id}
            className="flex items-center justify-between rounded-lg border bg-white p-4"
          >
            <div>
              <h3 className="font-medium">{newsletter.title}</h3>
              <p className="text-sm text-gray-500">
                {new Date(newsletter.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/admin/editor/${newsletter.id}`}
                className="rounded bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200"
              >
                수정
              </Link>
              <button
                onClick={() => handleDelete(newsletter.id)}
                className="rounded bg-red-100 px-3 py-1 text-sm text-red-600 hover:bg-red-200"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 
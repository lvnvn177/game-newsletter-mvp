'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import EditorPage from '@/components/editor/editor-page'
import { Newsletter } from '@/types/database'
import { use } from 'react'

export default function EditNewsletterPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchNewsletter()
  }, [resolvedParams.id])

  const fetchNewsletter = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletters')
        .select('*')
        .eq('id', resolvedParams.id)
        .single()

      if (error) throw error
      setNewsletter(data)
    } catch (err) {
      console.error('Error fetching newsletter:', err)
      setError('뉴스레터를 불러오는데 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <div>로딩중...</div>
  if (error) return <div className="text-red-500">{error}</div>
  if (!newsletter) return <div>뉴스레터를 찾을 수 없습니다</div>

  return <EditorPage initialData={newsletter} />
} 
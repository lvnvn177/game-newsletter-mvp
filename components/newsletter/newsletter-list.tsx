'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import NewsletterCard from '@/components/newsletter-card'
import type { Newsletter } from '@/types/database'

type NewsletterListItem = Pick<Newsletter, 'id' | 'title' | 'summary' | 'thumbnail_url' | 'created_at'>

export default function NewsletterList() {
const [newsletters, setNewsletters] = useState<NewsletterListItem[]>([])
const [isLoading, setIsLoading] = useState(true)
const [error, setError] = useState<string | null>(null)

useEffect(() => {
fetchNewsletters()
}, [])

const fetchNewsletters = async () => {
try {
    setIsLoading(true)
    setError(null)
    
    const { data, error } = await supabase
    .from('newsletters')
    .select('id, title, summary, thumbnail_url, created_at, content')
    .order('created_at', { ascending: false })
    .returns<Newsletter[]>()

    if (error) throw error

    if (data) {
    setNewsletters(data)
    }
} catch (err) {
    console.error('Error fetching newsletters:', err)
    setError('뉴스레터를 불러오는데 실패했습니다.')
} finally {
    setIsLoading(false)
}
}

const handleDelete = async (id: string) => {
try {
    await handleDelete(id); // 수정된 부분
    setNewsletters(newsletters.filter(n => n.id !== id));
} catch (err) {
    console.error('Error deleting newsletter:', err);
    // 에러 처리는 NewsletterCard 컴포넌트에서 수행됨
    throw err;
}
}

if (isLoading) {
return <div>뉴스레터를 불러오는 중...</div>
}

if (error) {
return <div className="text-red-500">{error}</div>
}

if (newsletters.length === 0) {
return <div>등록된 뉴스레터가 없습니다.</div>
}

return (
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {newsletters.map((newsletter) => (
    <NewsletterCard 
        key={newsletter.id} 
        newsletter={newsletter} 
        onDelete={handleDelete}
    />
    ))}
</div>
)
}
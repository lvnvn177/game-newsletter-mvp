import { supabase } from '@/lib/supabase'
import EditNewsletterForm from '@/components/admin/edit-newsletter-form'
import type { Newsletter } from '@/types/database'

export default async function EditNewsletterPage({ params }: { params: { id: string } }) {
  const id = params.id
  
  // 서버에서 데이터 가져오기
  const { data, error } = await supabase
    .from('newsletters')
    .select('*')
    .eq('id', id)
    .single()
    
  if (error) {
    throw new Error('뉴스레터를 불러오는데 실패했습니다')
  }
  
  if (!data) {
    throw new Error('뉴스레터를 찾을 수 없습니다')
  }
  
  return <EditNewsletterForm newsletter={data as Newsletter} />
} 
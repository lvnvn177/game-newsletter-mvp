import { supabase } from '@/lib/supabase'
import EditNoticeForm from '@/components/admin/edit-notice-form'
import type { Notice } from '@/types/database'

type Params = Promise<{ id: string }>;

export default async function EditNoticePage({ params }: { params: Params }) {
  const { id } = await params;
  
  // 서버에서 데이터 가져오기
  const { data, error } = await supabase
    .from('notices')
    .select('*')
    .eq('id', id)
    .single()
    
  if (error) {
    throw new Error('공지사항을 불러오는데 실패했습니다')
  }
  
  if (!data) {
    throw new Error('공지사항을 찾을 수 없습니다')
  }
  
  return <EditNoticeForm notice={data as Notice} />
}

export const dynamic = 'force-dynamic' 
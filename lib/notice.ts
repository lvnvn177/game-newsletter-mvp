import { supabase } from '@/lib/supabase-browser'
import { toast } from 'react-hot-toast'
import type { Notice } from '@/types/database'

export async function deleteNotice(id: string) {
  try {
    const { error } = await supabase
      .from('notices')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    toast.success('공지사항이 삭제되었습니다')
    return true
  } catch (error) {
    console.error('Error deleting notice:', error)
    toast.error('공지사항 삭제 중 오류가 발생했습니다')
    return false
  }
}

export async function getNotices() {
  const { data, error } = await supabase
    .from('notices')
    .select('id, title, created_at, updated_at, published')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching notices:', error)
    return []
  }
  
  return data || []
}

export async function getNotice(id: string): Promise<Notice | null> {
  const { data, error } = await supabase
    .from('notices')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error || !data) {
    console.error('Error fetching notice:', error)
    return null
  }
  
  return data as Notice
}

export async function publishNotice(id: string, publish: boolean = true) {
  try {
    const { error } = await supabase
      .from('notices')
      .update({ published: publish })
      .eq('id', id)
    
    if (error) throw error
    
    toast.success(publish ? '공지사항이 게시되었습니다' : '공지사항이 비공개로 설정되었습니다')
    return true
  } catch (error) {
    console.error('Error publishing notice:', error)
    toast.error('상태 변경 중 오류가 발생했습니다')
    return false
  }
} 
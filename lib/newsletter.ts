import { supabase } from '@/lib/supabase'
import { supabase as supabaseBrowser } from '@/lib/supabase-browser'
import { toast } from 'react-hot-toast'

export async function getNewsletterById(id: string) {
  try {
    const { data, error } = await supabase
      .from('newsletters')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching newsletter:', error)
    return null
  }
}

export async function deleteNewsletter(id: string) {
  try {
    // 뉴스레터 데이터 조회
    const { data: newsletter, error: fetchError } = await supabase
      .from('newsletters')
      .select('content, thumbnail_url')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    // 삭제할 이미지 파일 경로들 수집
    const imagesToDelete = new Set<string>()

    // 썸네일 이미지 경로 추가
    if (newsletter.thumbnail_url) {
      const thumbnailUrl = new URL(newsletter.thumbnail_url)
      const pathParts = thumbnailUrl.pathname.split('/')
      const fileName = pathParts[pathParts.length - 1]
      if (fileName) {
        imagesToDelete.add(`newsletters/${fileName}`)
      }
    }

    // 콘텐츠 내 이미지 블록의 이미지 경로들 추가
    const imageBlocks = newsletter.content.blocks.filter(
      (block: any) => block.type === 'image' && block.content.imageUrl
    )

    for (const block of imageBlocks) {
      const imageUrl = new URL(block.content.imageUrl)
      const pathParts = imageUrl.pathname.split('/')
      const fileName = pathParts[pathParts.length - 1]
      if (fileName) {
        imagesToDelete.add(`newsletters/${fileName}`)
      }
    }

    // Storage에서 이미지들 삭제
    if (imagesToDelete.size > 0) {
      const { error: storageError } = await supabase.storage
        .from('images')
        .remove(Array.from(imagesToDelete))

      if (storageError) throw storageError
    }

    // 뉴스레터 데이터 삭제
    const { error: deleteError } = await supabase
      .from('newsletters')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError

    return { success: true }
  } catch (err) {
    console.error('Error deleting newsletter:', err)
    throw err
  }
}

// 클라이언트 컴포넌트에서 사용할 수 있는 브라우저용 함수
export async function deleteNewsletterClient(id: string): Promise<boolean> {
  try {
    const { error } = await supabaseBrowser
      .from('newsletters')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    toast.success('뉴스레터가 삭제되었습니다')
    return true
  } catch (error) {
    console.error('Error deleting newsletter:', error)
    toast.error('뉴스레터 삭제 중 오류가 발생했습니다')
    return false
  }
} 
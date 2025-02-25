import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

type Params = Promise<{ id: string }>;

export async function DELETE(
  request: Request,
  { params }: { params: Params }
) {
  try {
    const { id } = await params

    // 먼저 뉴스레터 데이터 조회
    const { data: newsletter, error: fetchError } = await supabase
      .from('newsletters')
      .select('content, thumbnail_url')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    // 삭제할 이미지 파일 경로들 수집
    const imagesToDelete = new Set<string>()
    
    // 썸네일 이미지 경로 추출 및 추가
    if (newsletter.thumbnail_url) {
      const thumbnailUrl = new URL(newsletter.thumbnail_url)
      const pathParts = thumbnailUrl.pathname.split('/')
      const fileName = pathParts[pathParts.length - 1]
      if (fileName.startsWith(id)) {
        imagesToDelete.add(fileName)
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
      if (fileName.startsWith(id)) {
        imagesToDelete.add(fileName)
      }
    }

    // Storage에서 이미지들 삭제
    if (imagesToDelete.size > 0) {
      const imagesToDeleteArray = Array.from(imagesToDelete)
      console.log('Deleting images:', imagesToDeleteArray)
      
      const { error: deleteStorageError } = await supabase.storage
        .from('images')
        .remove(imagesToDeleteArray)

      if (deleteStorageError) {
        console.error('Storage deletion error:', deleteStorageError)
        throw deleteStorageError
      }
    }

    // 뉴스레터 레코드 삭제
    const { error: deleteError } = await supabase
      .from('newsletters')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Newsletter deletion error:', error)
    return NextResponse.json(
      { error: '뉴스레터 삭제 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
} 
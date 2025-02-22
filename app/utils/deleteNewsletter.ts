import { supabase } from '@/lib/supabase';
import type { Newsletter } from '@/types/database';

export const handleDelete = async (id: string) => {
  try {
    console.log('Deleting newsletter with ID:', id);

    // 뉴스레터 데이터 조회
    const { data: newsletter, error: fetchError } = await supabase
      .from('newsletters')
      .select('content, thumbnail_url')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    
    console.log('Found newsletter data:', {
      thumbnail: newsletter.thumbnail_url,
      contentBlocks: newsletter.content.blocks.length
    });

    // 삭제할 이미지 파일 경로들 수집
    const imagesToDelete = new Set<string>();

    // 썸네일 이미지 경로 추가
    if (newsletter.thumbnail_url) {
      const thumbnailUrl = new URL(newsletter.thumbnail_url);
      const pathParts = thumbnailUrl.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      if (fileName) {
        imagesToDelete.add(`newsletters/${fileName}`);
        console.log('Added thumbnail path:', `newsletters/${fileName}`);
      }
    }

    // 콘텐츠 내 이미지 블록의 이미지 경로들 추가
    const imageBlocks = newsletter.content.blocks.filter(
      (block: any) => block.type === 'image' && block.content.imageUrl && !block.content.imageUrl.startsWith('blob:')
    );

    console.log('Found image blocks:', imageBlocks.length);

    for (const block of imageBlocks) {
      const imageUrl = new URL(block.content.imageUrl);
      const pathParts = imageUrl.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      if (fileName) {
        imagesToDelete.add(`newsletters/${fileName}`);
        console.log('Added content image path:', `newsletters/${fileName}`);
      }
    }

    // Storage에서 이미지들 삭제
    if (imagesToDelete.size > 0) {
      const imagesToDeleteArray = Array.from(imagesToDelete);
      console.log('Attempting to delete images:', imagesToDeleteArray);

      const { error: deleteStorageError } = await supabase.storage
        .from('images')
        .remove(imagesToDeleteArray);

      if (deleteStorageError) {
        console.error('Storage deletion error:', deleteStorageError);
        throw deleteStorageError;
      }
      console.log('Successfully deleted images from storage');
    } else {
      console.log('No images to delete');
    }

    // 뉴스레터 레코드 삭제
    console.log('Attempting to delete newsletter record:', id);
    const { error: deleteError } = await supabase
      .from('newsletters')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;
    console.log('Successfully deleted newsletter record');

  } catch (err) {
    console.error('Error deleting newsletter:', err);
    throw err;
  }
}; 
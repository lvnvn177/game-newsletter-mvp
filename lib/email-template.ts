import type { Newsletter } from '@/types/database'
import { marked } from 'marked'

export function generateNewsletterHTML(newsletter: Newsletter): string {
  const blocks = newsletter.content.blocks || [];

  // 기본 스타일 정의
  let html = `
    <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-size: 24px; margin-bottom: 10px;">${newsletter.title}</h1>
      </div>
      <div style="line-height: 1.6;">
  `;

  // 헤더 이미지 추가
  const headerImage = blocks.find(block => block.type === 'image');
  if (headerImage && headerImage.content.imageUrl) {
    html += `
      <div style="margin-bottom: 20px; text-align: center;">
        <img src="${headerImage.content.imageUrl}" alt="Newsletter header" style="max-width: 100%; border-radius: 4px;">
      </div>
    `;
  }

  // 콘텐츠 블록 필터링 (헤더 이미지 제외)
  const contentBlocks = headerImage 
    ? blocks.filter(block => block !== headerImage) 
    : blocks;
  
  // 각 블록 타입에 따라 HTML 생성
  contentBlocks.forEach((block: any) => {
    html += `<div class="block" style="margin-bottom: 20px;">`;
    
    switch (block.type) {
      case 'text':
        if (block.content.text) {
          try {
            // marked 라이브러리를 사용하여 마크다운을 HTML로 변환 (동기 방식으로 사용)
            let htmlText = marked.parse(block.content.text, { async: false }) as string;
            
            // 이미지 태그 처리 - 마크다운 이미지가 이메일에서 작동하도록 수정
            htmlText = htmlText.replace(/<img\s+src="([^"]+)"\s+alt="([^"]*)"\s*\/?>/g, 
              '<img src="$1" alt="$2" style="max-width: 100%; height: auto; display: block; margin: 10px 0;" />');
            
            // 링크 스타일 추가
            htmlText = htmlText.replace(/<a\s+href="([^"]+)"/g, 
              '<a href="$1" style="color: #3b82f6; text-decoration: none;"');
            
            // 테이블 스타일 추가
            htmlText = htmlText.replace(/<table>/g, 
              '<table style="width: 100%; border-collapse: collapse; margin: 15px 0;">');
            htmlText = htmlText.replace(/<th>/g, 
              '<th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">');
            htmlText = htmlText.replace(/<td>/g, 
              '<td style="border: 1px solid #ddd; padding: 8px; text-align: left;">');
            
            html += htmlText;
          } catch (error) {
            console.error('Error parsing markdown:', error);
            // 마크다운 파싱 실패 시 기본 텍스트 처리
            const plainText = block.content.text
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/\n/g, '<br>');
            html += `<p>${plainText}</p>`;
          }
        }
        break;
        
      case 'image':
        if (block.content.imageUrl) {
          const caption = block.content.caption || '';
          // 이미지 설정에서 너비와 정렬 값을 가져옴
          const width = block.settings?.width || '100%';
          const alignment = block.settings?.alignment || 'center';
          
          // 정렬에 따른 스타일 설정
          let alignStyle = 'margin: 0 auto;'; // 기본값 (가운데 정렬)
          if (alignment === 'left') alignStyle = 'margin-right: auto;';
          if (alignment === 'right') alignStyle = 'margin-left: auto;';
          
          html += `
            <div style="margin: 15px 0; text-align: ${alignment};">
              <img src="${block.content.imageUrl}" alt="${caption}" 
                style="display: block; width: ${width}; max-width: 100%; height: auto; border-radius: 4px; ${alignStyle}">
              ${caption ? `<div style="text-align: center; font-size: 14px; color: #666; margin-top: 5px;">${caption}</div>` : ''}
            </div>
          `;
        }
        break;
        
      case 'button':
        if (block.content.buttonUrl) {
          html += `
            <div style="text-align: center; margin: 20px 0;">
              <a href="${block.content.buttonUrl}" style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
                ${block.content.buttonText || '자세히 보기'}
              </a>
            </div>
          `;
        }
        break;
        
      case 'audio':
        if (block.content.audioUrl) {
          html += `
            <div style="margin: 15px 0; padding: 15px; background-color: #f9f9f9; border-radius: 4px;">
              <p style="margin-bottom: 10px;">🎧 오디오 콘텐츠가 포함되어 있습니다</p>
              <a href="${block.content.audioUrl}" style="color: #3b82f6; text-decoration: none;">오디오 듣기</a>
            </div>
          `;
        }
        break;
    }
    
    html += `</div>`;
  });

  // 푸터 추가
  html += `
      </div>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #666;">
        <p>이 뉴스레터가 마음에 드셨나요? 친구에게 공유해보세요!</p>
        <p>© ${new Date().getFullYear()} 뉴스레터 서비스. All rights reserved.</p>
      </div>
    </div>
  `;

  return html;
} 
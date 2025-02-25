import type { Newsletter } from '@/types/database'

export function generateNewsletterHTML(newsletter: Newsletter): string {
  const blocks = newsletter.content.blocks || [];
  
  // HTML 헤더 부분
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${newsletter.title}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        img { max-width: 100%; height: auto; }
        h1 { font-size: 24px; margin-bottom: 20px; }
        p { margin-bottom: 16px; }
        .audio-player { margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 8px; }
        .audio-title { font-weight: bold; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <h1>${newsletter.title}</h1>
  `;
  // test
  // 각 블록 타입에 따라 HTML 생성
  blocks.forEach(block => {
    switch (block.type) {
      case 'text':
        if (block.content.text) {
          // 제목(# 형식)은 이미 상단에 표시했으므로 제외
          const text = block.content.text.replace(/^#\s+(.+)$/m, '').trim();
          
          // 마크다운 스타일 텍스트를 HTML로 변환 (간단한 변환)
          const htmlText = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // 볼드 처리
            .replace(/\*(.*?)\*/g, '<em>$1</em>') // 이탤릭 처리
            .replace(/\n\n/g, '</p><p>') // 단락 구분
            .replace(/\n/g, '<br>'); // 줄바꿈
          
          html += `<p>${htmlText}</p>`;
        }
        break;
        
      case 'image':
        if (block.content.imageUrl) {
          const caption = block.content.caption || '';
          html += `
            <div style="margin: 20px 0;">
              <img src="${block.content.imageUrl}" alt="${caption}" style="display: block; max-width: 100%;">
              ${caption ? `<div style="text-align: center; font-style: italic; margin-top: 8px;">${caption}</div>` : ''}
            </div>
          `;
        }
        break;
        
      case 'audio':
        if (block.content.audioUrl) {
          const audioTitle = block.content.title || '오디오';
          html += `
            <div class="audio-player">
              <div class="audio-title">${audioTitle}</div>
              <audio controls>
                <source src="${block.content.audioUrl}" type="audio/mpeg">
                브라우저가 오디오 재생을 지원하지 않습니다.
              </audio>
              <p>오디오를 들으시려면 <a href="${block.content.audioUrl}" target="_blank">여기</a>를 클릭하세요.</p>
            </div>
          `;
        }
        break;
        
      // 다른 블록 타입이 추가될 경우 여기에 추가
    }
  });
  
  // HTML 푸터 부분
  html += `
      <hr style="margin: 30px 0;">
      <p style="font-size: 12px; color: #666;">
        이 뉴스레터를 더 이상 받고 싶지 않으시면 <a href="[구독 취소 링크]">구독 취소</a>를 클릭하세요.
      </p>
    </body>
    </html>
  `;
  
  return html;
} 
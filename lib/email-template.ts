import type { Newsletter } from '@/types/database'

export function generateNewsletterHTML(newsletter: Newsletter): string {
  const blocks = newsletter.content.blocks || [];
  
  // 첫 번째 텍스트 블록이 제목과 동일한 경우 필터링
  const contentBlocks = blocks.filter((block: any, index: number) => {
    // 첫 번째 텍스트 블록이고 내용이 제목과 동일한 경우 제외
    if (index === 0 && block.type === 'text' && block.content.text) {
      const cleanText = block.content.text.replace(/^#\s+/, '').trim(); // # 기호와 공백 제거
      return cleanText !== newsletter.title; // 제목과 일치하면 false 반환(필터링)
    }
    return true;
  });
  
  // HTML 헤더 부분
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${newsletter.title}</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 680px;
          margin: 0 auto;
          padding: 20px;
        }
        .content-container {
          background-color: #ffffff;
          border-radius: 8px;
          padding: 40px;
          margin-bottom: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .header-image {
          width: 100%;
          max-height: 300px;
          object-fit: cover;
          margin-bottom: 20px;
          position: relative;
          border-radius: 8px 8px 0 0;
        }
        .header-image-container {
          position: relative;
          margin-bottom: 20px;
        }
        .header-gradient {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.5), transparent);
          border-radius: 8px 8px 0 0;
        }
        .header {
          text-align: center;
          margin-bottom: 32px;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 20px;
        }
        .header h1 {
          font-size: 36px;
          font-weight: bold;
          margin-bottom: 16px;
          color: #222;
        }
        .header-subtitle {
          font-size: 16px;
          color: #555;
          margin-bottom: 20px;
        }
        .meta-info {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          margin: 20px 0;
          font-size: 14px;
          color: #555;
        }
        .meta-info .dot {
          margin: 0 8px;
        }
        .share-buttons {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }
        .share-button {
          display: inline-block;
          margin: 0 8px;
          padding: 8px 16px;
          background-color: #f3f4f6;
          border-radius: 4px;
          color: #333;
          text-decoration: none;
          font-size: 14px;
        }
        .content {
          margin-bottom: 32px;
        }
        .block {
          margin-bottom: 32px;
        }
        .block h1 {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 20px;
          color: #222;
        }
        .block h2 {
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #222;
        }
        .block p {
          font-size: 18px;
          line-height: 1.7;
          margin-bottom: 20px;
        }
        .block strong {
          font-weight: 600;
        }
        img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
        }
        .image-caption {
          text-align: center;
          font-style: italic;
          color: #6b7280;
          margin-top: 8px;
          font-size: 14px;
        }
        .audio-player {
          margin: 20px 0;
          padding: 15px;
          background-color: #f3f4f6;
          border-radius: 8px;
        }
        .audio-title {
          font-weight: bold;
          margin-bottom: 10px;
        }
        .subscription {
          text-align: center;
          background-color: #f9fafb;
          padding: 32px;
          border-radius: 8px;
          margin-top: 48px;
        }
        .subscription h2 {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        .subscription p {
          color: #6b7280;
          margin-bottom: 24px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 14px;
          color: #6b7280;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="content-container">
  `;
  
  // 헤더 이미지 추가
  if (newsletter.thumbnail_url) {
    html += `
        <div class="header-image-container">
          <div class="header-gradient"></div>
          <img src="${newsletter.thumbnail_url}" alt="" class="header-image">
        </div>
    `;
  }
  
  // 헤더 추가
  html += `
        <header class="header">
          <h1>${newsletter.title}</h1>
          <div class="header-subtitle">A newsletter by ${'GameHye'}</div>
          <div class="meta-info">
            <span>${new Date(newsletter.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span class="dot">·</span>
            <span>${Math.ceil(newsletter.content.blocks?.length / 2) || 4} min read</span>
            <span class="dot">·</span>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/newsletter/${newsletter.id}" style="color: #3b82f6; text-decoration: none;">View on Website</a>
          </div>
        </header>
        
        <div class="content">
  `;
  
  // 각 블록 타입에 따라 HTML 생성
  contentBlocks.forEach((block: any) => {
    html += `<div class="block">`;
    
    switch (block.type) {
      case 'text':
        if (block.content.text) {
          // 마크다운 스타일 텍스트를 HTML로 변환
          let text = block.content.text;
          
          // 제목 처리 (h1, h2, h3)
          text = text.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
          text = text.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
          text = text.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
          
          // 리스트 처리
          text = text.replace(/^\*\s+(.+)$/gm, '<li>$1</li>');
          text = text.replace(/^-\s+(.+)$/gm, '<li>$1</li>');
          text = text.replace(/^(\d+)\.\s+(.+)$/gm, '<li>$2</li>');
          
          // 리스트 그룹화
          text = text.replace(/(<li>.+<\/li>\n)+/g, '<ul>$&</ul>');
          
          const htmlText = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // 볼드 처리
            .replace(/\*(.*?)\*/g, '<em>$1</em>') // 이탤릭 처리
            .replace(/`(.*?)`/g, '<code>$1</code>') // 인라인 코드 처리
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #3b82f6; text-decoration: none;">$1</a>') // 링크 처리
            .replace(/\n\n/g, '</p><p>') // 단락 구분
            .replace(/\n/g, '<br>'); // 줄바꿈
          
          html += `<p>${htmlText}</p>`;
        }
        break;
        
      case 'image':
        if (block.content.imageUrl) {
          const caption = block.content.caption || '';
          html += `
            <div>
              <img src="${block.content.imageUrl}" alt="${caption}" style="display: block; width: 100%;">
              ${caption ? `<div class="image-caption">${caption}</div>` : ''}
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
              <audio controls style="width: 100%;">
                <source src="${block.content.audioUrl}" type="audio/mpeg">
                브라우저가 오디오 재생을 지원하지 않습니다.
              </audio>
              <p style="margin-top: 10px;">오디오를 들으시려면 <a href="${block.content.audioUrl}" target="_blank" style="color: #3b82f6; text-decoration: none;">여기</a>를 클릭하세요.</p>
            </div>
          `;
        }
        break;
        
      // 다른 블록 타입이 추가될 경우 여기에 추가
    }
    
    html += `</div>`;
  });
  
  // 구독 섹션 추가
  html += `
        </div>
        
        <div class="subscription">
          <h2>뉴스레터 구독하기</h2>
          <p>매주 새로운 게임 소식을 이메일로 받아보세요.</p>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/subscribe" style="display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; font-weight: 500;">구독하기</a>
        </div>
        
        <div class="footer">
          <p>이 뉴스레터를 더 이상 받고 싶지 않으시면 <a href="[구독 취소 링크]" style="color: #3b82f6; text-decoration: none;">구독 취소</a>를 클릭하세요.</p>
          <p>© ${new Date().getFullYear()} 뉴스레터. All rights reserved.</p>
        </div>
      </div>
    </div>
    </body>
    </html>
  `;
  
  return html;
} 
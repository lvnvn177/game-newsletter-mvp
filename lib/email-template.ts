import type { Newsletter } from '@/types/database'

export function generateNewsletterHTML(newsletter: Newsletter): string {
  const renderBlock = (block: any) => {
    switch (block.type) {
      case 'text':
        return `
          <div style="margin: 1em 0; line-height: 1.6;">
            ${block.content.text}
          </div>
        `
      case 'image':
        return block.content.imageUrl ? `
          <div style="margin: 1em 0;">
            <img 
              src="${block.content.imageUrl}" 
              alt="" 
              style="max-width: 100%; height: auto; border-radius: 8px;"
            />
          </div>
        ` : ''
      case 'button':
        return block.content.url ? `
          <div style="margin: 1.5em 0; text-align: center;">
            <a 
              href="${block.content.url}" 
              style="
                background-color: #3b82f6;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                display: inline-block;
              "
            >
              ${block.content.text || '자세히 보기'}
            </a>
          </div>
        ` : ''
      default:
        return ''
    }
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- 헤더 -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333;">${newsletter.title}</h1>
          </div>

          <!-- 콘텐츠 -->
          ${newsletter.content.blocks.map(block => renderBlock(block)).join('')}

          <!-- 푸터 -->
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #666;">
            <p>본 메일은 구독자님이 요청하신 뉴스레터입니다.</p>
            <p>구독 취소는 <a href="{unsubscribe_link}" style="color: #666;">여기</a>를 클릭하세요.</p>
          </div>
        </div>
      </body>
    </html>
  `
} 
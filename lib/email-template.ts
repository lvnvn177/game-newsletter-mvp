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
        <title>${newsletter.title}</title>
      </head>
      <body style="
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #374151;
      ">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="
            margin-bottom: 20px;
            font-size: 24px;
            text-align: center;
            color: #111827;
          ">
            ${newsletter.title}
          </h1>
          
          ${newsletter.summary ? `
            <p style="
              color: #6B7280;
              text-align: center;
              margin-bottom: 30px;
            ">
              ${newsletter.summary}
            </p>
          ` : ''}

          ${newsletter.content.blocks.map(renderBlock).join('\n')}

          <div style="
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #E5E7EB;
            text-align: center;
            color: #6B7280;
            font-size: 14px;
          ">
            <p>본 메일은 발신 전용입니다.</p>
            <p>
              <a 
                href="%unsubscribe_url%" 
                style="color: #6B7280; text-decoration: underline;"
              >
                뉴스레터 구독 해제
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `
} 
import { Navigation } from '@/components/navigation'
import type { Metadata } from 'next'
import './globals.css'
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

export const metadata: Metadata = {
  title: 'GameHye',
  description: '게임 뉴스레터 서비스',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="light">
      <body>
        {children}
      </body>
    </html>
  )
}

import { Navigation } from '@/components/navigation'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '뉴스레터',
  description: '뉴스레터 서비스',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        {children}
      </body>
    </html>
  )
}

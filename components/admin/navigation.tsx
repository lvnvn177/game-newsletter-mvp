'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function Navigation() {
  const pathname = usePathname()

  const links = [
    { href: '/admin', label: '대시보드' },
    { href: '/admin/editor', label: '새 뉴스레터' },
    { href: '/admin/subscribers', label: '구독자 관리' },
    { href: '/admin/sends', label: '발송 이력' },
  ]

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-blue-600',
                  pathname === link.href ? 'text-blue-600' : 'text-gray-600'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <Link 
            href="/"
            className="text-sm text-gray-600 hover:text-blue-600"
          >
            사이트로 돌아가기
          </Link>
        </div>
      </div>
    </nav>
  )
} 
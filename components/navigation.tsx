'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function Navigation() {
  const pathname = usePathname()

  const links = [
    { href: '/', label: '홈' },
    // { href: '/newsletters', label: '뉴스레터' },
    { href: '/about', label: '소개' },
    { href: '/notices', label: '공지사항' },
  ]

  return (
    <nav className="border-b bg-white dark:bg-white">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-600',
                  pathname === link.href 
                    ? 'text-blue-600 dark:text-blue-600' 
                    : 'text-gray-600 dark:text-gray-600'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
} 
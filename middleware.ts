import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (req.nextUrl.pathname.startsWith('/admin')) {
      if (!user) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    if (req.nextUrl.pathname === '/login') {
      if (user) {
        return NextResponse.redirect(new URL('/admin', req.url))
      }
    }

    return res
  } catch (error) {
    console.error('Middleware auth error:', error)
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

// 미들웨어가 실행될 경로 설정
export const config = {
  matcher: ['/admin/:path*', '/login']
} 
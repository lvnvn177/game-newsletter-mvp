import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          res.cookies.set(name, value, options)
        },
        remove(name: string, options: any) {
          res.cookies.set(name, '', options)
        },
      },
    }
  )

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
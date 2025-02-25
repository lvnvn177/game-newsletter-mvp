import { supabase as supabaseBrowser } from './supabase-browser'
import { createClient } from '@supabase/supabase-js'

// 서버 사이드에서는 새 인스턴스 생성, 클라이언트 사이드에서는 기존 인스턴스 재사용
export const supabase = typeof window === 'undefined'
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  : supabaseBrowser 
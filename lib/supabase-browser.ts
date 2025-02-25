import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Newsletter, Subscriber, NewsletterSend } from '@/types/database'

// Supabase 데이터베이스 타입 정의
export type Database = {
  public: {
    Tables: {
      newsletters: {
        Row: Newsletter
        Insert: Omit<Newsletter, 'id' | 'created_at'>
        Update: Partial<Newsletter>
      }
      subscribers: {
        Row: Subscriber
        Insert: Omit<Subscriber, 'id' | 'added_at'>
        Update: Partial<Subscriber>
      }
      newsletter_sends: {
        Row: NewsletterSend
        Insert: Omit<NewsletterSend, 'id'>
        Update: Partial<NewsletterSend>
      }
    }
  }
}

// 브라우저 환경에서만 실행되도록 함
let supabaseInstance: SupabaseClient<Database> | null = null

// 싱글톤 패턴으로 구현된 함수 - 기존 코드와의 호환성을 위해 유지
export const getSupabaseBrowser = () => {
  if (typeof window === 'undefined') return null as any // 서버 사이드에서는 null 반환
  
  if (supabaseInstance) return supabaseInstance
  
  supabaseInstance = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  return supabaseInstance
}

// 모든 컴포넌트에서 사용할 단일 인스턴스
export const supabase = getSupabaseBrowser() 
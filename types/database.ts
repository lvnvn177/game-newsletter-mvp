export interface NewsletterBlock {
  type: 'text' | 'image' | 'button'
  content: any
  settings: {
    layout?: string
    style?: Record<string, string>
  }
}

export interface Newsletter {
  id: string
  title: string
  summary: string      // null 허용하지 않도록 수정
  thumbnail_url: string // null 허용하지 않도록 수정
  content: {
    blocks: NewsletterBlock[]
  }
  created_at: string
  owner_id: string
  metadata?: {         // 선택적 메타데이터 필드 추가
    description?: string
    keywords?: string[]
  }
}

export interface Subscriber {
  id: string
  email: string
  added_at: string
  owner_id: string
} 
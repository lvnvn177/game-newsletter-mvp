type NewsletterBlockType = 'text' | 'button' | 'image' | 'audio'

export interface NewsletterBlock {
  id: string
  type: NewsletterBlockType
  content: Record<string, any>
  settings: Record<string, any>
}

export interface Newsletter {
  id: string
  title: string
  summary: string
  thumbnail_url: string
  content: {
    blocks: NewsletterBlock[]
  }
  created_at: string
  updated_at?: string
  owner_id: string
  metadata?: {
    description?: string
    keywords?: string[]
  }
}

export interface Subscriber {
  id: string
  email: string
  confirmed: boolean
  confirmed_at?: string
  confirm_token?: string
  added_at: string
  owner_id: string
}

export interface NewsletterSend {
  id: string
  newsletter_id: string
  sent_at: string
  status: 'success' | 'failed'
  error_message?: string
  recipient_count: number
  success_count: number
  fail_count: number
  newsletter?: {
    title: string
  }
}

export type NewsletterListItem = Pick<Newsletter, 'id' | 'title' | 'summary' | 'thumbnail_url' | 'created_at'>

export interface Notice {
  id: string
  title: string
  content: string
  created_at: string
  updated_at: string
  published: boolean
}

export interface NoticeListItem {
  id: string
  title: string
  created_at: string
  updated_at: string
  published: boolean
}
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { emails } = await request.json()

    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: '유효하지 않은 이메일 목록입니다' },
        { status: 400 }
      )
    }

    if (emails.length > 100) {
      return NextResponse.json(
        { error: '최대 100개의 이메일만 업로드 가능합니다' },
        { status: 400 }
      )
    }

    // 구독자 데이터 생성
    const subscribers = emails.map(email => ({
      email,
      owner_id: '00000000-0000-0000-0000-000000000000', // MVP에서는 고정값 사용
      added_at: new Date().toISOString()
    }))

    const { error } = await supabase
      .from('subscribers')
      .upsert(subscribers, { 
        onConflict: 'email',
        ignoreDuplicates: true 
      })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Bulk subscriber upload error:', error)
    return NextResponse.json(
      { error: '구독자 업로드 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
} 
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: '이메일은 필수입니다' },
        { status: 400 }
      )
    }

    // 이메일 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '유효하지 않은 이메일 주소입니다' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('subscribers')
      .insert([
        {
          email,
          owner_id: '00000000-0000-0000-0000-000000000000', // MVP에서는 고정값 사용
        }
      ])
      .select()
      .single()

    if (error?.code === '23505') { // unique_violation
      return NextResponse.json(
        { error: '이미 구독 중인 이메일입니다' },
        { status: 400 }
      )
    }

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Subscriber creation error:', error)
    return NextResponse.json(
      { error: '구독 처리 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
} 
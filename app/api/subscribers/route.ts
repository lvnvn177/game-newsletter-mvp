import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendEmail } from '@/lib/nodemailer'
import crypto from 'crypto'

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

    // 확인 토큰 생성
    const confirmToken = crypto.randomBytes(32).toString('hex')

    const { error } = await supabase
      .from('subscribers')
      .insert([
        {
          email,
          owner_id: '00000000-0000-0000-0000-000000000000',
          confirmed: false,
          confirm_token: confirmToken,
        }
      ])
      .select()
      .single()

    if (error?.code === '23505') {
      return NextResponse.json(
        { error: '이미 구독 중인 이메일입니다' },
        { status: 400 }
      )
    }

    if (error) throw error

    // 확인 이메일 발송
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const confirmUrl = `${baseUrl}/confirm-subscription?token=${confirmToken}`
    
    await sendEmail({
      to: [email],
      subject: '뉴스레터 구독 확인',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>뉴스레터 구독 확인</h2>
          <p>아래 링크를 클릭하여 구독을 확인해주세요:</p>
          <p>
            <a href="${confirmUrl}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px;">
              구독 확인하기
            </a>
          </p>
          <p>링크가 작동하지 않는 경우 아래 주소를 브라우저에 복사하여 접속해주세요:</p>
          <p>${confirmUrl}</p>
        </div>
      `
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Subscriber creation error:', error)
    return NextResponse.json(
      { error: '구독 처리 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
} 
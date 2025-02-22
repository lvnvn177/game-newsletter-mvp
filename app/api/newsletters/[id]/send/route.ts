import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendEmail } from '@/lib/mailgun'
import { generateNewsletterHTML } from '@/lib/email-template'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // 뉴스레터 데이터 조회
    const { data: newsletter, error: newsletterError } = await supabase
      .from('newsletters')
      .select('*')
      .eq('id', id)
      .single()

    if (newsletterError) throw newsletterError
    if (!newsletter) {
      return NextResponse.json(
        { error: '뉴스레터를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 구독자 목록 조회
    const { data: subscribers, error: subscribersError } = await supabase
      .from('subscribers')
      .select('email')

    if (subscribersError) throw subscribersError
    if (!subscribers.length) {
      return NextResponse.json(
        { error: '발송할 구독자가 없습니다' },
        { status: 400 }
      )
    }

    // 이메일 HTML 생성
    const html = generateNewsletterHTML(newsletter)

    // MVP에서는 한 번에 모든 구독자에게 발송 (실제 서비스에서는 청크 단위로 처리 필요)
    await sendEmail({
      to: subscribers.map(sub => sub.email),
      subject: newsletter.title,
      html,
    })

    // 발송 성공 응답
    return NextResponse.json({
      success: true,
      sentCount: subscribers.length,
    })

  } catch (error) {
    console.error('Newsletter sending error:', error)
    return NextResponse.json(
      { error: '뉴스레터 발송 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
} 
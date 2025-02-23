import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendEmail } from '@/lib/nodemailer'
import { generateNewsletterHTML } from '@/lib/email-template'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    let sendStatus: 'success' | 'failed' = 'success'
    let errorMessage: string | undefined
    let successCount = 0
    let failCount = 0

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

    try {
      // 이메일 발송
      await sendEmail({
        to: subscribers.map(sub => sub.email),
        subject: newsletter.title,
        html,
      })
      successCount = subscribers.length
    } catch (error) {
      sendStatus = 'failed'
      errorMessage = error instanceof Error ? error.message : '발송 중 오류 발생'
      failCount = subscribers.length
    }

    // 발송 이력 저장
    const { error: sendError } = await supabase
      .from('newsletter_sends')
      .insert({
        newsletter_id: id,
        sent_at: new Date().toISOString(),
        status: sendStatus,
        total_recipients: subscribers.length,
        error_message: errorMessage,
        metadata: {
          success_count: successCount,
          fail_count: failCount
        }
      })

    if (sendError) throw sendError

    // 발송 결과 응답
    return NextResponse.json({
      success: sendStatus === 'success',
      sentCount: successCount,
      failCount,
      error: errorMessage
    })

  } catch (error) {
    console.error('Newsletter sending error:', error)
    return NextResponse.json(
      { error: '뉴스레터 발송 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
} 
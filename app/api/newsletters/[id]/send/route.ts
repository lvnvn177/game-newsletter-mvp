import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendEmail } from '@/lib/nodemailer'
import { generateNewsletterHTML } from '@/lib/email-template'

type Params = Promise<{ id: string }>;
type Subscriber = { email: string };

export async function POST(
  request: Request,
  { params }: { params: Params }
) {
  try {
    const { id } = await params
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

    // 확인된 구독자만 조회
    const { data: subscribers, error: subscribersError } = await supabase
      .from('subscribers')
      .select('email')
      .eq('confirmed', true)

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
        to: subscribers.map((sub: Subscriber) => sub.email),
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
    const { error: sendHistoryError } = await supabase
      .from('newsletter_sends')
      .insert([
        {
          newsletter_id: id,
          status: sendStatus,
          total_recipients: subscribers.length,
          metadata: {
            success_count: successCount,
            fail_count: failCount,
          },
          error_message: errorMessage,
        }
      ])

    if (sendHistoryError) throw sendHistoryError

    return NextResponse.json({
      success: sendStatus === 'success',
      sentCount: successCount,
      failCount,
      error: errorMessage,
      newsletterId: id
    })
  } catch (error) {
    console.error('Newsletter sending error:', error)
    return NextResponse.json(
      { error: '뉴스레터 발송 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic' 
import formData from 'form-data'
import Mailgun from 'mailgun.js'

const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY!
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN!
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'noreply@your-domain.com'

if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
  throw new Error('Missing Mailgun configuration')
}

const mailgun = new Mailgun(formData)
const client = mailgun.client({ username: 'api', key: MAILGUN_API_KEY })

export interface EmailData {
  to: string[]
  subject: string
  html: string
  from?: string
}

export async function sendEmail({ to, subject, html, from = SENDER_EMAIL }: EmailData) {
  try {
    const response = await client.messages.create(MAILGUN_DOMAIN, {
      from,
      to,
      subject,
      html,
    })

    console.log('Email sent successfully:', response.id)
    return response
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
} 
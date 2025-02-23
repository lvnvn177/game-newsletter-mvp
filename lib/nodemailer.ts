import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export interface EmailData {
  to: string[]
  subject: string
  html: string
  from?: string
}

export async function sendEmail({ to, subject, html, from }: EmailData) {
  return await transporter.sendMail({
    from: {
      name: '뉴스레터 서비스명',
      address: process.env.SENDER_EMAIL
    },
    to,
    subject,
    html,
    headers: {
      'List-Unsubscribe': '<{unsubscribe_link}>',
      'Precedence': 'bulk'
    }
  })
} 
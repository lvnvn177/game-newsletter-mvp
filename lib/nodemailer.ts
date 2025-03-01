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
  to: string | string[]
  subject: string
  html: string
  from?: string
  bcc?: string | string[]
}

export async function sendEmail({ to, subject, html, from, bcc }: EmailData) {
  return await transporter.sendMail({
    from: {
      name: 'GameHye',
      address: process.env.SENDER_EMAIL
    },
    to,
    bcc,
    subject,
    html,
    headers: {
      'List-Unsubscribe': '<{unsubscribe_link}>',
      'Precedence': 'bulk'
    }
  })
} 
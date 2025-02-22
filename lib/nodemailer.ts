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

export async function sendEmail({ to, subject, html, from = process.env.SENDER_EMAIL }: EmailData) {
  try {
    const info = await transporter.sendMail({
      from,
      to: to.join(', '),
      subject,
      html,
    })

    console.log('Email sent successfully:', info.messageId)
    return info
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
} 
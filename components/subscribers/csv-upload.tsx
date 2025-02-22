'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'

interface CSVUploadProps {
  onUploadSuccess: () => void
}

export function CSVUpload({ onUploadSuccess }: CSVUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'text/csv') {
      toast.error('CSV 파일만 업로드 가능합니다')
      return
    }

    try {
      setIsUploading(true)
      const text = await file.text()
      const emails = text
        .split('\n')
        .map(line => line.trim())
        .filter(email => {
          // 기본적인 이메일 유효성 검사
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          return emailRegex.test(email)
        })

      if (emails.length === 0) {
        toast.error('유효한 이메일이 없습니다')
        return
      }

      if (emails.length > 100) {
        toast.error('최대 100개의 이메일만 업로드 가능합니다')
        return
      }

      // 중복 제거
      const uniqueEmails = [...new Set(emails)]

      // Supabase에 업로드하는 API 호출
      const response = await fetch('/api/subscribers/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emails: uniqueEmails }),
      })

      if (!response.ok) throw new Error('업로드 실패')

      toast.success(`${uniqueEmails.length}개의 이메일이 업로드되었습니다`)
      onUploadSuccess()
    } catch (err) {
      console.error('CSV upload error:', err)
      toast.error('CSV 업로드에 실패했습니다')
    } finally {
      setIsUploading(false)
      // 파일 입력 초기화
      event.target.value = ''
    }
  }

  return (
    <div className="relative">
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        disabled={isUploading}
        className="hidden"
        id="csv-upload"
      />
      <label
        htmlFor="csv-upload"
        className={`cursor-pointer rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 ${
          isUploading ? 'opacity-50' : ''
        }`}
      >
        {isUploading ? '업로드 중...' : 'CSV 업로드'}
      </label>
    </div>
  )
} 
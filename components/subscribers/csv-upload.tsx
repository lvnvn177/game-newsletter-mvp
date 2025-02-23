'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'

interface CSVUploadProps {
  onUploadSuccess: () => void
}

export function CSVUpload({ onUploadSuccess }: CSVUploadProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'text/csv') {
      toast.error('CSV 파일만 업로드 가능합니다')
      return
    }

    try {
      setIsLoading(true)
      const text = await file.text()
      const emails = text
        .split('\n')
        .map(line => line.trim())
        .filter(email => email && email.includes('@'))

      const response = await fetch('/api/subscribers/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }

      toast.success('구독자 목록이 업로드되었습니다')
      onUploadSuccess()
    } catch (err) {
      console.error('CSV upload error:', err)
      toast.error(err instanceof Error ? err.message : 'CSV 업로드에 실패했습니다')
    } finally {
      setIsLoading(false)
      // 파일 입력 초기화
      e.target.value = ''
    }
  }

  return (
    <div className="relative">
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        disabled={isLoading}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
      <button
        type="button"
        disabled={isLoading}
        className="rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:opacity-50"
      >
        {isLoading ? 'CSV 업로드 중...' : 'CSV 업로드'}
      </button>
    </div>
  )
} 
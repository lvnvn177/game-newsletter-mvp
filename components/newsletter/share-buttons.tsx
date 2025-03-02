'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'

interface ShareButtonsProps {
  url: string
  title: string
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('링크가 복사되었습니다')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('링크 복사에 실패했습니다')
    }
  }

  return (
    <div className="flex space-x-2">
      <button
        onClick={handleCopy}
        className="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
      >
        {copied ? '복사됨' : '링크 복사'}
      </button>
      {/* <a
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
          url
        )}&text=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
      >
        Twitter에서 공유
      </a> */}
    </div>
  )
} 
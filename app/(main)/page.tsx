import Image from 'next/image'
import { SubscribeForm } from '@/components/newsletter/subscribe-form'
import LatestNewslettersGrid from '@/components/newsletter/latest-newsletters-grid'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 히어로 섹션 */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          {/* GameHye 텍스트를 이미지로 대체 */}
          <div className="mb-4 flex justify-center">
            <Image 
              src="/icon_mark.png" 
              alt="GameHye" 
              width={250} 
              height={80} 
              priority
              style={{ width: 'auto', height: 'auto' }}
              className="h-auto"
            />
          </div>
          <p className="mb-8 text-xl text-gray-600">
            다양한 게임 소식을 이메일로 받아보세요
          </p>
          <div className="mx-auto max-w-lg">
            <SubscribeForm />
          </div>
        </div>
      </section>

      {/* 최신 뉴스레터 섹션 */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-8 text-2xl font-bold">다양한 게임 뉴스레터</h2>
          <LatestNewslettersGrid />
        </div>
      </section>
    </div>
  )
}

import { SubscribeForm } from '@/components/newsletter/subscribe-form'
import LatestNewslettersGrid from '@/components/newsletter/latest-newsletters-grid'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 히어로 섹션 */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold">GameHye</h1>
          <p className="mb-8 text-xl text-gray-600">
            최신 소식을 이메일로 받아보세요
          </p>
          <div className="mx-auto max-w-lg">
            <SubscribeForm />
          </div>
        </div>
      </section>

      {/* 최신 뉴스레터 섹션 */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-8 text-2xl font-bold">최신 뉴스레터</h2>
          <LatestNewslettersGrid />
        </div>
      </section>
    </div>
  )
}

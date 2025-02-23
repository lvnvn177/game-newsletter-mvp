import Image from 'next/image'
import Link from 'next/link'

export const metadata = {
  title: '소개 | 뉴스레터',
  description: '게임 뉴스레터 서비스 소개',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* 히어로 섹션 */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold">게임 뉴스레터 서비스</h1>
          <p className="mb-8 text-xl text-gray-600">
            매주 엄선된 게임 소식을 이메일로 받아보세요
          </p>
        </div>
      </section>

      {/* 소개 섹션 */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <h2 className="mb-4 text-2xl font-bold">우리의 미션</h2>
              <p className="text-gray-600">
                게임 업계의 최신 소식, 리뷰, e스포츠 소식을 큐레이션하여
                제공합니다. 매주 한 번, 꼭 알아야 할 게임 소식을 이메일로
                전달해드립니다.
              </p>
            </div>
            <div>
              <h2 className="mb-4 text-2xl font-bold">구독 혜택</h2>
              <ul className="space-y-4 text-gray-600">
                <li>• 주간 게임 업계 핵심 뉴스</li>
                <li>• 신작 게임 리뷰 및 프리뷰</li>
                <li>• e스포츠 대회 소식 및 하이라이트</li>
                <li>• 독점 개발자 인터뷰</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="bg-blue-50 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold">지금 구독하세요</h2>
          <p className="mb-8 text-gray-600">
            매주 새로운 게임 소식을 놓치지 마세요
          </p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-blue-500 px-6 py-3 text-white transition-colors hover:bg-blue-600"
          >
            구독하기
          </Link>
        </div>
      </section>
    </div>
  )
} 
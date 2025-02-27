import Image from 'next/image'
import Link from 'next/link'
import { SubscribeForm } from '@/components/newsletter/subscribe-form'

export const metadata = {
  title: '소개 | GameHye',
  description: '게임 뉴스레터 서비스 소개',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* 히어로 섹션 */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="mb-4 flex justify-center">
            <Image 
              src="/icon_mark.png" 
              alt="GameHye" 
              width={250} 
              height={80} 
              className="h-auto"
            />
          </div>
          <p className="mb-8 text-xl text-gray-600">
            게임 리뷰와 해설이 함께하는 프리미엄 뉴스레터
          </p>
        </div>
      </section>

      {/* 소개 섹션 */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <h2 className="mb-4 text-2xl font-bold">서비스 특징</h2>
              <ul className="space-y-4 text-gray-600">
                <li>• 텍스트, 이미지, 오디오가 결합된 멀티미디어 리뷰</li>
                <li>• 상세한 게임 분석</li>
                <li>• 게임 해설 오디오 나레이션 제공</li>
                {/* <li>• 신작 및 할인 게임 위주의 큐레이션</li> */}
              </ul>
            </div>
            <div>
              <h2 className="mb-4 text-2xl font-bold">리뷰 구성</h2>
              <ul className="space-y-4 text-gray-600">
                <li>• 게임 소개 (장르, 개발사, 출시일)</li>
                <li>• 스토리 & 설정 분석</li>
                <li>• 게임플레이 & 시스템 해설</li>
                <li>• 장단점 및 추천 대상</li>
                <li>• 주인장의 음성 해설 제공</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold">구독 신청하기</h2>
          <p className="mb-8 text-gray-600">
            매주 엄선된 게임 리뷰와 주인장의 해설을 받아보세요
          </p>
          <div className="mx-auto max-w-lg">
            <SubscribeForm />
          </div>
        </div>
      </section>
    </div>
  )
} 
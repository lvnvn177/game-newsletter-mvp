import Image from 'next/image'

export function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <div className="mb-4">
              <Image 
                src="/icon_mark.png" 
                alt="GameHye" 
                width={150} 
                height={50} 
                className="h-auto"
              />
            </div>
            <p className="text-sm text-gray-600">
              게임 리뷰와 해설이 함께하는 프리미엄 뉴스레터
            </p>
          </div>
          <div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>회사명: 셀랜딩(Sellanding)</p>
              <p>사업자등록번호: 288-08-03336 | 대표: 이영호</p>
              {/* <p>주소: 서울특별시 강남구 테헤란로 123 게임하이빌딩 4층</p> */}
              <div className="mt-4 flex space-x-4">
                <a 
                  href="https://notion.so/gamehye/terms" 
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline"
                >
                  Terms of Service
                </a>
                <a 
                  href="https://notion.so/gamehye/privacy" 
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline"
                >
                  Privacy Policy
                </a>
                <a 
                  href="https://notion.so/gamehye/copyright" 
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline"
                >
                  Copyright Notice
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-gray-500">
          {/* © Copyright {new Date().getFullYear()} All Rights Reserved */}
          © Copyright sellanding.kr All Rights Reserved
        </div>
      </div>
    </footer>
  )
} 
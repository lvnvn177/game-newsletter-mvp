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
                priority
                style={{ width: 'auto', height: 'auto' }}
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
                  href="https://0407205.notion.site/GameHye-1a9940566a298042ac5cf0a15673357b?pvs=4" 
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline"
                >
                  이용 약관
                </a>
                <a 
                  href="https://0407205.notion.site/GameHye-1a9940566a29809c8c8bd489a5408c57?pvs=4" 
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline"
                >
                  개인 정보 취급 방침
                </a>
                {/* <a 
                  href="https://notion.so/gamehye/copyright" 
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline"
                >
                  Copyright Notice
                </a> */}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-gray-500">
          {/* © Copyright {new Date().getFullYear()} All Rights Reserved */}
          © Copyright Sellanding All Rights Reserved
        </div>
      </div>
    </footer>
  )
} 
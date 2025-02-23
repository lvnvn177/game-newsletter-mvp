export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-8 text-2xl font-bold">관리자 대시보드</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-2 font-semibold">총 구독자</h2>
          {/* 구독자 통계 추가 예정 */}
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-2 font-semibold">발송된 뉴스레터</h2>
          {/* 뉴스레터 통계 추가 예정 */}
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-2 font-semibold">최근 활동</h2>
          {/* 활동 로그 추가 예정 */}
        </div>
      </div>
    </div>
  )
} 
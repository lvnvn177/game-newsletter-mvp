import { Navigation as AdminNavigation } from '@/components/admin/navigation'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation />
      <main className="p-4">{children}</main>
    </div>
  )
} 
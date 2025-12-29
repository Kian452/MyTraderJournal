import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

/**
 * Dashboard layout wrapper
 * Protects all dashboard routes and provides authenticated shell
 */
export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  return <DashboardLayout>{children}</DashboardLayout>
}




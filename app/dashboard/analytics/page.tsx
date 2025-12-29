import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

/**
 * Analytics page
 * TODO: Add analytics charts and insights
 */
export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
      <p className="text-gray-400 mb-8">
        View detailed analytics and insights
      </p>

      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <p className="text-gray-400">
          Analytics dashboard will appear here.
        </p>
      </div>
    </div>
  )
}


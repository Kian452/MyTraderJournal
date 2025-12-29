import { redirect } from 'next/navigation'

/**
 * Dashboard landing page
 * Redirects to journals page
 */
export default function DashboardPage() {
  redirect('/dashboard/journals')
}

import { redirect } from 'next/navigation'

/**
 * Analytics page
 * Redirects to journals page
 */
export default function AnalyticsPage() {
  redirect('/dashboard/journals')
}

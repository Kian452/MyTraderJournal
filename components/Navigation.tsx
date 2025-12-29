'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import ThemeToggle from '@/components/theme/ThemeToggle'

/**
 * Global navigation component
 * Hidden on dashboard routes (dashboard has its own navigation)
 * 
 * TODO: Add mobile menu
 * TODO: Add user dropdown menu
 * TODO: Add language switcher
 * TODO: Add notifications icon
 */
export default function Navigation() {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  // Hide navigation on dashboard routes
  if (pathname?.startsWith('/dashboard')) {
    return null
  }

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-semibold text-gray-900 dark:text-white transition-colors">
              MyTraderJournal
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {status === 'loading' ? (
              <span className="text-gray-500 dark:text-gray-400">Loading...</span>
            ) : session ? (
              <>
                <Link
                  href="/dashboard/journals"
                  className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Journals
                </Link>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  {session.user?.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: '/auth/login' })}
                  className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}


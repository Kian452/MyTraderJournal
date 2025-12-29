'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import ThemeToggle from '@/components/theme/ThemeToggle'

interface DashboardLayoutProps {
  children: React.ReactNode
}

/**
 * Authenticated dashboard layout
 * Provides navigation tabs and app shell for all dashboard routes
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Navigation focused on Journals only
  // Future: Can add Settings tab here if needed

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Top Navigation */}
      <nav className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left: App Name and Navigation */}
            <div className="flex items-center space-x-6">
              <Link href="/dashboard/journals" className="text-xl font-semibold text-gray-900 dark:text-white transition-colors">
                MyTraderJournal
              </Link>
              <Link
                href="/dashboard/journals"
                className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Journals
              </Link>
            </div>

            {/* Right: Theme Toggle and User Menu */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-white focus:outline-none transition-colors"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-gray-700 flex items-center justify-center transition-colors">
                    <span className="text-sm font-medium text-purple-700 dark:text-gray-200">
                      {session?.user?.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                </button>

                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-20 border border-gray-200 dark:border-gray-700 transition-colors">
                      <div className="py-1">
                        <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                          {session?.user?.email}
                        </div>
                        <Link
                          href="/dashboard/settings"
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700 hover:text-purple-600 dark:hover:text-white transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Settings
                        </Link>
                        <button
                          onClick={() => signOut({ callbackUrl: '/auth/login' })}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700 hover:text-purple-600 dark:hover:text-white transition-colors"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
        {children}
      </main>
    </div>
  )
}


'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Top Navigation */}
      <nav className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left: App Name */}
            <div className="flex items-center">
              <Link href="/dashboard/journals" className="text-xl font-semibold text-white">
                MyTradingJourney
              </Link>
            </div>

            {/* Right: User Menu */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white focus:outline-none"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                    <span className="text-sm font-medium">
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
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-20 border border-gray-700">
                      <div className="py-1">
                        <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-700">
                          {session?.user?.email}
                        </div>
                        <button
                          onClick={() => signOut({ callbackUrl: '/' })}
                          className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}


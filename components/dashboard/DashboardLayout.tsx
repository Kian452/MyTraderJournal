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

  const tabs = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Journals', href: '/dashboard/journals' },
    { name: 'Analytics', href: '/dashboard/analytics' },
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Top Navigation */}
      <nav className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left: App Name and Tabs */}
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="text-xl font-semibold text-white">
                MyTradingJourney
              </Link>
              
              {/* Navigation Tabs */}
              <div className="hidden md:flex space-x-1">
                {tabs.map((tab) => (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(tab.href)
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    {tab.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: Actions and User Menu */}
            <div className="flex items-center space-x-4">
              {/* New Journal Button - only show on journals page */}
              {pathname.startsWith('/dashboard/journals') && !pathname.includes('/dashboard/journals/') && (
                <button
                  onClick={() => {
                    // Dispatch custom event to open modal
                    const event = new CustomEvent('openCreateJournalModal')
                    window.dispatchEvent(event)
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  + New Journal
                </button>
              )}

              {/* User Menu */}
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


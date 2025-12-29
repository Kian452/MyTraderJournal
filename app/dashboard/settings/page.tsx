'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from '@/components/theme/ThemeProvider'
import { useToast } from '@/components/ui/ToastContainer'
import Link from 'next/link'

/**
 * Settings page
 * Allows users to configure language, theme, and password
 */
export default function SettingsPage() {
  const { data: session } = useSession()
  const { theme, toggleTheme } = useTheme()
  const { showToast } = useToast()
  const [language, setLanguage] = useState<'en' | 'de'>('en')
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Load language preference
  useEffect(() => {
    const saved = localStorage.getItem('language') as 'en' | 'de' | null
    if (saved && (saved === 'en' || saved === 'de')) {
      setLanguage(saved)
    }
  }, [])

  const handleLanguageChange = (lang: 'en' | 'de') => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
    showToast(`Language changed to ${lang === 'en' ? 'English' : 'German'}`, 'success')
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match', 'error')
      return
    }

    if (passwordData.newPassword.length < 8) {
      showToast('Password must be at least 8 characters', 'error')
      return
    }

    setIsChangingPassword(true)
    
    // TODO: Call backend API when endpoint is available
    // For now, show "coming soon" message
    setTimeout(() => {
      setIsChangingPassword(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      showToast('Password change feature coming soon', 'info')
    }, 1000)
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/journals"
          className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 mb-6 inline-block transition-colors"
        >
          ← Back to Journals
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your account preferences and settings
        </p>
      </div>

      <div className="space-y-6">
        {/* Account Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Account</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
              <p className="text-gray-900 dark:text-white mt-1">{session?.user?.email}</p>
            </div>
            {session?.user?.name && (
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                <p className="text-gray-900 dark:text-white mt-1">{session.user.name}</p>
              </div>
            )}
          </div>
        </div>

        {/* Language Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Language</h2>
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choose your preferred language for the interface
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => handleLanguageChange('en')}
                className={`px-4 py-2 rounded-lg border transition-all duration-300 ${
                  language === 'en'
                    ? 'bg-purple-600 dark:bg-purple-500 text-white border-purple-600 dark:border-purple-500'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600'
                }`}
              >
                English
              </button>
              <button
                onClick={() => handleLanguageChange('de')}
                className={`px-4 py-2 rounded-lg border transition-all duration-300 ${
                  language === 'de'
                    ? 'bg-purple-600 dark:bg-purple-500 text-white border-purple-600 dark:border-purple-500'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600'
                }`}
              >
                Deutsch
              </button>
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Theme</h2>
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choose between light and dark mode
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => theme !== 'light' && toggleTheme()}
                className={`px-4 py-2 rounded-lg border transition-all duration-300 ${
                  theme === 'light'
                    ? 'bg-purple-600 dark:bg-purple-500 text-white border-purple-600 dark:border-purple-500'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600'
                }`}
              >
                Light
              </button>
              <button
                onClick={() => theme !== 'dark' && toggleTheme()}
                className={`px-4 py-2 rounded-lg border transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-purple-600 dark:bg-purple-500 text-white border-purple-600 dark:border-purple-500'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600'
                }`}
              >
                Dark
              </button>
            </div>
          </div>
        </div>

        {/* Password Change */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Change Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-colors"
                placeholder="Enter current password"
                disabled={isChangingPassword}
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-colors"
                placeholder="Enter new password (min 8 characters)"
                disabled={isChangingPassword}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-colors"
                placeholder="Confirm new password"
                disabled={isChangingPassword}
              />
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                <strong>Note:</strong> Password change feature is coming soon. Backend endpoint will be added in a future update.
              </p>
            </div>
            <button
              type="submit"
              disabled={isChangingPassword}
              className="px-4 py-2 bg-purple-600 dark:bg-purple-500 hover:bg-purple-700 dark:hover:bg-purple-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChangingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* Sign Out */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Sign Out</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Sign out of your account
          </p>
          <button
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}


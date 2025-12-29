'use client'

import { useEffect } from 'react'

export type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type: ToastType
  onClose: () => void
  duration?: number
}

/**
 * Toast notification component
 * Displays temporary success/error messages
 */
export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const bgColor =
    type === 'success'
      ? 'bg-green-500/20 dark:bg-green-500/20 border-green-500/50 dark:border-green-500/50 text-green-600 dark:text-green-400'
      : type === 'error'
      ? 'bg-red-500/20 dark:bg-red-500/20 border-red-500/50 dark:border-red-500/50 text-red-600 dark:text-red-400'
      : 'bg-purple-500/20 dark:bg-purple-500/20 border-purple-500/50 dark:border-purple-500/50 text-purple-600 dark:text-purple-400'

  return (
    <div
      className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-md border backdrop-blur-sm shadow-lg min-w-[300px] max-w-md ${bgColor}`}
      role="alert"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className="ml-4 text-current opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}


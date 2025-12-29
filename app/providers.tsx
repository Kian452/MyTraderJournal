'use client'

import { SessionProvider } from 'next-auth/react'
import { ToastProvider } from '@/components/ui/ToastContainer'
import { ThemeProvider } from '@/components/theme/ThemeProvider'

/**
 * Client-side providers
 * Wraps the app with NextAuth session provider, theme provider, and toast notifications
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}


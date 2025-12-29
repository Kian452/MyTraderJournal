'use client'

import { SessionProvider } from 'next-auth/react'
import { ToastProvider } from '@/components/ui/ToastContainer'

/**
 * Client-side providers
 * Wraps the app with NextAuth session provider and toast notifications
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>{children}</ToastProvider>
    </SessionProvider>
  )
}


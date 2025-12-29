'use client'

import { SessionProvider } from 'next-auth/react'

/**
 * Client-side providers
 * Wraps the app with NextAuth session provider
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}


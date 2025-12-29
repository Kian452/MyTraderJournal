import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

/**
 * Middleware for protecting routes
 * 
 * TODO: Add role-based access control
 * TODO: Add rate limiting
 * TODO: Add CSRF protection
 */

export default withAuth(
  function middleware(req) {
    // Additional middleware logic can be added here
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect dashboard and other authenticated routes
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    // Add other protected routes here as needed
  ],
}


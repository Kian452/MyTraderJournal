import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

/**
 * NextAuth configuration
 * 
 * TODO: Replace mock validation with actual database queries
 * TODO: Add password hashing (bcrypt)
 * TODO: Add user registration logic
 * TODO: Add email verification
 * TODO: Add password reset functionality
 */

// Mock user store (temporary - will be replaced with database)
// TODO: Remove this when database models are implemented
const mockUsers = [
  {
    id: '1',
    email: 'demo@example.com',
    password: 'demo123', // In production, this should be hashed
    name: 'Demo User',
  },
]

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Mock validation - replace with database query
        const user = mockUsers.find(
          (u) => u.email === credentials.email && u.password === credentials.password
        )

        if (!user) {
          return null
        }

        // Return user object (will be encoded in JWT)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production',
}


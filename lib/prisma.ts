import { PrismaClient } from '@prisma/client'

/**
 * Prisma Client singleton
 * 
 * Prevents multiple instances of Prisma Client in development
 * (Next.js hot reload can create multiple instances)
 * 
 * Usage:
 *   import { prisma } from '@/lib/prisma'
 *   const users = await prisma.user.findMany()
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma


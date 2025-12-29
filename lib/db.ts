import { prisma } from './prisma'

/**
 * Database utilities using Prisma ORM
 * 
 * Prisma handles connection pooling automatically.
 * Use the prisma client directly from '@/lib/prisma' for queries.
 * 
 * This file provides utility functions for database operations.
 */

/**
 * Test database connection
 * 
 * TODO: Implement health check endpoint
 */
export async function testConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database connection error:', error)
    return false
  }
}

/**
 * Disconnect Prisma client
 * Useful for cleanup in scripts or tests
 */
export async function disconnect(): Promise<void> {
  await prisma.$disconnect()
}

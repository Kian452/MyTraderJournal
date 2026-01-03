import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/journals
 * Returns all journals for the authenticated user
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Query journals - handle case where Prisma client may be out of sync
    let journals: any[]
    try {
      journals = await prisma.journal.findMany({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
    } catch (dbError: any) {
      // If it's a Prisma error about missing fields, provide helpful message
      if (dbError?.code === 'P2009' || dbError?.message?.includes('Unknown arg')) {
        throw new Error(
          'Database schema mismatch. Please run: npm run db:generate && npm run db:migrate'
        )
      }
      // If it's a connection error
      if (dbError?.code === 'P1001' || dbError?.message?.includes('connect')) {
        throw new Error(
          'Database connection failed. Please check DATABASE_URL and ensure the database is running.'
        )
      }
      throw dbError
    }

    // Transform to match frontend interface
    // Note: TypeScript types may be out of sync until Prisma client is regenerated
    const response = journals.map((journal: any) => ({
      id: journal.id,
      name: journal.name,
      startingCapital: journal.startingCapital,
      currentCapital: journal.currentCapital,
      currency: journal.currency || 'USD',
      tradesCount: journal.tradesCount ?? 0,
      updatedAt: journal.updatedAt || journal.createdAt,
      createdAt: journal.createdAt,
    }))

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching journals:', error)
    
    // In development, return detailed error information
    if (process.env.NODE_ENV === 'development') {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const errorStack = error instanceof Error ? error.stack : undefined
      
      return NextResponse.json(
        {
          error: 'Failed to fetch journals',
          details: errorMessage,
          stack: errorStack,
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch journals' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/journals
 * Creates a new journal for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, startingCapital, currency } = body

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    if (
      typeof startingCapital !== 'number' ||
      startingCapital <= 0 ||
      !isFinite(startingCapital)
    ) {
      return NextResponse.json(
        { error: 'Starting capital must be a positive number' },
        { status: 400 }
      )
    }

    if (currency !== 'USD' && currency !== 'EUR') {
      return NextResponse.json(
        { error: 'Currency must be USD or EUR' },
        { status: 400 }
      )
    }

    // Create journal
    // Note: TypeScript types may be out of sync until Prisma client is regenerated
    const journal = await (prisma.journal.create as any)({
      data: {
        userId: session.user.id,
        name: name.trim(),
        startingCapital,
        currentCapital: startingCapital, // Initially equals starting capital
        currency,
        tradesCount: 0, // Initially no trades
      },
    })

    // Transform response
    // Note: TypeScript types may be out of sync until Prisma client is regenerated
    const journalData = journal as any
    const response = {
      id: journal.id,
      name: journal.name,
      startingCapital: journal.startingCapital,
      currentCapital: journal.currentCapital,
      currency: journalData.currency || 'USD',
      tradesCount: journalData.tradesCount ?? 0,
      updatedAt: journalData.updatedAt || journal.createdAt,
      createdAt: journal.createdAt,
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating journal:', error)
    
    // In development, return detailed error information
    if (process.env.NODE_ENV === 'development') {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const errorStack = error instanceof Error ? error.stack : undefined
      
      return NextResponse.json(
        {
          error: 'Failed to create journal',
          details: errorMessage,
          stack: errorStack,
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create journal' },
      { status: 500 }
    )
  }
}



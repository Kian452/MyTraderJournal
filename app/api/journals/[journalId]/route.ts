import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/journals/[journalId]
 * Returns a single journal with ownership check
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ journalId: string }> | { journalId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await Promise.resolve(params)
    const journalId = resolvedParams.journalId

    const journal = await prisma.journal.findUnique({
      where: { id: journalId },
    })

    if (!journal) {
      return NextResponse.json({ error: 'Journal not found' }, { status: 404 })
    }

    if (journal.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden: Journal does not belong to user' },
        { status: 403 }
      )
    }

    // Transform to match frontend interface
    // Note: TypeScript types may be out of sync with schema until Prisma client is regenerated
    const journalData = journal as any
    const response = {
      id: journal.id,
      name: journal.name,
      startingCapital: journal.startingCapital,
      currentCapital: journal.currentCapital,
      currency: journalData.currency || 'USD',
      tradesCount: journalData.tradesCount ?? 0,
      updatedAt: journalData.updatedAt?.toISOString() || journal.createdAt.toISOString(),
      createdAt: journal.createdAt.toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching journal:', error)
    return NextResponse.json(
      { error: 'Failed to fetch journal' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/journals/[journalId]
 * Deletes a journal if it belongs to the authenticated user
 * Cascades to delete related trades
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ journalId: string }> | { journalId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await Promise.resolve(params)
    const journalId = resolvedParams.journalId

    // Check if journal exists and belongs to user
    const journal = await prisma.journal.findUnique({
      where: { id: journalId },
      select: { userId: true },
    })

    if (!journal) {
      return NextResponse.json({ error: 'Journal not found' }, { status: 404 })
    }

    if (journal.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden: Journal does not belong to user' },
        { status: 403 }
      )
    }

    // Delete journal (cascades to trades via Prisma schema)
    await prisma.journal.delete({
      where: { id: journalId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting journal:', error)
    return NextResponse.json(
      { error: 'Failed to delete journal' },
      { status: 500 }
    )
  }
}



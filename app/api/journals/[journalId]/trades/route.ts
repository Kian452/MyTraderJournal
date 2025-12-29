import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateTradeInput, computeTradeMetrics, prepareTradeForComputation } from '@/lib/api/tradeHelpers'

/**
 * GET /api/journals/[journalId]/trades
 * Returns all trades for a journal (with ownership check)
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

    // Check journal ownership
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

    // Fetch trades with partials
    // Note: TypeScript types may be out of sync until Prisma client is regenerated
    const trades = await (prisma.trade.findMany as any)({
      where: { journalId },
      include: {
        partials: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: {
        tradeDate: 'desc',
      },
    })

    // Transform to match frontend format
    const response = trades.map((trade: any) => ({
      id: trade.id,
      journalId: trade.journalId,
      tradeDate: trade.tradeDate.toISOString(),
      outcome: trade.outcome,
      riskAmount: trade.riskAmount,
      mainRR: trade.mainRR,
      partials: (trade.partials || []).map((p: any) => ({
        sizeFraction: p.percentage / 100, // Convert percentage to fraction for frontend
        rr: p.rr,
      })),
      profitLoss: trade.profitLoss,
      rMultiple: trade.rMultiple,
      createdAt: trade.createdAt.toISOString(),
    }))

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching trades:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trades' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/journals/[journalId]/trades
 * Creates a new trade and updates journal aggregates
 */
export async function POST(
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

    // Check journal ownership
    const journal = await prisma.journal.findUnique({
      where: { id: journalId },
      select: { userId: true, startingCapital: true },
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

    const body = await request.json()
    const tradeInput = {
      tradeDate: body.tradeDate ? new Date(body.tradeDate) : new Date(),
      outcome: body.outcome,
      riskAmount: body.riskAmount,
      mainRR: body.mainRR ?? null,
      partials: body.partials || [],
    }

    // Validate input
    const validation = validateTradeInput(tradeInput)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Compute metrics
    const metrics = computeTradeMetrics(tradeInput)

    // Create trade and update journal in a transaction
    // Note: TypeScript types may be out of sync until Prisma client is regenerated
    const result = await prisma.$transaction(async (tx: any) => {
      // Create trade
      const trade = await tx.trade.create({
        data: {
          journalId,
          tradeDate: tradeInput.tradeDate,
          outcome: tradeInput.outcome,
          riskAmount: tradeInput.riskAmount,
          mainRR: tradeInput.mainRR,
          profitLoss: metrics.profitLoss,
          rMultiple: metrics.rMultiple,
          isWin: metrics.isWin,
          partials: {
            create: tradeInput.partials.map((p) => ({
              percentage: p.percentage,
              rr: p.rr,
            })),
          },
        },
        include: {
          partials: {
            orderBy: { createdAt: 'asc' },
          },
        },
      })

      // Recompute journal aggregates
      const allTrades = await tx.trade.findMany({
        where: { journalId },
        select: { profitLoss: true },
      })

      const totalPL = allTrades.reduce((sum, t) => sum + t.profitLoss, 0)
      const tradesCount = allTrades.length

      await tx.journal.update({
        where: { id: journalId },
        data: {
          currentCapital: journal.startingCapital + totalPL,
          tradesCount,
        },
      })

      return trade
    })

    // Transform response
    const response = {
      id: result.id,
      journalId: result.journalId,
      tradeDate: result.tradeDate.toISOString(),
      outcome: result.outcome,
      riskAmount: result.riskAmount,
      mainRR: result.mainRR,
      partials: (result.partials || []).map((p: any) => ({
        sizeFraction: p.percentage / 100,
        rr: p.rr,
      })),
      profitLoss: result.profitLoss,
      rMultiple: result.rMultiple,
      createdAt: result.createdAt.toISOString(),
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating trade:', error)
    return NextResponse.json(
      { error: 'Failed to create trade' },
      { status: 500 }
    )
  }
}


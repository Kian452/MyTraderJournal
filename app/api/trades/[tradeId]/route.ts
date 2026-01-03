import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateTradeInput, computeTradeMetrics, type TradeInput, type TradePartialInput } from '@/lib/api/tradeHelpers'

/**
 * PUT /api/trades/[tradeId]
 * Updates a trade and recomputes journal aggregates
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ tradeId: string }> | { tradeId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await Promise.resolve(params)
    const tradeId = resolvedParams.tradeId

    // Find trade and check ownership through journal
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      include: {
        journal: {
          select: { userId: true, startingCapital: true },
        },
      },
    })

    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    if (trade.journal.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden: Trade does not belong to user' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const tradeInput: TradeInput = {
      tradeDate: body.tradeDate ? new Date(body.tradeDate) : trade.tradeDate,
      outcome: body.outcome,
      riskAmount: body.riskAmount,
      mainRR: body.mainRR ?? null,
      partials: body.partials || [],
      thoughtProcess: body.thoughtProcess || null,
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

    // Update trade and journal aggregates in a transaction
    // Note: TypeScript types may be out of sync until Prisma client is regenerated
    const result = await prisma.$transaction(async (tx: any) => {
      // Delete existing partials and create new ones
      await tx.tradePartial.deleteMany({
        where: { tradeId },
      })

      // Update trade
      const updatedTrade = await tx.trade.update({
        where: { id: tradeId },
        data: {
          tradeDate: tradeInput.tradeDate,
          outcome: tradeInput.outcome,
          riskAmount: tradeInput.riskAmount,
          mainRR: tradeInput.mainRR,
          thoughtProcess: tradeInput.thoughtProcess || null,
          profitLoss: metrics.profitLoss,
          rMultiple: metrics.rMultiple,
          isWin: metrics.isWin,
          partials: {
            create: (tradeInput.partials ?? []).map((p: TradePartialInput) => ({
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
        where: { journalId: trade.journalId },
        select: { profitLoss: true },
      })

      const totalPL = allTrades.reduce((sum: number, t: { profitLoss: number }) => sum + t.profitLoss, 0)
      const tradesCount = allTrades.length

      await tx.journal.update({
        where: { id: trade.journalId },
        data: {
          currentCapital: trade.journal.startingCapital + totalPL,
          tradesCount,
        },
      })

      return updatedTrade
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
      thoughtProcess: result.thoughtProcess || null,
      createdAt: result.createdAt.toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating trade:', error)
    return NextResponse.json(
      { error: 'Failed to update trade' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/trades/[tradeId]
 * Deletes a trade and recomputes journal aggregates
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tradeId: string }> | { tradeId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await Promise.resolve(params)
    const tradeId = resolvedParams.tradeId

    // Find trade and check ownership through journal
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      include: {
        journal: {
          select: { userId: true, startingCapital: true },
        },
      },
    })

    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    if (trade.journal.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden: Trade does not belong to user' },
        { status: 403 }
      )
    }

    // Delete trade and update journal aggregates in a transaction
    // Note: TypeScript types may be out of sync until Prisma client is regenerated
    await prisma.$transaction(async (tx: any) => {
      // Delete trade (cascades to partials)
      await tx.trade.delete({
        where: { id: tradeId },
      })

      // Recompute journal aggregates
      const allTrades = await tx.trade.findMany({
        where: { journalId: trade.journalId },
        select: { profitLoss: true },
      })

      const totalPL = allTrades.reduce((sum: number, t: { profitLoss: number }) => sum + t.profitLoss, 0)
      const tradesCount = allTrades.length

      await tx.journal.update({
        where: { id: trade.journalId },
        data: {
          currentCapital: trade.journal.startingCapital + totalPL,
          tradesCount,
        },
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting trade:', error)
    return NextResponse.json(
      { error: 'Failed to delete trade' },
      { status: 500 }
    )
  }
}



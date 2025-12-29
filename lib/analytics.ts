/**
 * Analytics computation helpers
 * Pure functions for calculating trade statistics and metrics
 */

import type { Trade } from './api/trades'

export interface EquityPoint {
  date: string // YYYY-MM-DD
  equity: number
}

export interface DailyPnL {
  date: string // YYYY-MM-DD
  pnl: number
  tradeCount: number
}

export interface OutcomeCounts {
  wins: number
  losses: number
  breakevens: number
  total: number
}

/**
 * Compute winrate percentage
 */
export function computeWinrate(trades: Trade[]): number {
  if (trades.length === 0) return 0
  const wins = trades.filter((t) => t.outcome === 'WIN' && t.profitLoss > 0).length
  return (wins / trades.length) * 100
}

/**
 * Compute average R multiple
 */
export function computeAvgR(trades: Trade[]): number {
  if (trades.length === 0) return 0
  const sum = trades.reduce((acc, t) => acc + t.rMultiple, 0)
  return sum / trades.length
}

/**
 * Compute equity curve aggregated by day
 * Returns array of equity points sorted by date ascending
 */
export function computeEquityByDay(
  trades: Trade[],
  startingCapital: number
): EquityPoint[] {
  if (trades.length === 0) {
    return [
      {
        date: new Date().toISOString().split('T')[0],
        equity: startingCapital,
      },
    ]
  }

  // Sort trades by date ascending
  const sortedTrades = [...trades].sort(
    (a, b) => new Date(a.tradeDate).getTime() - new Date(b.tradeDate).getTime()
  )

  // Aggregate trades by day
  const dailyPnL = new Map<string, number>()
  for (const trade of sortedTrades) {
    const dateStr = new Date(trade.tradeDate).toISOString().split('T')[0]
    dailyPnL.set(dateStr, (dailyPnL.get(dateStr) || 0) + trade.profitLoss)
  }

  // Build equity series
  const equityPoints: EquityPoint[] = []
  let runningEquity = startingCapital

  // Get all unique dates sorted
  const dates = Array.from(dailyPnL.keys()).sort()

  for (const date of dates) {
    runningEquity += dailyPnL.get(date) || 0
    equityPoints.push({
      date,
      equity: runningEquity,
    })
  }

  // If no trades, return starting capital point
  if (equityPoints.length === 0) {
    const today = new Date().toISOString().split('T')[0]
    equityPoints.push({
      date: today,
      equity: startingCapital,
    })
  }

  return equityPoints
}

/**
 * Compute daily P/L aggregated by date
 */
export function computeDailyPnL(trades: Trade[]): DailyPnL[] {
  const dailyMap = new Map<string, { pnl: number; count: number }>()

  for (const trade of trades) {
    const dateStr = new Date(trade.tradeDate).toISOString().split('T')[0]
    const existing = dailyMap.get(dateStr) || { pnl: 0, count: 0 }
    dailyMap.set(dateStr, {
      pnl: existing.pnl + trade.profitLoss,
      count: existing.count + 1,
    })
  }

  return Array.from(dailyMap.entries())
    .map(([date, data]) => ({
      date,
      pnl: data.pnl,
      tradeCount: data.count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Compute outcome counts (wins, losses, breakevens)
 */
export function computeOutcomeCounts(trades: Trade[]): OutcomeCounts {
  const wins = trades.filter((t) => t.outcome === 'WIN' && t.profitLoss > 0).length
  const losses = trades.filter((t) => t.outcome === 'LOSS').length
  const breakevens = trades.filter((t) => t.outcome === 'BE').length

  return {
    wins,
    losses,
    breakevens,
    total: trades.length,
  }
}

/**
 * Compute average trades per day
 */
export function computeAvgTradesPerDay(trades: Trade[]): number {
  if (trades.length === 0) return 0

  // Get date range
  const dates = trades.map((t) => new Date(t.tradeDate).getTime())
  const minDate = Math.min(...dates)
  const maxDate = Math.max(...dates)

  // Calculate days between first and last trade
  const daysDiff = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1

  if (daysDiff === 0) return trades.length

  return trades.length / daysDiff
}


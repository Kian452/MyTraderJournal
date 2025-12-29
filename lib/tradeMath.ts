/**
 * Trading computation utilities
 * Centralized logic for computing trade metrics
 */

import type { TradeOutcome, TradePartial } from './store'

export interface TradeInput {
  outcome: TradeOutcome
  riskAmount: number
  mainRR: number | null
  partials: TradePartial[]
}

export interface TradeMetrics {
  profitLoss: number
  rMultiple: number
  isWin: boolean
}

/**
 * Compute trade metrics (profitLoss, rMultiple, isWin) from trade input
 */
export function computeTrade(input: TradeInput): TradeMetrics {
  const { outcome, riskAmount, mainRR, partials } = input

  if (outcome === 'LOSS') {
    return {
      profitLoss: -riskAmount,
      rMultiple: -1,
      isWin: false,
    }
  }

  if (outcome === 'BE') {
    return {
      profitLoss: 0,
      rMultiple: 0,
      isWin: false,
    }
  }

  // WIN outcome
  if (partials.length === 0) {
    // No partials: simple calculation
    if (!mainRR) {
      throw new Error('mainRR is required for WIN outcome without partials')
    }
    const profitLoss = riskAmount * mainRR
    return {
      profitLoss,
      rMultiple: mainRR,
      isWin: profitLoss > 0,
    }
  }

  // With partials
  const totalFraction = partials.reduce((sum, p) => sum + p.sizeFraction, 0)
  const remaining = Math.max(0, 1 - totalFraction)

  // Calculate profit from partials
  const partialProfit = partials.reduce(
    (sum, p) => sum + riskAmount * p.sizeFraction * p.rr,
    0
  )

  // Calculate profit from remaining (if any)
  const remainingProfit = remaining > 0 && mainRR
    ? riskAmount * remaining * mainRR
    : 0

  const profitLoss = partialProfit + remainingProfit
  const rMultiple = profitLoss / riskAmount

  return {
    profitLoss,
    rMultiple,
    isWin: profitLoss > 0,
  }
}


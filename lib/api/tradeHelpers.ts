/**
 * Server-side trade computation helpers
 * Reuses the same computation logic as client-side
 */

import { computeTrade } from '@/lib/tradeMath'
import type { TradeOutcome } from '@/lib/types'

export interface TradeInput {
  tradeDate?: Date | string
  outcome: TradeOutcome
  riskAmount: number
  mainRR?: number | null
  partials?: Array<{ percentage: number; rr: number }>
  thoughtProcess?: string | null
}

export interface TradePartialInput {
  percentage: number // 0-100
  rr: number
}

/**
 * Validate trade input
 */
export function validateTradeInput(input: TradeInput): { valid: boolean; error?: string } {
  // Validate riskAmount
  if (typeof input.riskAmount !== 'number' || input.riskAmount <= 0) {
    return { valid: false, error: 'riskAmount must be a positive number' }
  }

  // Validate outcome
  if (!['WIN', 'LOSS', 'BE'].includes(input.outcome)) {
    return { valid: false, error: 'outcome must be WIN, LOSS, or BE' }
  }

  // Validate partials if provided
  if (input.partials && input.partials.length > 0) {
    let totalPercentage = 0
    for (const partial of input.partials) {
      if (typeof partial.percentage !== 'number' || partial.percentage <= 0 || partial.percentage > 100) {
        return { valid: false, error: 'Partial percentage must be between 0 and 100' }
      }
      if (typeof partial.rr !== 'number' || partial.rr <= 0) {
        return { valid: false, error: 'Partial RR must be a positive number' }
      }
      totalPercentage += partial.percentage
    }
    if (totalPercentage > 100) {
      return { valid: false, error: 'Total partial percentages cannot exceed 100%' }
    }
  }

  // Validate mainRR for WIN trades
  if (input.outcome === 'WIN') {
    const hasPartials = input.partials && input.partials.length > 0
    const totalPercentage = hasPartials
      ? input.partials!.reduce((sum, p) => sum + p.percentage, 0)
      : 0

    if (!hasPartials || totalPercentage < 100) {
      // Main RR required if no partials or partials don't sum to 100%
      if (!input.mainRR || typeof input.mainRR !== 'number' || input.mainRR <= 0) {
        return { valid: false, error: 'mainRR is required for WIN trades when partials sum < 100%' }
      }
    }
  }

  return { valid: true }
}

/**
 * Convert trade input to format expected by computeTrade
 */
export function prepareTradeForComputation(input: TradeInput) {
  const partials = (input.partials || []).map((p) => ({
    sizeFraction: p.percentage / 100, // Convert percentage to fraction
    rr: p.rr,
  }))

  return {
    outcome: input.outcome,
    riskAmount: input.riskAmount,
    mainRR: input.mainRR || null,
    partials,
  }
}

/**
 * Compute trade metrics using the shared computation function
 */
export function computeTradeMetrics(input: TradeInput) {
  const prepared = prepareTradeForComputation(input)
  return computeTrade(prepared)
}


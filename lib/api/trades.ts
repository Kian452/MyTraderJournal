/**
 * API client for Trades
 * Handles all API calls related to trades
 */

import type { TradeOutcome } from '@/lib/types'
export type { TradeOutcome }

export interface TradePartial {
  sizeFraction: number // 0-1
  rr: number
}

export interface Trade {
  id: string
  journalId: string
  tradeDate: string | Date
  outcome: TradeOutcome
  riskAmount: number
  mainRR: number | null
  partials: TradePartial[]
  profitLoss: number
  rMultiple: number
  thoughtProcess?: string | null
  createdAt: string | Date
}

export interface CreateTradeInput {
  tradeDate?: Date | string
  outcome: TradeOutcome
  riskAmount: number
  mainRR?: number | null
  partials?: Array<{ percentage: number; rr: number }>
  thoughtProcess?: string | null
}

export interface UpdateTradeInput extends CreateTradeInput {}

/**
 * Fetch all trades for a journal
 */
export async function fetchTrades(journalId: string): Promise<Trade[]> {
  const response = await fetch(`/api/journals/${journalId}/trades`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized: Please log in')
    }
    if (response.status === 403) {
      throw new Error('Forbidden: You do not have permission to view these trades')
    }
    if (response.status === 404) {
      throw new Error('Journal not found')
    }
    const error = await response.json().catch(() => ({ error: 'Failed to fetch trades' }))
    throw new Error(error.error || 'Failed to fetch trades')
  }

  const data = await response.json()
  
  // Transform dates from strings to Date objects
  return data.map((trade: any) => ({
    ...trade,
    tradeDate: new Date(trade.tradeDate),
    createdAt: new Date(trade.createdAt),
  }))
}

/**
 * Create a new trade
 */
export async function createTrade(journalId: string, input: CreateTradeInput): Promise<Trade> {
  const response = await fetch(`/api/journals/${journalId}/trades`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...input,
      tradeDate: input.tradeDate ? new Date(input.tradeDate).toISOString() : undefined,
    }),
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized: Please log in')
    }
    if (response.status === 403) {
      throw new Error('Forbidden: You do not have permission to create trades')
    }
    if (response.status === 404) {
      throw new Error('Journal not found')
    }
    const error = await response.json().catch(() => ({ error: 'Failed to create trade' }))
    throw new Error(error.error || 'Failed to create trade')
  }

  const data = await response.json()
  
  // Transform dates from strings to Date objects
  return {
    ...data,
    tradeDate: new Date(data.tradeDate),
    createdAt: new Date(data.createdAt),
  }
}

/**
 * Update a trade
 */
export async function updateTrade(tradeId: string, input: UpdateTradeInput): Promise<Trade> {
  const response = await fetch(`/api/trades/${tradeId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...input,
      tradeDate: input.tradeDate ? new Date(input.tradeDate).toISOString() : undefined,
    }),
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized: Please log in')
    }
    if (response.status === 403) {
      throw new Error('Forbidden: You do not have permission to update this trade')
    }
    if (response.status === 404) {
      throw new Error('Trade not found')
    }
    const error = await response.json().catch(() => ({ error: 'Failed to update trade' }))
    throw new Error(error.error || 'Failed to update trade')
  }

  const data = await response.json()
  
  // Transform dates from strings to Date objects
  return {
    ...data,
    tradeDate: new Date(data.tradeDate),
    createdAt: new Date(data.createdAt),
  }
}

/**
 * Delete a trade
 */
export async function deleteTrade(tradeId: string): Promise<void> {
  const response = await fetch(`/api/trades/${tradeId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized: Please log in')
    }
    if (response.status === 403) {
      throw new Error('Forbidden: You do not have permission to delete this trade')
    }
    if (response.status === 404) {
      throw new Error('Trade not found')
    }
    const error = await response.json().catch(() => ({ error: 'Failed to delete trade' }))
    throw new Error(error.error || 'Failed to delete trade')
  }
}


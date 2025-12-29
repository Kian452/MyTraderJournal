/**
 * In-memory store for journals and trades
 * 
 * This is a simple client-side store that maintains data consistency
 * across routes during a session. In production, this will be replaced
 * with API calls to the backend.
 * 
 * Uses a simple event emitter pattern for React state synchronization.
 */

import { Journal, Currency } from './mockJournals'
import { computeTrade } from './tradeMath'

export type TradeOutcome = 'WIN' | 'LOSS' | 'BE'

export interface TradePartial {
  sizeFraction: number // 0.01 to 1.00
  rr: number // > 0
}

export interface Trade {
  id: string
  journalId: string
  tradeDate: Date
  outcome: TradeOutcome
  riskAmount: number
  mainRR: number | null // nullable if partials total to 1.0
  partials: TradePartial[]
  profitLoss: number // computed
  rMultiple: number // computed (profitLoss / riskAmount)
  createdAt: Date
}

// In-memory data storage
let journals: Journal[] = []
let trades: Trade[] = []
let listeners: Set<() => void> = new Set()

// Cached snapshot for stability (only updated when data changes)
let cachedSnapshot: { journals: Journal[]; trades: Trade[] } | null = null
let snapshotVersion = 0

// Event emitter for React state synchronization
function emitChange() {
  // Invalidate cached snapshot
  cachedSnapshot = null
  snapshotVersion++
  listeners.forEach((listener) => listener())
}

// Subscribe to store changes
export function subscribe(listener: () => void) {
  listeners.add(listener)
  // DO NOT call listener immediately - let React handle initial render
  return () => {
    listeners.delete(listener)
  }
}

// Initialize with mock data if empty
function initialize() {
  if (journals.length === 0) {
    const mockJournals: Journal[] = [
      {
        id: '1',
        name: 'Forex Trading Journal',
        startingCapital: 10000,
        currentCapital: 10000,
        currency: 'USD',
        tradesCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date('2023-12-01'),
      },
      {
        id: '2',
        name: 'Stock Trading Journal',
        startingCapital: 5000,
        currentCapital: 5000,
        currency: 'USD',
        tradesCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date('2023-11-15'),
      },
      {
        id: '3',
        name: 'Crypto Journal',
        startingCapital: 2000,
        currentCapital: 2000,
        currency: 'USD',
        tradesCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date('2024-01-01'),
      },
    ]
    journals = mockJournals
    // Don't emit change during initialization - let React handle it
  }
}

// Initialize on module load
if (typeof window !== 'undefined') {
  // Load from localStorage if available
  const stored = localStorage.getItem('store_journals')
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      journals = parsed.map((j: any) => ({
        ...j,
        lastUpdated: new Date(j.lastUpdated),
        createdAt: new Date(j.createdAt),
      }))
    } catch (e) {
      initialize()
    }
  } else {
    initialize()
  }

  const storedTrades = localStorage.getItem('store_trades')
  if (storedTrades) {
    try {
      const parsed = JSON.parse(storedTrades)
      trades = parsed.map((t: any) => {
        // Migrate old trade format to new format
        if (t.profitLoss !== undefined && t.riskReward !== undefined && !t.outcome) {
          // Old format: convert to new format
          const outcome: TradeOutcome =
            t.profitLoss > 0 ? 'WIN' : t.profitLoss < 0 ? 'LOSS' : 'BE'
          const riskAmount = Math.abs(t.profitLoss / (t.profitLoss > 0 ? t.riskReward : -1))
          
          return {
            id: t.id,
            journalId: t.journalId,
            tradeDate: new Date(t.tradeDate),
            outcome,
            riskAmount: riskAmount || 100, // fallback if calculation fails
            mainRR: outcome === 'WIN' ? t.riskReward : null,
            partials: [],
            profitLoss: t.profitLoss,
            rMultiple: riskAmount > 0 ? t.profitLoss / riskAmount : (outcome === 'BE' ? 0 : -1),
            createdAt: new Date(t.createdAt),
          }
        }
        
        // New format: just convert dates
        return {
          ...t,
          tradeDate: new Date(t.tradeDate),
          createdAt: new Date(t.createdAt),
        }
      })
      // Persist migrated trades
      persist()
    } catch (e) {
      // Ignore parse errors
    }
  }
}

// Persist to localStorage
function persist() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('store_journals', JSON.stringify(journals))
    localStorage.setItem('store_trades', JSON.stringify(trades))
  }
}

// Journal operations
export function listJournals(): Journal[] {
  return journals
}

export function getJournal(id: string): Journal | undefined {
  return journals.find((j) => j.id === id)
}

export function createJournal(data: {
  name: string
  startingCapital: number
  currency: Currency
}): Journal {
  const newJournal: Journal = {
    id: Date.now().toString(),
    name: data.name,
    startingCapital: data.startingCapital,
    currentCapital: data.startingCapital,
    currency: data.currency,
    tradesCount: 0,
    lastUpdated: new Date(),
    createdAt: new Date(),
  }
  journals.push(newJournal)
  persist()
  emitChange()
  return newJournal
}

export function deleteJournal(id: string): void {
  journals = journals.filter((j) => j.id !== id)
  trades = trades.filter((t) => t.journalId !== id)
  persist()
  emitChange()
}

// Update journal capital based on trades
function updateJournalCapital(journalId: string): void {
  const journal = journals.find((j) => j.id === journalId)
  if (!journal) return

  const journalTrades = trades.filter((t) => t.journalId === journalId)
  const totalPL = journalTrades.reduce((sum, t) => sum + t.profitLoss, 0)
  
  journal.currentCapital = journal.startingCapital + totalPL
  journal.tradesCount = journalTrades.length
  journal.lastUpdated = new Date()
  
  persist()
  emitChange()
}

// Trade operations
export function listTrades(journalId: string): Trade[] {
  return trades
    .filter((t) => t.journalId === journalId)
    .sort((a, b) => b.tradeDate.getTime() - a.tradeDate.getTime())
}

export function addTrade(
  journalId: string,
  data: {
    tradeDate: Date
    outcome: TradeOutcome
    riskAmount: number
    mainRR: number | null
    partials: TradePartial[]
  }
): Trade {
  // Debug log
  if (process.env.NODE_ENV === 'development') {
    console.log('addTrade', journalId, data)
  }

  // Compute profitLoss and rMultiple
  const { profitLoss, rMultiple } = computeTrade({
    outcome: data.outcome,
    riskAmount: data.riskAmount,
    mainRR: data.mainRR,
    partials: data.partials,
  })

  const newTrade: Trade = {
    id: Date.now().toString(),
    journalId,
    tradeDate: data.tradeDate,
    outcome: data.outcome,
    riskAmount: data.riskAmount,
    mainRR: data.mainRR,
    partials: data.partials,
    profitLoss,
    rMultiple,
    createdAt: new Date(),
  }
  
  // Add trade to array
  trades.push(newTrade)
  
  // Update journal capital (this also persists and emits)
  updateJournalCapital(journalId)
  
  // Ensure trades are persisted and change is emitted
  persist()
  emitChange()
  
  // Debug log
  if (process.env.NODE_ENV === 'development') {
    console.log('addTrade completed', {
      tradeId: newTrade.id,
      journalId,
      totalTrades: trades.length,
      journalTrades: trades.filter((t) => t.journalId === journalId).length,
    })
  }
  
  return newTrade
}

export function updateTrade(
  tradeId: string,
  data: {
    tradeDate: Date
    outcome: TradeOutcome
    riskAmount: number
    mainRR: number | null
    partials: TradePartial[]
  }
): Trade | null {
  const tradeIndex = trades.findIndex((t) => t.id === tradeId)
  if (tradeIndex === -1) return null

  // Compute profitLoss and rMultiple
  const { profitLoss, rMultiple } = computeTrade({
    outcome: data.outcome,
    riskAmount: data.riskAmount,
    mainRR: data.mainRR,
    partials: data.partials,
  })

  const updatedTrade: Trade = {
    ...trades[tradeIndex],
    tradeDate: data.tradeDate,
    outcome: data.outcome,
    riskAmount: data.riskAmount,
    mainRR: data.mainRR,
    partials: data.partials,
    profitLoss,
    rMultiple,
  }

  trades[tradeIndex] = updatedTrade
  updateJournalCapital(updatedTrade.journalId)
  
  // Ensure trades are persisted and change is emitted
  persist()
  emitChange()
  
  return updatedTrade
}

export function deleteTrade(tradeId: string): boolean {
  const trade = trades.find((t) => t.id === tradeId)
  if (!trade) return false

  const journalId = trade.journalId
  trades = trades.filter((t) => t.id !== tradeId)
  updateJournalCapital(journalId)
  
  // Ensure trades are persisted and change is emitted
  persist()
  emitChange()
  
  return true
}

// Get current snapshot (for useSyncExternalStore)
// Returns a stable reference - only creates new object when data actually changes
export function getSnapshot() {
  // Return cached snapshot if available and data hasn't changed
  if (cachedSnapshot) {
    return cachedSnapshot
  }
  
  // Create new snapshot with new array references when data changes
  // This ensures React detects changes even if array contents are mutated
  cachedSnapshot = {
    journals: [...journals], // Create new array reference
    trades: [...trades],     // Create new array reference
  }
  
  return cachedSnapshot
}

// Get snapshot version for comparison (optional, for debugging)
export function getSnapshotVersion() {
  return snapshotVersion
}

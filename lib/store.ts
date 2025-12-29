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

export interface Trade {
  id: string
  journalId: string
  profitLoss: number
  riskReward: number
  tradeDate: Date
  createdAt: Date
}

// In-memory data storage
let journals: Journal[] = []
let trades: Trade[] = []
let listeners: Set<() => void> = new Set()

// Event emitter for React state synchronization
function emitChange() {
  listeners.forEach((listener) => listener())
}

// Subscribe to store changes
export function subscribe(listener: () => void) {
  listeners.add(listener)
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
    emitChange()
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
      trades = parsed.map((t: any) => ({
        ...t,
        tradeDate: new Date(t.tradeDate),
        createdAt: new Date(t.createdAt),
      }))
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
  return [...journals]
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
    profitLoss: number
    riskReward: number
    tradeDate: Date
  }
): Trade {
  const newTrade: Trade = {
    id: Date.now().toString(),
    journalId,
    profitLoss: data.profitLoss,
    riskReward: data.riskReward,
    tradeDate: data.tradeDate,
    createdAt: new Date(),
  }
  trades.push(newTrade)
  updateJournalCapital(journalId)
  return newTrade
}

// Get current snapshot (for useSyncExternalStore)
export function getSnapshot() {
  return { journals, trades }
}


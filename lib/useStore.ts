'use client'

import { useSyncExternalStore } from 'react'
import { subscribe, getSnapshot, listJournals, getJournal, listTrades } from './store'
import type { Journal, Trade } from './store'

/**
 * React hook to access the store
 * Uses useSyncExternalStore for proper React 18+ integration
 */
export function useStore() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot)

  return {
    journals: listJournals(),
    getJournal: (id: string) => getJournal(id),
    getTrades: (journalId: string) => listTrades(journalId),
  }
}

/**
 * Hook to get a specific journal
 */
export function useJournal(journalId: string): Journal | undefined {
  const { getJournal } = useStore()
  return getJournal(journalId)
}

/**
 * Hook to get trades for a journal
 */
export function useTrades(journalId: string): Trade[] {
  const { getTrades } = useStore()
  return getTrades(journalId)
}


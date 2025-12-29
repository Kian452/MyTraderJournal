'use client'

import { useSyncExternalStore, useMemo } from 'react'
import { subscribe, getSnapshot, getJournal } from './store'
import type { Journal, Trade } from './store'

/**
 * React hook to access the store
 * Uses useSyncExternalStore for proper React 18+ integration
 */
export function useStore() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot)
  
  // Memoize the return value to ensure stable references
  // snapshot is stable (same reference when data doesn't change)
  return useMemo(() => ({
    journals: snapshot.journals,
    getJournal: (id: string) => getJournal(id),
  }), [snapshot])
}

/**
 * Hook to get a specific journal
 */
export function useJournal(journalId: string): Journal | undefined {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot)
  
  return useMemo(() => {
    return snapshot.journals.find((j) => j.id === journalId)
  }, [snapshot.journals, journalId])
}

/**
 * Hook to get trades for a journal
 */
export function useTrades(journalId: string): Trade[] {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot)
  
  return useMemo(() => {
    return snapshot.trades
      .filter((t) => t.journalId === journalId)
      .sort((a, b) => b.tradeDate.getTime() - a.tradeDate.getTime())
  }, [snapshot.trades, journalId])
}

'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { fetchJournal } from '@/lib/api/journals'
import { fetchTrades, createTrade, updateTrade, deleteTrade, type Trade } from '@/lib/api/trades'
import JournalTabs from '@/components/journals/JournalTabs'
import TradesTable from '@/components/journals/TradesTable'
import JournalStats from '@/components/journals/JournalStats'
import AddTradeModal from '@/components/journals/AddTradeModal'
import ConfirmDialog from '@/components/dashboard/ConfirmDialog'
import EmptyState from '@/components/dashboard/EmptyState'
import type { Journal } from '@/lib/api/journals'

/**
 * Journal detail page
 * Shows journal header, tabs (Trades/Data), and content
 * Now uses API instead of in-memory store
 */
export default function JournalDetailPage() {
  const params = useParams()
  const journalId = params.journalId as string
  const [activeTab, setActiveTab] = useState<'trades' | 'data'>('trades')
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false)
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null)
  const [deleteTradeId, setDeleteTradeId] = useState<string | null>(null)
  
  // State for journal and trades
  const [journal, setJournal] = useState<Journal | null>(null)
  const [trades, setTrades] = useState<Trade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Fetch journal and trades in parallel
      const [journalData, tradesData] = await Promise.all([
        fetchJournal(journalId),
        fetchTrades(journalId),
      ])
      
      setJournal(journalData)
      setTrades(tradesData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load journal'
      setError(errorMessage)
      console.error('Error loading journal:', err)
    } finally {
      setIsLoading(false)
    }
  }, [journalId])

  // Fetch journal and trades on mount
  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAddTrade = () => {
    setEditingTrade(null)
    setIsTradeModalOpen(true)
  }

  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade)
    setIsTradeModalOpen(true)
  }

  const handleDeleteTrade = (tradeId: string) => {
    setDeleteTradeId(tradeId)
  }

  const confirmDeleteTrade = async () => {
    if (!deleteTradeId) return

    try {
      setIsDeleting(true)
      setError(null)
      await deleteTrade(deleteTradeId)
      // Remove from state
      setTrades((prev) => prev.filter((t) => t.id !== deleteTradeId))
      // Reload journal to get updated aggregates
      if (journal) {
        const updatedJournal = await fetchJournal(journalId)
        setJournal(updatedJournal)
      }
      setDeleteTradeId(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete trade'
      setError(errorMessage)
      console.error('Error deleting trade:', err)
      setDeleteTradeId(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleTradeSubmit = async (data: {
    tradeDate: Date
    outcome: 'WIN' | 'LOSS' | 'BE'
    riskAmount: number
    mainRR: number | null
    partials: Array<{ sizeFraction: number; rr: number }>
  }) => {
    try {
      setError(null)
      
      // Convert partials from sizeFraction to percentage for API
      const partialsForAPI = data.partials.map((p) => ({
        percentage: p.sizeFraction * 100,
        rr: p.rr,
      }))

      if (editingTrade) {
        // Update existing trade
        const updatedTrade = await updateTrade(editingTrade.id, {
          tradeDate: data.tradeDate,
          outcome: data.outcome,
          riskAmount: data.riskAmount,
          mainRR: data.mainRR,
          partials: partialsForAPI,
        })
        
        // Update in state
        setTrades((prev) =>
          prev.map((t) => (t.id === updatedTrade.id ? updatedTrade : t))
        )
      } else {
        // Create new trade
        const newTrade = await createTrade(journalId, {
          tradeDate: data.tradeDate,
          outcome: data.outcome,
          riskAmount: data.riskAmount,
          mainRR: data.mainRR,
          partials: partialsForAPI,
        })
        
        // Add to state
        setTrades((prev) => [newTrade, ...prev])
      }
      
      // Reload journal to get updated aggregates
      if (journal) {
        const updatedJournal = await fetchJournal(journalId)
        setJournal(updatedJournal)
      }
      
      // Close modal
      setIsTradeModalOpen(false)
      setEditingTrade(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save trade'
      setError(errorMessage)
      console.error('Error saving trade:', err)
    }
  }

  if (isLoading) {
    return (
      <div>
        <Link
          href="/dashboard/journals"
          className="text-blue-400 hover:text-blue-300 mb-6 inline-block"
        >
          ← Back to Journals
        </Link>
        <div className="text-center py-12">
          <p className="text-gray-400">Loading journal...</p>
        </div>
      </div>
    )
  }

  if (error && !journal) {
    return (
      <div>
        <Link
          href="/dashboard/journals"
          className="text-blue-400 hover:text-blue-300 mb-6 inline-block"
        >
          ← Back to Journals
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Error</h1>
        <p className="text-gray-400">{error}</p>
      </div>
    )
  }

  if (!journal) {
    return (
      <div>
        <Link
          href="/dashboard/journals"
          className="text-blue-400 hover:text-blue-300 mb-4 inline-block"
        >
          ← Back to Journals
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Journal Not Found</h1>
        <p className="text-gray-400">
          The journal you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: journal.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div>
      {/* Back Link */}
      <Link
        href="/dashboard/journals"
        className="text-blue-400 hover:text-blue-300 mb-6 inline-block"
      >
        ← Back to Journals
      </Link>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-md text-red-400">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-300 hover:text-red-200"
          >
            ×
          </button>
        </div>
      )}

      {/* Journal Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{journal.name}</h1>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <div>
                <span className="text-gray-500">Current Capital: </span>
                <span className="text-white font-semibold text-lg">
                  {formatCurrency(journal.currentCapital)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Starting Capital: </span>
                <span className="text-gray-300">
                  {formatCurrency(journal.startingCapital)}
                </span>
              </div>
            </div>
          </div>
          {activeTab === 'trades' && (
            <button
              onClick={handleAddTrade}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Add Trade
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <JournalTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        {activeTab === 'trades' ? (
          <div>
            {trades.length === 0 ? (
              <EmptyState
                title="No trades yet"
                description="Add your first trade to start tracking your performance."
              />
            ) : (
              <TradesTable
                trades={trades.map((t) => ({
                  ...t,
                  tradeDate: new Date(t.tradeDate),
                  createdAt: new Date(t.createdAt),
                }))}
                currency={journal.currency}
                onEdit={handleEditTrade}
                onDelete={handleDeleteTrade}
              />
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">Analytics</h2>
            <JournalStats
              trades={trades.map((t) => ({
                ...t,
                tradeDate: new Date(t.tradeDate),
                createdAt: new Date(t.createdAt),
              }))}
              startingCapital={journal.startingCapital}
              currentCapital={journal.currentCapital}
              currency={journal.currency}
            />
          </div>
        )}
      </div>

      {/* Trade Modal (Add/Edit) */}
      <AddTradeModal
        isOpen={isTradeModalOpen}
        onClose={() => {
          setIsTradeModalOpen(false)
          setEditingTrade(null)
        }}
        onSubmit={handleTradeSubmit}
        mode={editingTrade ? 'edit' : 'add'}
        initialTrade={editingTrade ? {
          ...editingTrade,
          tradeDate: new Date(editingTrade.tradeDate),
          createdAt: new Date(editingTrade.createdAt),
        } : undefined}
        currency={journal.currency}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteTradeId !== null}
        onClose={() => !isDeleting && setDeleteTradeId(null)}
        onConfirm={confirmDeleteTrade}
        title="Delete trade?"
        message="This will permanently remove this trade from the journal."
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        cancelLabel="Cancel"
        confirmVariant="danger"
      />
    </div>
  )
}

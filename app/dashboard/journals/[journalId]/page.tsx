'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { useJournal, useTrades } from '@/lib/useStore'
import { addTrade } from '@/lib/store'
import JournalTabs from '@/components/journals/JournalTabs'
import TradesTable from '@/components/journals/TradesTable'
import JournalStats from '@/components/journals/JournalStats'
import AddTradeModal from '@/components/journals/AddTradeModal'
import EmptyState from '@/components/dashboard/EmptyState'

/**
 * Journal detail page
 * Shows journal header, tabs (Trades/Data), and content
 */
export default function JournalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const journalId = params.journalId as string
  const [activeTab, setActiveTab] = useState<'trades' | 'data'>('trades')
  const [isAddTradeModalOpen, setIsAddTradeModalOpen] = useState(false)

  const journal = useJournal(journalId)
  const trades = useTrades(journalId)

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
          The journal you're looking for doesn't exist.
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

  const handleAddTrade = (data: {
    tradeDate: Date
    outcome: 'WIN' | 'LOSS' | 'BE'
    riskAmount: number
    mainRR: number | null
    partials: Array<{ sizeFraction: number; rr: number }>
  }) => {
    addTrade(journalId, data)
    setIsAddTradeModalOpen(false)
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
              onClick={() => setIsAddTradeModalOpen(true)}
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
              <TradesTable trades={trades} currency={journal.currency} />
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">Analytics</h2>
            <JournalStats
              trades={trades}
              startingCapital={journal.startingCapital}
              currentCapital={journal.currentCapital}
              currency={journal.currency}
            />
          </div>
        )}
      </div>

      {/* Add Trade Modal */}
      <AddTradeModal
        isOpen={isAddTradeModalOpen}
        onClose={() => setIsAddTradeModalOpen(false)}
        onSubmit={handleAddTrade}
      />
    </div>
  )
}

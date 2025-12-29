'use client'

import { useParams } from 'next/navigation'
import { useState } from 'react'
import { getMockJournal } from '@/lib/mockJournals'

/**
 * Journal detail page
 * TODO: Add trades list and data views
 */
export default function JournalDetailPage() {
  const params = useParams()
  const journalId = params.journalId as string
  const [activeTab, setActiveTab] = useState<'trades' | 'data'>('trades')

  const journal = getMockJournal(journalId)

  if (!journal) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Journal Not Found</h1>
        <p className="text-gray-400">The journal you're looking for doesn't exist.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{journal.name}</h1>
        <p className="text-gray-400">Journal ID: {journalId}</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('trades')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'trades'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Trades
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'data'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Data
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        {activeTab === 'trades' ? (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Trades</h2>
            <p className="text-gray-400">Trades list will appear here.</p>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Data</h2>
            <p className="text-gray-400">Journal data view will appear here.</p>
          </div>
        )}
      </div>
    </div>
  )
}


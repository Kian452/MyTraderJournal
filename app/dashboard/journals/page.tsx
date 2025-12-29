'use client'

import { useState, useEffect } from 'react'
import { getMockJournals, Journal } from '@/lib/mockJournals'
import JournalCard from '@/components/dashboard/JournalCard'
import EmptyState from '@/components/dashboard/EmptyState'
import CreateJournalModal from '@/components/dashboard/CreateJournalModal'

/**
 * Journals page
 * Displays all journals in a grid or empty state
 */
export default function JournalsPage() {
  const [journals, setJournals] = useState<Journal[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    // Load mock journals
    setJournals(getMockJournals())

    // Listen for custom event to open modal from header button
    const handleOpenModal = () => {
      setIsModalOpen(true)
    }

    window.addEventListener('openCreateJournalModal', handleOpenModal)

    return () => {
      window.removeEventListener('openCreateJournalModal', handleOpenModal)
    }
  }, [])

  const handleCreateJournal = () => {
    setIsModalOpen(true)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Journals</h1>
          <p className="text-gray-400">
            Manage your trading journals and track your performance
          </p>
        </div>
        <button
          onClick={handleCreateJournal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          + New Journal
        </button>
      </div>

      {/* Content */}
      {journals.length === 0 ? (
        <EmptyState
          title="You don't have any journals yet"
          description="Create a journal to track trades, refine your strategy, and analyze performance."
          actionLabel="+ Create journal"
          onAction={handleCreateJournal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {journals.map((journal) => (
            <JournalCard key={journal.id} journal={journal} />
          ))}
        </div>
      )}

      {/* Create Journal Modal */}
      <CreateJournalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}

